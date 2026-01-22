'use server'

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

// --- FOLLOW SYSTEM ---

export async function followUser(targetId: string) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Unauthenticated" }

    const followerId = session.user.id

    // Check if already following
    const existing = await prisma.follow.findUnique({
        where: {
            followerId_followingId: {
                followerId,
                followingId: targetId
            }
        }
    })

    if (existing) {
        // Unfollow
        await prisma.follow.delete({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId: targetId
                }
            }
        })
        revalidatePath(`/profile/${targetId}`)
        return { success: true, isFollowing: false }
    } else {
        // Follow
        await prisma.follow.create({
            data: {
                followerId,
                followingId: targetId
            }
        })
        revalidatePath(`/profile/${targetId}`)
        return { success: true, isFollowing: true }
    }
}

// --- KARMA & VOTING ---

export async function toggleVote(type: 'RESOURCE' | 'REVIEW' | 'COMMENT', targetId: string) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Unauthenticated" }
    const userId = session.user.id

    // Check existing vote
    // Note: Schema uses separate nullable fields for targets
    const whereClause: any = { userId }
    if (type === 'RESOURCE') whereClause.resourceId = targetId
    if (type === 'REVIEW') whereClause.reviewId = targetId
    if (type === 'COMMENT') whereClause.commentId = targetId

    // Find unique constraint requires composite key or manual check
    // Since unique is [userId, resourceId], we can search using findFirst or unique if Prisma generated composite unique type
    // Prisma generates unique compound constraint, so we can use findUnique with composite key input
    // But findUnique requires arguments to match the @@unique definition.
    // e.g. userId_resourceId: { userId, resourceId }

    let existing = null;
    let uniqueKey: any = {}

    if (type === 'RESOURCE') {
        uniqueKey = { userId_resourceId: { userId, resourceId: targetId } }
        existing = await prisma.upvote.findUnique({ where: uniqueKey })
    } else if (type === 'REVIEW') {
        uniqueKey = { userId_reviewId: { userId, reviewId: targetId } }
        existing = await prisma.upvote.findUnique({ where: uniqueKey })
    } else {
        uniqueKey = { userId_commentId: { userId, commentId: targetId } }
        existing = await prisma.upvote.findUnique({ where: uniqueKey })
    }

    if (existing) {
        // Remove vote (Toggle off)
        await prisma.upvote.delete({ where: uniqueKey })

        // DECREMENT User Karma
        // We need to find the author of the content to decrement their karma
        const authorId = await getAuthorId(type, targetId)
        if (authorId) {
            await prisma.user.update({
                where: { id: authorId },
                data: { karma: { decrement: 1 } }
            })
        }
        revalidatePath('/')
        return { voted: false }
    } else {
        // Add vote
        await prisma.upvote.create({
            data: {
                userId,
                resourceId: type === 'RESOURCE' ? targetId : undefined,
                reviewId: type === 'REVIEW' ? targetId : undefined,
                commentId: type === 'COMMENT' ? targetId : undefined,
            }
        })

        // INCREMENT User Karma
        const authorId = await getAuthorId(type, targetId)
        if (authorId) {
            await prisma.user.update({
                where: { id: authorId },
                data: { karma: { increment: 1 } }
            })
        }
        revalidatePath('/')
        return { voted: true }
    }
}

async function getAuthorId(type: string, id: string) {
    if (type === 'RESOURCE') {
        const item = await prisma.resource.findUnique({ where: { id }, select: { userId: true } })
        return item?.userId
    }
    if (type === 'REVIEW') {
        const item = await prisma.review.findUnique({ where: { id }, select: { userId: true } })
        return item?.userId
    }
    if (type === 'COMMENT') {
        const item = await prisma.comment.findUnique({ where: { id }, select: { userId: true } })
        return item?.userId
    }
    return null;
}

// --- RESOURCES ---

export async function uploadResource(courseId: string, url: string, title: string, fileType: string = 'PDF') {
    const session = await auth()
    if (!session?.user?.id) return { error: "Unauthenticated" }

    await prisma.resource.create({
        data: {
            title,
            url,
            fileType,
            courseId,
            userId: session.user.id
        }
    })
    revalidatePath(`/courses/${courseId}`)
    return { success: true }
}

// --- FEED AGGREGATION ---

// --- FEED AGGREGATION ---

