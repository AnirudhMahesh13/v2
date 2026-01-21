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

export async function getPersonalizedFeed() {
    const session = await auth()
    // If not logged in, show global trending? for now return empty or simple list
    if (!session?.user?.id) return { error: "Unauthenticated", items: [] }

    // Get User's following, school, and enrolled courses
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { following: true }
    })

    if (!user) return { items: [] }

    const followingIds = user.following.map(f => f.followingId)
    const schoolId = user.schoolId
    const enrolledIds = user.enrolledCourseIds

    // Fetch REVIEWS (from followed users OR same school OR enrolled courses)
    const reviews = await prisma.review.findMany({
        where: {
            OR: [
                { userId: { in: followingIds } },
                { user: { schoolId: schoolId || undefined } }, // If schoolId exists
                { courseId: { in: enrolledIds } }
            ],
            isVisible: true
        },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: true, course: true, professor: true, upvotes: true }
    })

    // Fetch THREADS
    const threads = await prisma.thread.findMany({
        where: {
            OR: [
                { userId: { in: followingIds } },
                { user: { schoolId: schoolId || undefined } },
                { courseId: { in: enrolledIds } }
            ],
            isVisible: true
        },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: true, course: true, _count: { select: { comments: true } } }
    })

    // Fetch RESOURCES
    const resources = await prisma.resource.findMany({
        where: {
            OR: [
                { userId: { in: followingIds } },
                { courseId: { in: enrolledIds } },
                // Resources usually tied to course, so mainly enrolled
                { course: { schoolId: schoolId || undefined } }
            ]
        },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: true, course: true, upvotes: true }
    })

    // Merge and Sort
    const feedItems = [
        ...reviews.map(r => ({ type: 'REVIEW', data: r, date: r.createdAt })),
        ...threads.map(t => ({ type: 'THREAD', data: t, date: t.createdAt })),
        ...resources.map(r => ({ type: 'RESOURCE', data: r, date: r.createdAt }))
    ].sort((a, b) => b.date.getTime() - a.date.getTime())

    return { items: feedItems, user }
}
