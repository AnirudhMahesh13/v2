import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { TutorRegistrationForm } from '@/components/TutorRegistrationForm'

export default async function TutorRegister() {
    const session = await auth()
    const user = session?.user

    if (!user) {
        redirect('/api/auth/signin?callbackUrl=/tutors/register')
    }

    const schools = await prisma.school.findMany({
        select: { id: true, name: true },
        orderBy: { name: 'asc' }
    })

    return (
        <div className="container mx-auto px-6 py-12 flex justify-center">
            <div className="w-full max-w-2xl glass-card rounded-2xl p-8 md:p-12">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-slate-900 mb-4">Become a Tutor</h1>
                    <p className="text-slate-500">Share your knowledge and earn money. Set your own rates and schedule.</p>
                </div>

                <TutorRegistrationForm schools={schools} />
            </div>
        </div>
    )
}
