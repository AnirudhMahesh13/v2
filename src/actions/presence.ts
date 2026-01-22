'use server'

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

// Fetch friends who have been active in the last 5 minutes
export async function getOnlineFriends() {
    const session = await auth()
    if (!session?.user?.id) return []

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)

    // 1. Get IDs of accepted friends (Mutuals)
    const friendships = await prisma.friendship.findMany({
        where: {
            OR: [
                { requesterId: session.user.id, status: 'ACCEPTED' },
                { addresseeId: session.user.id, status: 'ACCEPTED' }
            ]
        },
        select: {
            requesterId: true,
            addresseeId: true
        }
    })

    const friendIds = friendships.map(f => f.requesterId === session.user.id ? f.addresseeId : f.requesterId)

    // 2. Find which of them are active
    const onlineFriends = await prisma.user.findMany({
        where: {
            id: { in: friendIds },
            lastActive: { gte: fiveMinutesAgo }
        },
        select: {
            id: true,
            name: true,
            image: true,
            lastActive: true,
            // In a real app we might fetch what they are doing (e.g. current page url) 
            // but we don't track that granularly yet.
        }
    })

    return onlineFriends
}

// Get count of active users in a course (for Library Widget)
export async function getCoursePresenceCount(courseId: string) {
    // Ideally we track "current page" or "enrolled active". 
    // For now, approximate with "Active Platform Users who are Enrolled in this Course"
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)

    // Check Enrolled Active Users
    // Limitation: Prisma string array filtering
    const count = await prisma.user.count({
        where: {
            lastActive: { gte: fiveMinutesAgo },
            enrolledCourseIds: { has: courseId }
        }
    })

    return count
}
