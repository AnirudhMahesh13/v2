import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { EmptyState } from '@/components/EmptyState'
import { MessageSquare, Users, User, Star, BookOpen, Calendar } from 'lucide-react'
import { auth } from '@/auth'
import { ReviewForm } from '@/components/ReviewForm'
import { ThreadForm } from '@/components/ThreadForm'
import { BookingButton } from '@/components/BookingButton'

interface PageProps {
    params: Promise<{
        schoolId: string
        courseId: string
    }>
}

export default async function CoursePage({ params }: PageProps) {
    const { schoolId, courseId } = await params
    // No explicit auth check needed here if public, but we can access session if personalized content needed.

    const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
            professors: true,
            tutorListings: {
                include: {
                    tutor: true,
                    reviews: true
                }
            },
            threads: {
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: { select: { comments: true } },
                    user: true
                }
            },
            _count: {
                select: { reviews: true }
            }
        }
    })

    if (!course || course.schoolId !== schoolId) {
        notFound()
    }

    // Calculate average stats if reviews existed (stub logic)
    // In real app, we would aggregate rating

    return (
        <div className="container mx-auto px-6 py-8 space-y-12">
            {/* Header */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 text-indigo-600 font-medium mb-2">
                        <BookOpen className="w-4 h-4" />
                        <span>{course.code}</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">{course.name}</h1>
                    <div className="flex items-center gap-4 text-slate-500 text-sm">
                        <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                            <span className="font-medium text-slate-900">4.8</span>
                            <span>({course._count.reviews} reviews)</span>
                        </span>
                        <span>•</span>
                        <span>{course.professors.length} Professors</span>
                    </div>
                </div>
                <ReviewForm courseId={course.id} />
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:col-span-3 gap-8">

                {/* Main Content (Threads & Info) */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Discussion Threads */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-indigo-600" />
                                Discussion Threads
                            </h2>
                            <ThreadForm courseId={course.id} />
                        </div>

                        {course.threads.length === 0 ? (
                            <EmptyState
                                icon={MessageSquare}
                                title="No discussions yet"
                                description="Start a thread to discuss assignments, exams, or course content."
                            />
                        ) : (
                            <div className="space-y-4">
                                {course.threads.map(thread => (
                                    <Link key={thread.id} href={`/schools/${schoolId}/courses/${courseId}/threads/${thread.id}`} className="block">
                                        <div className="p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 transition-colors cursor-pointer group">
                                            <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 mb-1">{thread.title}</h3>
                                            <div className="flex items-center justify-between text-xs text-slate-500">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-slate-700">{thread.user.name ?? 'Student'}</span>
                                                    <span>•</span>
                                                    <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <MessageSquare className="w-3 h-3" />
                                                    {thread._count.comments}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                {/* Sidebar (Professors & Tutors) */}
                <div className="space-y-8">

                    {/* Professors */}
                    <section className="bg-white rounded-xl border border-slate-200 p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5 text-indigo-600" />
                            Professors
                        </h2>
                        {course.professors.length === 0 ? (
                            <p className="text-sm text-slate-500">No professors linked yet.</p>
                        ) : (
                            <ul className="space-y-3">
                                {course.professors.map(prof => (
                                    <li key={prof.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-medium text-slate-900">{prof.name}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    {/* Tutors */}
                    <section>
                        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <GraduationCapIcon />
                            Available Tutors
                        </h2>
                        {course.tutorListings.length === 0 ? (
                            <EmptyState
                                icon={User}
                                title="No tutors available"
                                description="Be the first to tutor for this course."
                            />
                        ) : (
                            <div className="space-y-3">
                                {course.tutorListings.map(tutor => (
                                    <div key={tutor.id} className="bg-white p-4 rounded-xl border border-slate-200">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                                                {tutor.tutor.name?.charAt(0) ?? 'T'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{tutor.tutor.name}</p>
                                                <p className="text-xs text-slate-500">${tutor.hourlyRate / 100}/hr</p>
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-600 line-clamp-2 mb-3">{tutor.description}</p>

                                        <div className="mt-3">
                                            <BookingButton
                                                tutorListingId={tutor.id}
                                                courseCode={course.code}
                                                tutorName={tutor.tutor.name ?? 'Tutor'}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    )
}

function GraduationCapIcon() {
    return (
        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 19.5A2.5 2.5 0 016.5 17H20" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
        </svg>
    )
}
