import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { CoursePicker } from '@/components/Dashboard/CoursePicker'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default async function CourseOnboardingPage() {
    const session = await auth()
    if (!session?.user?.id) return redirect('/api/auth/signin')

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { enrolledCourseIds: true, completedCourseIds: true }
    })

    if (!user) return redirect('/')

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl mb-6 text-center">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight font-display mb-2">Build Your Semester</h1>
                <p className="text-lg text-slate-500 font-medium">Add your courses to join classmates, find study groups, and track your progress.</p>
            </div>

            <CoursePicker
                initialActive={user.enrolledCourseIds}
                initialCompleted={user.completedCourseIds}
            />

            <div className="w-full max-w-2xl mt-6 flex justify-end">
                <Link
                    href="/dashboard"
                    className="btn-primary gap-2 px-8 py-3 text-lg"
                >
                    Continue to Dashboard <ArrowRight className="w-5 h-5" />
                </Link>
            </div>
        </div>
    )
}
