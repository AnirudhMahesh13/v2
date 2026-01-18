import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { BookOpen, Users, ArrowRight, Home } from 'lucide-react'
import { EmptyState } from '@/components/EmptyState'

interface PageProps {
    params: Promise<{
        schoolId: string
    }>
}

export default async function SchoolPage({ params }: PageProps) {
    const { schoolId } = await params

    const school = await prisma.school.findUnique({
        where: { id: schoolId },
        include: {
            courses: {
                include: {
                    _count: { select: { reviews: true } }
                }
            },
            _count: { select: { users: true } }
        }
    })

    if (!school) {
        notFound()
    }

    return (
        <div className="container mx-auto px-6 py-12">
            {/* Header */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-6 text-center md:text-left mb-12">
                <div className="w-24 h-24 bg-slate-50 rounded-2xl border border-slate-100 p-4 flex items-center justify-center">
                    {school.logoUrl ? (
                        <img src={school.logoUrl} alt={school.name} className="w-full h-full object-contain" />
                    ) : (
                        <Home className="w-10 h-10 text-slate-300" />
                    )}
                </div>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">{school.name}</h1>
                    <p className="text-slate-500 font-medium mb-4">{school.domain}</p>
                    <div className="flex items-center justify-center md:justify-start gap-6 text-sm text-slate-500">
                        <span className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            {school.courses.length} Courses
                        </span>
                        <span className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            {school._count.users} Students
                        </span>
                    </div>
                </div>
            </div>

            {/* Course List */}
            <h2 className="text-xl font-bold text-slate-900 mb-6">Available Courses</h2>

            {school.courses.length === 0 ? (
                <EmptyState
                    icon={BookOpen}
                    title="No courses listed"
                    description="This school has no courses yet."
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {school.courses.map(course => (
                        <Link key={course.id} href={`/schools/${school.id}/courses/${course.id}`} className="group">
                            <div className="bg-white border border-slate-200 p-6 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all h-full flex flex-col">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                                        {course.code}
                                    </span>
                                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{course.name}</h3>
                                <div className="mt-auto pt-4 flex items-center gap-2 text-xs text-slate-500">
                                    <span>{course._count.reviews} Reviews</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