export async function getPersonalizedFeed(filter: 'ALL' | 'TRENDING' = 'ALL') {
    const session = await auth()
    if (!session?.user?.id) return { error: "Unauthenticated", items: [] }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { following: true }
    })

    if (!user) return { items: [] }

    const followingIds = user.following.map(f => f.followingId)
    const schoolId = user.schoolId
    const enrolledIds = user.enrolledCourseIds

    // Base Filters
    const baseWhere = filter === 'TRENDING'
        ? { // Trending: Strict to School Scope & Visible
            user: { schoolId: schoolId || undefined },
            isVisible: true
        }
        : { // All: Following + School + Enrolled
            OR: [
                { userId: { in: followingIds } },
                { user: { schoolId: schoolId || undefined } },
                { courseId: { in: enrolledIds } }
            ],
            isVisible: true
        }

    // Sort Strategy
    const orderBy: any = filter === 'TRENDING'
        ? { upvotes: { _count: 'desc' } } // Sort by most votes
        : { createdAt: 'desc' }           // Sort by newest

    // Fetch REVIEWS
    const reviews = await prisma.review.findMany({
        where: baseWhere,
        take: 10,
        orderBy,
        include: { user: true, course: true, professor: true, upvotes: true }
    })

    // Fetch THREADS
    // Threads don't have upvotes in this schema version (only comments), so for trending we use comment count
    const threads = await prisma.thread.findMany({
        where: baseWhere as any, // Schema limitations might vary
        take: 10,
        orderBy: filter === 'TRENDING' ? { comments: { _count: 'desc' } } : { createdAt: 'desc' },
        include: { user: true, course: true, _count: { select: { comments: true } } }
    })

    // Fetch RESOURCES
    const resources = await prisma.resource.findMany({
        where: filter === 'TRENDING'
            ? { course: { schoolId: schoolId || undefined } }
            : {
                OR: [
                    { userId: { in: followingIds } },
                    { courseId: { in: enrolledIds } },
                    { course: { schoolId: schoolId || undefined } }
                ]
            },
        take: 5,
        orderBy,
        include: { user: true, course: true, upvotes: true }
    })

    // Merge and Sort (Re-sort combined list purely by date if 'ALL', or mix score if 'TRENDING')
    // For simplicity, we just interleave them. If TRENDING, we rely on the individual fetches being high quality.
    let feedItems = [
        ...reviews.map(r => ({ type: 'REVIEW', data: r, date: r.createdAt, score: r.upvotes?.length || 0 })),
        ...threads.map(t => ({ type: 'THREAD', data: t, date: t.createdAt, score: t._count?.comments || 0 })),
        ...resources.map(r => ({ type: 'RESOURCE', data: r, date: r.createdAt, score: r.upvotes?.length || 0 }))
    ]

    if (filter === 'TRENDING') {
        feedItems.sort((a, b) => b.score - a.score)
    } else {
        feedItems.sort((a, b) => b.date.getTime() - a.date.getTime())
    }

    return { items: feedItems, user }
}

// --- FRIENDSHIP SYSTEM ---

export async function sendFriendRequest(targetUserId: string) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Unauthenticated" }

    const requesterId = session.user.id

    // Check existing request or friendship
    const existing = await prisma.friendship.findUnique({
        where: {
            requesterId_addresseeId: {
                requesterId,
                addresseeId: targetUserId
            }
        }
    })

    const reverse = await prisma.friendship.findUnique({
        where: {
            requesterId_addresseeId: {
                requesterId: targetUserId,
                addresseeId: requesterId
            }
        }
    })

    if (existing || reverse) {
        return { error: "Friendship or request already exists" }
    }

    await prisma.friendship.create({
        data: {
            requesterId,
            addresseeId: targetUserId,
            status: 'PENDING'
        }
    })

    revalidatePath('/')
    return { success: true }
}

export async function updateFriendRequestStatus(requestId: string, status: 'ACCEPTED' | 'DECLINED') {
    const session = await auth()
    if (!session?.user?.id) return { error: "Unauthenticated" }

    await prisma.friendship.update({
        where: { id: requestId },
        data: { status }
    })

    revalidatePath('/')
    return { success: true }
}

export async function getFriends() {
    const session = await auth()
    if (!session?.user?.id) return []

    const userId = session.user.id

    const friendships = await prisma.friendship.findMany({
        where: {
            OR: [
                { requesterId: userId, status: 'ACCEPTED' },
                { addresseeId: userId, status: 'ACCEPTED' }
            ]
        },
        include: {
            requester: true,
            addressee: true
        }
    })

    // Map to just the OTHER user
    return friendships.map(f => f.requesterId === userId ? f.addressee : f.requester)
}

export async function getPendingRequests() {
    const session = await auth()
    if (!session?.user?.id) return { incoming: [], outgoing: [] }

    const userId = session.user.id

    const incoming = await prisma.friendship.findMany({
        where: {
            addresseeId: userId,
            status: 'PENDING'
        },
        include: { requester: true }
    })

    const outgoing = await prisma.friendship.findMany({
        where: {
            requesterId: userId,
            status: 'PENDING'
        },
        include: { addressee: true }
    })

    return { incoming, outgoing }
}

export async function getCommonCourses(targetUserId: string) {
    const session = await auth()
    if (!session?.user?.id) return []

    const myId = session.user.id
    
    const me = await prisma.user.findUnique({
        where: { id: myId },
        select: { enrolledCourseIds: true }
    })

    const them = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: { enrolledCourseIds: true }
    })

    if (!me || !them) return []

    const commonIds = me.enrolledCourseIds.filter(id => them.enrolledCourseIds.includes(id))

    if (commonIds.length === 0) return []

    const courses = await prisma.course.findMany({
        where: {
            id: { in: commonIds }
        }
    })

    return courses
}
