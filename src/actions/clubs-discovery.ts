
'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { ClubCategory } from '@prisma/client'

interface GetClubsParams {
    query?: string
    category?: string // "All" or specific enum
    schoolId?: string
}

export async function getRecommendedClubs({ query, category, schoolId }: GetClubsParams) {
    const session = await auth()
    // In strict mode we'd filter by user's school, but for MVP/Dev we handle mixed data

    const where: any = {}

    if (schoolId) {
        where.schoolId = schoolId
    }

    if (query) {
        where.OR = [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
        ]
    }

    if (category && category !== 'All') {
        const catEnum = Object.values(ClubCategory).find(c => c === category.toUpperCase())
        if (catEnum) {
            where.category = catEnum
        }
    }

    const clubs = await prisma.club.findMany({
        where,
        take: 20,
        orderBy: {
            members: {
                _count: 'desc'
            }
        },
        select: {
            id: true,
            slug: true,
            name: true,
            description: true,
            logoUrl: true,
            coverUrl: true,
            category: true,
            _count: {
                select: {
                    members: true,
                    events: true
                }
            }
        }
    })

    return clubs
}
