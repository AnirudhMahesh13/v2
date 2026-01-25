
'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { BeaconVibe } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export async function createBeacon(data: {
    locationName: string
    goal: string
    vibe: BeaconVibe
    courseId?: string
    description?: string
    expiresInMinutes: number
}) {
    const session = await auth()
    if (!session?.user?.id) throw new Error('Unauthorized')

    let schoolId = session.user.schoolId

    // Fallback: Fetch from DB if missing in session
    if (!schoolId) {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { schoolId: true }
        })
        schoolId = user?.schoolId
    }

    if (!schoolId) throw new Error('User must belong to a school to drop a beacon')

    const expiresAt = new Date(Date.now() + data.expiresInMinutes * 60000)

    const beacon = await prisma.beacon.create({
        data: {
            userId: session.user.id,
            schoolId: schoolId,
            locationName: data.locationName,
            goal: data.goal,
            vibe: data.vibe,
            expiresAt,
            description: data.description,
            courseId: data.courseId
        }
    })

    revalidatePath('/beacons')
    return beacon
}

export async function joinBeacon(beaconId: string) {
    const session = await auth()
    if (!session?.user?.id) throw new Error('Unauthorized')

    const existing = await prisma.beaconJoin.findUnique({
        where: {
            beaconId_userId: {
                beaconId,
                userId: session.user.id
            }
        }
    })

    if (existing) {
        // Leave
        await prisma.beaconJoin.delete({
            where: { id: existing.id }
        })
    } else {
        // Join
        await prisma.beaconJoin.create({
            data: {
                beaconId,
                userId: session.user.id
            }
        })
    }

    revalidatePath('/beacons')
}

export async function getLiveBeacons() {
    const session = await auth()
    if (!session?.user) return []

    return await prisma.beacon.findMany({
        where: {
            schoolId: session.user.schoolId || undefined,
            expiresAt: { gt: new Date() } // Only active beacons
        },
        include: {
            user: { select: { id: true, name: true, image: true } },
            course: { select: { code: true } },
            attendees: { select: { userId: true } },
            _count: { select: { attendees: true } }
        },
        orderBy: { createdAt: 'desc' }
    })
}
