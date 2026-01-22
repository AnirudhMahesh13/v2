import { NextResponse } from 'next/server'
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.user.update({
        where: { id: session.user.id },
        data: { lastActive: new Date() }
    })

    return NextResponse.json({ success: true })
}

export async function GET(req: Request) {
    // Get active users in the last 5 minutes
    try {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)

        // This query requires filtering users. 
        // For a specific course context, we'd need to fetch users who are enrolled in the course AND active.
        // Or simply global active users for now.
        // Let's support an optional ?courseId query param if we had Enrollments fully tracked.
        // For now, let's just return global active count or active users reference.

        const url = new URL(req.url)
        const courseId = url.searchParams.get('courseId')

        let whereClause: any = {
            lastActive: { gte: fiveMinutesAgo }
        }

        if (courseId) {
            // Filter by enrolled?
            whereClause.enrolledCourseIds = { has: courseId }
        }

        const activeUsers = await prisma.user.findMany({
            where: whereClause,
            select: { id: true, name: true, image: true, lastActive: true },
            take: 10
        })

        return NextResponse.json({ users: activeUsers })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch presence' }, { status: 500 })
    }
}
