'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function searchCourses(query: string) {
    const session = await auth()
    if (!session?.user?.id) return []

    if (!query || query.length < 2) return []

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { schoolId: true }
    })

    if (!user?.schoolId) return []

    const courses = await prisma.course.findMany({
        where: {
            schoolId: user.schoolId,
            OR: [
                { code: { contains: query, mode: 'insensitive' } },
                { name: { contains: query, mode: 'insensitive' } }
            ]
        },
        take: 10,
        select: {
            id: true,
            code: true,
            name: true
        }
    })

    return courses
}

export async function toggleCourseEnrollment(courseId: string, type: 'ACTIVE' | 'COMPLETED') {
    const session = await auth()
    if (!session?.user?.id) return { error: 'Unauthorized' }

    const userId = session.user.id

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { enrolledCourseIds: true, completedCourseIds: true }
        })

        if (!user) return { error: 'User not found' }

        let active = user.enrolledCourseIds || []
        let completed = user.completedCourseIds || []

        if (type === 'ACTIVE') {
            if (active.includes(courseId)) {
                active = active.filter(id => id !== courseId)
            } else {
                active = [...active, courseId]
                // If moving to active, remove from completed if present
                completed = completed.filter(id => id !== courseId)
            }
        } else {
            if (completed.includes(courseId)) {
                completed = completed.filter(id => id !== courseId)
            } else {
                completed = [...completed, courseId]
                // If moving to completed, remove from active if present
                active = active.filter(id => id !== courseId)
            }
        }

        await prisma.user.update({
            where: { id: userId },
            data: {
                enrolledCourseIds: active,
                completedCourseIds: completed
            }
        })

        revalidatePath('/dashboard')
        revalidatePath('/profile')
        revalidatePath('/onboarding/courses')

        return { success: true, active, completed }

    } catch (error) {
        console.error('Failed to toggle course:', error)
        return { error: 'Failed to update courses' }
    }
}

export async function getEnrolledCoursesDetails() {
    const session = await auth()
    if (!session?.user?.id) return []

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { enrolledCourseIds: true }
    })

    if (!user?.enrolledCourseIds || user.enrolledCourseIds.length === 0) return []

    const courses = await prisma.course.findMany({
        where: { id: { in: user.enrolledCourseIds } },
        select: {
            id: true,
            code: true,
            name: true,
            schoolId: true
        }
    })

    return courses
}
