import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Calendar, BookOpen, MessageSquare, Star, Clock, Users } from 'lucide-react'
import Link from 'next/link'

export default async function Dashboard() {
    const session = await auth()
    const user = session?.user

    if (!user || !user.id) {
        redirect('/')
    }

    // Fetch db user to get school info
    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
            school: true,
            bookings: {
                include: { tutorListing: { include: { tutor: true, course: true } } },
                orderBy: { scheduledAt: 'asc' }
            },
            reviews: { include: { course: true } },
            clubMemberships: {
                include: {
                    club: {
                        include: {
                            _count: { select: { members: true, events: true } }
                        }
                    }
                }
            },
            _count: { select: { followedBy: true, following: true } }
        }
    })

    // Fetch enrolled courses
    const courses = dbUser?.enrolledCourseIds ? await prisma.course.findMany({
        where: { id: { in: dbUser.enrolledCourseIds } },
        select: { id: true, code: true, name: true, schoolId: true }
    }) : []

    // If user exists in Auth but not DB (edge case), redirect to finish profile or home
    if (!dbUser) {
        // Ideally redirect to a setup page, but for now home
        redirect('/')
    }

    return (
        <div className="container mx-auto px-6 py-12">
            {/* Welcome Header */}
            <div className="mb-12">
                <h1 className="text-4xl font-bold text-slate-900 mb-2">
                    Welcome back, <span className="text-indigo-600">{user.name?.split(' ')[0] || 'Scholar'}</span>
                </h1>
                <p className="text-slate-500 text-lg">
                    {dbUser.school?.name ? `Student at ${dbUser.school.name}` : 'Ready to start your academic journey?'}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: Schedule */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Courses Section */}
                    <section className="glass-card rounded-2xl p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                                    <BookOpen className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900">Current Semester</h2>
                            </div>
                            <Link href="/onboarding/courses" className="text-sm font-bold text-indigo-600 hover:underline">
                                Manage Courses
                            </Link>
                        </div>

                        {courses.length === 0 ? (
                            <div className="text-center py-8 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                                <h3 className="text-slate-900 font-medium mb-1">Build your schedule</h3>
                                <p className="text-slate-500 text-sm mb-4">Add course codes to join the conversation.</p>
                                <Link href="/onboarding/courses" className="inline-flex items-center justify-center px-6 py-2 bg-slate-900 text-white text-sm font-semibold rounded-full hover:bg-slate-800 transition-colors">
                                    Open Architect
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {courses.map(course => (
                                    <Link key={course.id} href={`/schools/${course.schoolId}/courses/${course.id}`} className="block group">
                                        <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 hover:shadow-md transition-all">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md font-bold text-xs tracking-wider">
                                                    {course.code}
                                                </div>
                                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                            </div>
                                            <h3 className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors line-clamp-1">{course.name}</h3>
                                            <p className="text-xs text-slate-400 mt-2">View Class &rarr;</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="glass-card rounded-2xl p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">My Schedule</h2>
                        </div>

                        {dbUser.bookings.length === 0 ? (
                            <div className="text-center py-12 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                                <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <h3 className="text-slate-900 font-medium mb-1">No upcoming sessions</h3>
                                <p className="text-slate-500 text-sm mb-4">You have no tutor bookings scheduled.</p>
                                <Link href="/tutors" className="inline-flex items-center justify-center px-6 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-full hover:bg-indigo-700 transition-colors">
                                    Find a Tutor
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {dbUser.bookings.map((booking) => (
                                    <div key={booking.id} className="flex items-start gap-4 p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                                        <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden flex-shrink-0">
                                            {booking.tutorListing.tutor.image ? (
                                                <img src={booking.tutorListing.tutor.image} alt="Tutor" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">
                                                    {booking.tutorListing.tutor.name?.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900">{booking.tutorListing.course.code} Tutoring</h4>
                                            <p className="text-sm text-slate-500">with {booking.tutorListing.tutor.name}</p>
                                            <div className="mt-2 text-xs font-semibold px-2 py-1 bg-green-50 text-green-700 rounded-md inline-block">
                                                {new Date(booking.scheduledAt).toLocaleDateString()} @ {new Date(booking.scheduledAt).toLocaleTimeString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                {/* Sidebar: Stats & Community */}
                <div className="space-y-8">
                    {/* Profile Card */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-90" />

                        <div className="relative z-10 flex flex-col items-center text-center mt-8">
                            <div className="w-24 h-24 rounded-full border-4 border-white bg-slate-100 shadow-md overflow-hidden mb-3">
                                {dbUser.image ? (
                                    <img src={dbUser.image} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-500 text-3xl font-bold">
                                        {dbUser.name?.[0]}
                                    </div>
                                )}
                            </div>

                            <h2 className="text-xl font-bold text-slate-900">{dbUser.name}</h2>
                            <p className="text-sm text-slate-500 font-medium mb-4 line-clamp-2 max-w-[200px]">
                                {dbUser.bio || 'No bio yet.'}
                            </p>

                            <div className="flex items-center gap-6 mb-6 w-full justify-center border-t border-slate-100 pt-4">
                                <div className="text-center">
                                    <div className="font-black text-slate-900">{dbUser.karma}</div>
                                    <div className="text-[10px] uppercase font-bold text-slate-400">Karma</div>
                                </div>
                                <div className="text-center">
                                    <div className="font-black text-slate-900">{dbUser._count.followedBy}</div>
                                    <div className="text-[10px] uppercase font-bold text-slate-400">Followers</div>
                                </div>
                                <div className="text-center">
                                    <div className="font-black text-slate-900">{dbUser._count.following}</div>
                                    <div className="text-[10px] uppercase font-bold text-slate-400">Following</div>
                                </div>
                            </div>

                            <Link href={`/profile/${dbUser.id}`} className="w-full py-2 bg-slate-900 text-white font-bold rounded-xl text-sm hover:bg-slate-800 transition-colors">
                                View Full Profile
                            </Link>
                        </div>
                    </div>

                    {/* Clubs Section */}
                    <section className="glass-card rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-rose-100 rounded-lg text-rose-600">
                                <Users className="w-5 h-5" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-900">My Clubs</h2>
                        </div>

                        {dbUser.clubMemberships.length === 0 ? (
                            <div className="text-center py-6">
                                <p className="text-sm text-slate-500 mb-2">Not in any clubs yet.</p>
                                <Link href="/clubs" className="text-sm font-bold text-indigo-600 hover:underline">
                                    Browse Directory
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {dbUser.clubMemberships.map(({ club }) => (
                                    <Link key={club.id} href={`/clubs/${club.slug}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors group">
                                        <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                                            {club.logoUrl ? (
                                                <img src={club.logoUrl} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-500 font-bold">
                                                    {club.name[0]}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-slate-900 text-sm truncate group-hover:text-indigo-600 transition-colors">{club.name}</h4>
                                            <p className="text-xs text-slate-500 truncate">{club.category}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="glass rounded-2xl p-8 text-center bg-gradient-to-br from-indigo-600 to-violet-600 text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold mb-2">Become a Tutor</h3>
                            <p className="text-indigo-100 text-sm mb-6">Earn money by helping other students with courses you aced.</p>
                            <Link href="/tutors/register" className="inline-block w-full py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors">
                                Apply Now
                            </Link>
                        </div>
                        {/* Decorative blob */}
                        <div className="absolute top-[-50%] right-[-50%] w-full h-full bg-white/10 blur-3xl rounded-full" />
                    </section>
                </div>
            </div>
        </div>
    )
}
