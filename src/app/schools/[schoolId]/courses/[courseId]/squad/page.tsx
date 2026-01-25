import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSquad, pollSquadMessages } from '@/actions/social'
import SquadChat from '@/components/squad/SquadChat'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Squad War Room | Classmate',
}

interface PageProps {
    params: Promise<{
        schoolId: string
        courseId: string
    }>
}

export default async function SquadPage({ params }: PageProps) {
    const { schoolId, courseId } = await params
    const session = await auth()

    if (!session?.user?.id) {
        redirect('/api/auth/signin')
    }

    // 1. Fetch Course Info
    const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { code: true, name: true }
    })

    if (!course) {
        return <div>Course not found</div>
    }

    // 2. Get or Create Squad
    const squad = await getSquad(courseId)

    if (!squad) {
        return <div>Failed to initialize Squad</div>
    }

    // 3. Fetch Initial Messages
    const initialMessages = await pollSquadMessages(squad.id)

    return (
        <div className="container mx-auto px-4 py-6 max-w-4xl">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">{course.code}: {course.name}</h1>
                <p className="text-slate-500">Collaborate with your classmates in real-time.</p>
            </div>

            <SquadChat
                squadId={squad.id}
                courseCode={course.code}
                currentUserId={session.user.id}
                initialMessages={initialMessages as any}
            />
        </div>
    )
}
