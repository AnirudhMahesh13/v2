'use server'

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function sendMessage(receiverId: string, content: string) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Unauthenticated" }

    const senderId = session.user.id

    const message = await prisma.message.create({
        data: {
            senderId,
            receiverId,
            content
        }
    })

    return { success: true, message }
}

export async function getMessages(otherUserId: string) {
    const session = await auth()
    if (!session?.user?.id) return []

    const myId = session.user.id

    const messages = await prisma.message.findMany({
        where: {
            OR: [
                { senderId: myId, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: myId }
            ]
        },
        orderBy: {
            createdAt: 'asc'
        },
        include: {
            sender: true
        }
    })

    return messages
}

export async function markMessagesRead(senderId: string) {
    const session = await auth()
    if (!session?.user?.id) return { success: false }

    const myId = session.user.id

    await prisma.message.updateMany({
        where: {
            senderId: senderId,
            receiverId: myId,
            read: false
        },
        data: {
            read: true
        }
    })

    revalidatePath('/')
    return { success: true }
}
