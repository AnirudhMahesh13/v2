
'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { cache } from 'react'

export const getProfileData = cache(async (targetUserId: string) => {
    const session = await auth()
    const currentUserId = session?.user?.id

    const user = await prisma.user.findUnique({
        where: { id: targetUserId },
        include: {
            school: true,
            _count: {
                select: {
                    followedBy: true,
                    following: true,
                    clubMemberships: true
                }
            },
            // Fetch Clubs
            clubMemberships: {
                include: {
                    club: true
                }
            },
            // Fetch recent activity (Posts for now)
            posts: {
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: { select: { engagements: true } }
                }
            },
            // Fetch Resources
            resources: {
                take: 6,
                orderBy: { createdAt: 'desc' },
                include: {
                    course: true,
                    _count: { select: { upvotes: true } }
                }
            }
        }
    })

    if (!user) return null

    // Resolve Enrolled Courses (Array of strings -> Objects)
    // In a real app avoiding N+1, but here IDs are on the user model
    const enrolledCourses = await prisma.course.findMany({
        where: {
            id: { in: user.enrolledCourseIds }
        }
    })

    // Calculate Common Ground (if viewing someone else)
    let commonGround = {
        courses: [] as any[],
        clubs: [] as any[]
    }

    if (currentUserId && currentUserId !== targetUserId) {
        const currentUser = await prisma.user.findUnique({
            where: { id: currentUserId },
            include: { clubMemberships: true }
        })

        if (currentUser) {
            // Shared Courses
            commonGround.courses = enrolledCourses.filter(c =>
                currentUser.enrolledCourseIds.includes(c.id)
            )

            // Shared Clubs
            const myClubIds = currentUser.clubMemberships.map(m => m.clubId)
            commonGround.clubs = (user as any).clubMemberships
                .filter((m: any) => myClubIds.includes(m.clubId))
                .map((m: any) => m.club)
        }
    }

    // Check if following
    let isFollowing = false
    if (currentUserId) {
        const follow = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: currentUserId,
                    followingId: targetUserId
                }
            }
        })
        isFollowing = !!follow
    }

    return {
        user: user as any,
        enrolledCourses,
        commonGround,
        isFollowing,
        isOwnProfile: currentUserId === targetUserId
    }
})
