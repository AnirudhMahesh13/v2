import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Calendar, BookOpen, MessageSquare, Star, Clock } from 'lucide-react'
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
            reviews: { include: { course: true } }
        }
    })

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
                    <section className="glass-card rounded-2xl p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-violet-100 rounded-lg text-violet-600">
                                <Star className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">My Activity</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                <span className="text-slate-600 font-medium">Reviews Posted</span>
                                <span className="text-2xl font-bold text-slate-900">{dbUser.reviews.length}</span>
                            </div>
                            {/* Add more stats here later */}
                        </div>
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
