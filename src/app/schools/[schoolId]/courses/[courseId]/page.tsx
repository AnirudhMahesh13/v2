import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ResourceUpload } from '@/components/ResourceUpload'
import { FeedItem } from '@/components/feed/FeedItem'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmptyState } from '@/components/EmptyState'
import { MessageSquare, Users, User, Star, BookOpen } from 'lucide-react'
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

    // Fetch Resources
    const resources = await prisma.resource.findMany({
        where: { courseId: courseId },
        include: { user: true, upvotes: true },
        orderBy: { upvotes: { _count: 'desc' } }
    })

    return (
        <div className="container mx-auto px-6 py-8 space-y-8">
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

            <Tabs defaultValue="overview" className="w-full">
                <div className="border-b border-slate-200 mb-8">
                    <TabsList className="bg-transparent h-auto p-0 space-x-8">
                        <TabsTrigger value="overview" className="px-1 py-4 border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 rounded-none bg-transparent shadow-none font-medium text-slate-500 hover:text-slate-700">Overview</TabsTrigger>
                        <TabsTrigger value="resources" className="px-1 py-4 border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 rounded-none bg-transparent shadow-none font-medium text-slate-500 hover:text-slate-700">Resource Hub</TabsTrigger>
                        <TabsTrigger value="tutors" className="px-1 py-4 border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 rounded-none bg-transparent shadow-none font-medium text-slate-500 hover:text-slate-700">Find a Tutor</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="overview">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content (Threads & Info) */}
                        <div className="lg:col-span-2 space-y-8">
                            <section>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                        <MessageSquare className="w-5 h-5 text-indigo-600" />
                                        Discussion Threads
                                    </h2>
                                    <ThreadForm courseId={course.id} />
                                </div>
                                {course.threads.length === 0 ? (
                                    <EmptyState icon={MessageSquare} title="No discussions yet" description="Start a thread to discuss assignments." />
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
                        {/* Sidebar */}
                        <div className="space-y-8">
                            <section className="bg-white rounded-xl border border-slate-200 p-6">
                                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-indigo-600" /> Professors</h2>
                                {course.professors.length === 0 ? <p className="text-sm text-slate-500">No professors linked.</p> : (
                                    <ul className="space-y-3">
                                        {course.professors.map(prof => (
                                            <li key={prof.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"><User className="w-4 h-4" /></div>
                                                <span className="text-sm font-medium text-slate-900">{prof.name}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </section>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="resources" className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-1">
                            <ResourceUpload courseId={course.id} />
                        </div>
                        <div className="md:col-span-2 space-y-4">
                            <h3 className="font-bold text-slate-900">Top Community Resources</h3>
                            {resources.length > 0 ? (
                                resources.map(resource => (
                                    <FeedItem key={resource.id} item={{ type: 'RESOURCE', data: resource, date: resource.createdAt }} currentUser={{ id: 'current' }} />
                                ))
                            ) : (
                                <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 border-dashed">
                                    <p className="text-slate-500 italic">No resources shared yet. Be the first!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="tutors">
                    <section>
                        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <GraduationCapIcon /> Available Tutors
                        </h2>
                        {course.tutorListings.length === 0 ? (
                            <EmptyState icon={User} title="No tutors available" description="Be the first to tutor for this course." />
                        ) : (
                            <div className="space-y-3">
                                {course.tutorListings.map(tutor => (
                                    <div key={tutor.id} className="bg-white p-4 rounded-xl border border-slate-200">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">{tutor.tutor.name?.charAt(0)}</div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{tutor.tutor.name}</p>
                                                <p className="text-xs text-slate-500">${tutor.hourlyRate / 100}/hr</p>
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-600 line-clamp-2 mb-3">{tutor.description}</p>
                                        <div className="mt-3">
                                            <BookingButton tutorListingId={tutor.id} courseCode={course.code} tutorName={tutor.tutor.name ?? 'Tutor'} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </TabsContent>
            </Tabs>
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
