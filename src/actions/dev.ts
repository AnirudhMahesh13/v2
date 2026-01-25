'use server'

import { prisma } from "@/lib/prisma"

export async function getDevUsers() {
    if (process.env.NODE_ENV === 'production') return []

    const users = await prisma.user.findMany({
        take: 5,
        orderBy: {
            karma: 'desc'
        },
        include: {
            school: true
        }
    })

    // Shuffle effectively by taking high karma ones
    return users
}
