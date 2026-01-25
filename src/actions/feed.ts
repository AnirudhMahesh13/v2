'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

// Fetch logic with cursor pagination & algorithm
export async function getFeed({ cursor, schoolId }: { cursor?: string, schoolId: string }) {
    const session = await auth()
    const currentUserId = session?.user?.id

    if (!currentUserId) return { posts: [], nextCursor: null }

    const limit = 5

    // ALGORITHM PRIORITY:
    // 1. Course Overlap (implicit for now via simple fetch)
    // 2. Recency
    // Future: Use raw SQL to weigh posts from enrolled courses higher

    // For MVP: Fetch posts from the user's school, ordered by createdAt desc
    const posts = await prisma.post.findMany({
        take: limit + 1, // Fetch one extra to determine next cursor
        cursor: cursor ? { id: cursor } : undefined,
        where: schoolId ? {
            user: { schoolId: schoolId }
        } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
            user: {
                select: { id: true, name: true, image: true, lastActive: true }
            },
            course: {
                select: { id: true, code: true, name: true }
            },
            engagements: {
                where: { userId: currentUserId, type: 'LIKE' }
            },
            _count: {
                select: { engagements: { where: { type: 'LIKE' } } }
            }
        }
    })

    let nextCursor: string | null = null
    if (posts.length > limit) {
        const nextItem = posts.pop()
        nextCursor = nextItem!.id
    }

    // Transform for UI
    const enrichedPosts = posts.map(post => ({
        ...post,
        isLiked: post.engagements.length > 0,
        likeCount: post._count.engagements // Use dynamic count or stored count
    }))

    return { posts: enrichedPosts, nextCursor }
}

export async function toggleLike(postId: string) {
    const session = await auth()
    if (!session?.user?.id) return { success: false }

    const userId = session.user.id

    const existing = await prisma.engagement.findUnique({
        where: {
            userId_postId_type: {
                userId,
                postId,
                type: 'LIKE'
            }
        }
    })

    if (existing) {
        await prisma.engagement.delete({ where: { id: existing.id } })
        return { success: true, liked: false }
    } else {
        await prisma.engagement.create({
            data: {
                userId,
                postId,
                type: 'LIKE'
            }
        })
        return { success: true, liked: true }
    }
}

export async function trackView(postId: string) {
    const session = await auth()
    if (!session?.user?.id) return

    // Simple view tracking
    // prevent duplicate view types per session implementation left as exercise
    // just fire and forget for MVP stats
    await prisma.engagement.create({
        data: {
            userId: session.user.id,
            postId,
            type: 'VIEW'
        }
    }).catch(() => { }) // Ignore unique constraint violations
}

export async function getDiscussions({ cursor, schoolId }: { cursor?: string, schoolId: string }) {
    const limit = 10

    // We cannot efficiently cursor paginate mixed types from different tables without a complex setup.
    // For this MVP, we will fetch the top N recent items from EACH table and merge them, using an offset logic or just timestamps.
    // However, if we receive a cursor, we assume it's a timestamp or ID based cursor which is tricky for mixed types.
    // Simplified strategy: Fetch 10 of each, merge, sort, take top 10. 
    // This doesn't scale perfectly but works for populated feeds.

    // 1. Fetch Threads
    const threads = await prisma.thread.findMany({
        take: limit,
        where: schoolId ? { user: { schoolId: schoolId } } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
            user: { select: { id: true, name: true, image: true } },
            course: { select: { id: true, code: true, name: true } },
            _count: { select: { comments: true } }
        }
    })

    // 2. Fetch Reviews
    const reviews = await prisma.review.findMany({
        take: limit,
        where: schoolId ? { user: { schoolId: schoolId } } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
            user: { select: { id: true, name: true, image: true } },
            course: { select: { id: true, code: true, name: true } },
            professor: { select: { id: true, name: true } }
        }
    })

    // 3. Fetch Bounties
    const bounties = await prisma.bounty.findMany({
        take: limit,
        where: schoolId ? { user: { schoolId: schoolId } } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
            user: { select: { id: true, name: true, image: true } },
            course: { select: { id: true, code: true, name: true } }
        }
    })

    // Tag and Merge
    const allItems = [
        ...threads.map(t => ({ ...t, type: 'THREAD' })),
        ...reviews.map(r => ({ ...r, type: 'REVIEW' })),
        ...bounties.map(b => ({ ...b, type: 'BOUNTY' }))
    ]

    // Sort by Date Descending
    allItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Apply "Pseudo-Cursor" - if cursor exists (ID), we skip items until we find it, then take next.
    // Warning: This is O(N) scan of the top combined items. 
    // Improvement: We will just return the top sorted list for now. Pagination for mixed feeds requires a dedicated Feed table or specialized cursor (e.g. timestamp).
    // Let's implement timestamp-based pagination roughly if needed, but for now just returning the fresh mix is standard for "Discover".

    // Return Top 20 mixed
    const mixedFeed = allItems.slice(0, 20)

    return { threads: mixedFeed, nextCursor: null } // Disable infinite scroll for mixed feed MVP to avoid complexity
}
