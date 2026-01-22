'use server'

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export interface RecommendedUser {
    id: string
    name: string | null
    image: string | null
    schoolName: string | null
    sharedCourseCount: number
    sharedCourseCodes: string[]
}

export async function getRecommendedUsers(): Promise<RecommendedUser[]> {
    const session = await auth()
    if (!session?.user?.id) return []

    const currentUserId = session.user.id

    // 1. Get current user's context (courses, friends)
    const currentUser = await prisma.user.findUnique({
        where: { id: currentUserId },
        select: {
            enrolledCourseIds: true,
            sentFriendRequests: { select: { addresseeId: true } },
            receivedFriendRequests: { select: { requesterId: true } }
        }
    })

    if (!currentUser) return []

    const enrolledIds = currentUser.enrolledCourseIds
    if (enrolledIds.length === 0) return []

    // 2. Identify excluded user IDs (self + existing relations)
    const excludedIds = new Set([
        currentUserId,
        ...currentUser.sentFriendRequests.map(r => r.addresseeId),
        ...currentUser.receivedFriendRequests.map(r => r.requesterId)
    ])

    // 3. Find candidate users
    // We want users who have at least one course ID in common.
    // We prioritize those who share the *most* courses or are in the same school implicitly.
    const candidates = await prisma.user.findMany({
        where: {
            id: { notIn: Array.from(excludedIds) },
            enrolledCourseIds: { hasSome: enrolledIds }
        },
        select: {
            id: true,
            name: true,
            image: true,
            enrolledCourseIds: true,
            school: { select: { name: true } }
        },
        take: 20 // Fetch a pool to sort
    })

    // 4. Processing & Ranking
    const processed = candidates.map(user => {
        // Find intersection
        const shared = user.enrolledCourseIds.filter(id => enrolledIds.includes(id))

        return {
            id: user.id,
            name: user.name,
            image: user.image,
            schoolName: user.school?.name || null,
            sharedCourseIds: shared,
            sharedCourseCount: shared.length
        }
    })

    // Sort by shared count descending
    processed.sort((a, b) => b.sharedCourseCount - a.sharedCourseCount)

    // Take top 5 for display
    const topPicks = processed.slice(0, 5)

    if (topPicks.length === 0) return []

    // 5. Fetch Course Codes for context
    const allSharedIds = new Set<string>()
    topPicks.forEach(p => p.sharedCourseIds.forEach(id => allSharedIds.add(id)))

    const courses = await prisma.course.findMany({
        where: { id: { in: Array.from(allSharedIds) } },
        select: { id: true, code: true }
    })

    const courseMap = new Map(courses.map(c => [c.id, c.code]))

    // Final mapping
    return topPicks.map(rec => ({
        id: rec.id,
        name: rec.name,
        image: rec.image,
        schoolName: rec.schoolName,
        sharedCourseCount: rec.sharedCourseCount,
        sharedCourseCodes: rec.sharedCourseIds.map(id => courseMap.get(id) || 'Unknown')
    }))
}
