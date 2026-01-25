
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { ClubHeader } from '@/components/Clubs/Profile/ClubHeader'
import { ClubTabs } from '@/components/Clubs/Profile/ClubTabs'
import { notFound } from 'next/navigation'

interface PageProps {
    params: { slug: string }
}

export default async function ClubProfilePage({ params }: { params: Promise<{ slug: string }> }) {
    const session = await auth()
    const { slug } = await params

    const club = await prisma.club.findUnique({
        where: { slug: slug },
        include: {
            _count: {
                select: { members: true, events: true }
            },
            events: {
                where: { startTime: { gte: new Date() } },
                orderBy: { startTime: 'asc' }
            },
            posts: {
                take: 9,
                orderBy: { createdAt: 'desc' }
            },
            // Check membership of current user
            members: session?.user?.id ? {
                where: { userId: session.user.id }
            } : false
        }
    })

    if (!club) return notFound()

    const isMember = session?.user?.id && club.members.length > 0

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <ClubHeader club={club} isMember={!!isMember} />
            <ClubTabs club={club} />
        </div>
    )
}
