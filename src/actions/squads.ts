'use server'

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

// --- SQUAD MESSAGING ---

export async function sendMessage(courseId: string, content: string) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Unauthenticated" }

    // Find or create squad for the course
    // In a real app we might only create when course is created, but here we can lazy load
    let squad = await prisma.squad.findUnique({ where: { courseId } })
    if (!squad) {
        squad = await prisma.squad.create({ data: { courseId } })
    }

    await prisma.squadMessage.create({
        data: {
            content,
            squadId: squad.id,
            userId: session.user.id
        }
    })

    revalidatePath(`/schools/[schoolId]/courses/${courseId}`) // We need the schoolId context, but course page usually revalidates path
    // Ideally we revalidate the specific path. For now we rely on client polling or broad revalidation.
}

export async function getSquadMessages(courseId: string) {
    // Check if squad exists
    const squad = await prisma.squad.findUnique({ where: { courseId } })
    if (!squad) return []

    return prisma.squadMessage.findMany({
        where: { squadId: squad.id },
        orderBy: { createdAt: 'asc' }, // Chat is usually ASC
        include: { user: true },
        take: 50 // Limit last 50 messages
    })
}

// --- BOUNTIES ---

export async function createBounty(courseId: string, title: string, reward: number = 10) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Unauthenticated" }

    if (session.user.karma < reward) {
        return { error: "Insufficient Karma" }
    }

    try {
        // Create Bounty
        await prisma.bounty.create({
            data: {
                title,
                reward,
                courseId,
                userId: session.user.id
            }
        })

        // Deduct Karma (Escrow style, or just direct cost)
        await prisma.user.update({
            where: { id: session.user.id },
            data: { karma: { decrement: reward } }
        })

        revalidatePath(`/courses/${courseId}`)
        return { success: true }
    } catch (e) {
        return { error: "Failed to create bounty" }
    }
}

export async function getBounties(courseId: string) {
    return prisma.bounty.findMany({
        where: { courseId, isFulfilled: false },
        orderBy: { createdAt: 'desc' },
        include: { user: true }
    })
}

// --- MEMBERSHIP ---

export async function joinSquad(courseId: string) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Unauthenticated" }

    // Add to enrolledCourseIds (using array push logic or set)
    // Prisma doesn't have simple array_append for string arrays in all adapters easily, 
    // but PostgreSQL does via { push: val }.
    await prisma.user.update({
        where: { id: session.user.id },
        data: {
            enrolledCourseIds: { push: courseId }
        }
    })

    revalidatePath(`/schools/[schoolId]/courses/${courseId}`)
    return { success: true }
}

export async function checkSquadMembership(courseId: string) {
    const session = await auth()
    if (!session?.user?.id) return false

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { enrolledCourseIds: true }
    })

    return user?.enrolledCourseIds.includes(courseId) || false
}
