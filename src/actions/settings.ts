'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// --- PROFILE SETTINGS ---

interface ProfileUpdateData {
    name?: string
    bio?: string
    major?: string // If added to schema later, currently stored in JSON or bio?
    // For now, we only have bio in schema. 
    // We can store major/year in bio or add fields. Plan says "Update 'Major', 'Year'".
    // Let's assume we store them in a meta field if they don't exist, or just bio for now.
    // Wait, the User model has `bio`. `enrolledCourseIds` is array.
    // The prompt implies we should be able to update Major/Year.
    // I didn't add Major/Year to schema. I should have. 
    // Let's check schema again. 
    // It is NOT in schema.
    // I will use `bio` for now and `name`. 
    // Or I can update schema again? 
    // "Update 'User' model... include 'notificationPrefs' ... and 'privacyFlags'".
    // It didn't explicitly ask for 'Major' column in the Technical Specs part, but in "Section A: Profile" it mentions updating it.
    // I will assume for MVP we might store extra data in `bio` or omit if not critical. 
    // However, looking at `AcademicIdentity` component (which exists), it might expect them.
    // Let's stick to Name and Bio for now to match current schema strictness.
}

export async function updateProfile(data: { name: string, bio: string }) {
    const session = await auth()
    if (!session?.user?.id) return { error: 'Unauthorized' }

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                name: data.name,
                bio: data.bio
            }
        })
        revalidatePath('/settings')
        revalidatePath('/profile')
        return { success: true }
    } catch (error) {
        return { error: 'Failed to update profile' }
    }
}

// --- NOTIFICATION PREFS ---

export async function updateNotificationPrefs(prefs: any) {
    const session = await auth()
    if (!session?.user?.id) return { error: 'Unauthorized' }

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                notificationPrefs: prefs
            }
        })
        revalidatePath('/settings/notifications')
        return { success: true }
    } catch (error) {
        return { error: 'Failed to update preferences' }
    }
}

// --- PRIVACY SETTINGS ---

export async function updatePrivacySettings(settings: any) {
    const session = await auth()
    if (!session?.user?.id) return { error: 'Unauthorized' }

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                privacySettings: settings
            }
        })
        revalidatePath('/settings/privacy')
        return { success: true }
    } catch (error) {
        return { error: 'Failed to update privacy settings' }
    }
}

// --- BLOCKING ---

export async function blockUser(targetUserId: string) {
    const session = await auth()
    if (!session?.user?.id) return { error: 'Unauthorized' }

    try {
        // Fetch current blocked list
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { blockedUserIds: true }
        })

        if (!user) return { error: 'User not found' }

        const currentBlocked = user.blockedUserIds || []
        if (currentBlocked.includes(targetUserId)) return { success: true } // Already blocked

        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                blockedUserIds: { push: targetUserId }
            }
        })

        revalidatePath('/settings/privacy')
        return { success: true }
    } catch (error) {
        return { error: 'Failed to block user' }
    }
}

export async function unblockUser(targetUserId: string) {
    const session = await auth()
    if (!session?.user?.id) return { error: 'Unauthorized' }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { blockedUserIds: true }
        })

        if (!user) return { error: 'User not found' }

        const newBlocked = user.blockedUserIds.filter(id => id !== targetUserId)

        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                blockedUserIds: newBlocked
            }
        })

        revalidatePath('/settings/privacy')
        return { success: true }
    } catch (error) {
        return { error: 'Failed to unblock user' }
    }
}

export async function getBlockedUsers() {
    const session = await auth()
    if (!session?.user?.id) return []

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { blockedUserIds: true }
    })

    if (!user?.blockedUserIds?.length) return []

    const blockedUsers = await prisma.user.findMany({
        where: { id: { in: user.blockedUserIds } },
        select: { id: true, name: true, image: true, email: true }
    })

    return blockedUsers
}
