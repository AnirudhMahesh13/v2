
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import { Users, FileText, Settings, Megaphone } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
    params: { slug: string }
}

export default async function ClubManagePage({ params }: { params: Promise<{ slug: string }> }) {
    const session = await auth()
    if (!session?.user) return redirect('/api/auth/signin')

    const { slug } = await params

    const club = await prisma.club.findUnique({
        where: { slug: slug },
        include: {
            members: {
                where: { role: { in: ['PRESIDENT', 'VP', 'EXECUTIVE'] } }
            },
            _count: {
                select: { members: true, applications: true }
            }
        }
    })

    if (!club) return notFound()

    // Authorization Check
    const isExec = club.members.some(m => m.userId === session.user.id)
    if (!isExec) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center">
                    <h1 className="text-2xl font-bold text-slate-900 mb-4">Access Denied</h1>
                    <p className="text-slate-500 mb-6">You must be an executive of {club.name} to view this dashboard.</p>
                    <Link href={`/clubs/${club.slug}`} className="btn-primary w-full justify-center">
                        Back to Club Page
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
                            {club.name[0]}
                        </div>
                        <h1 className="font-bold text-slate-900 truncate max-w-xs">{club.name} Command Center</h1>
                    </div>
                    <Link href={`/clubs/${club.slug}`} className="text-sm font-medium text-slate-500 hover:text-indigo-600">
                        View Public Page
                    </Link>
                </div>
            </header>

            <div className="container mx-auto px-6 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-slate-500">Total Members</h3>
                            <Users className="w-5 h-5 text-indigo-500" />
                        </div>
                        <p className="text-3xl font-black text-slate-900">{club._count.members}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-slate-500">Pending Applications</h3>
                            <FileText className="w-5 h-5 text-amber-500" />
                        </div>
                        <p className="text-3xl font-black text-slate-900">{club._count.applications}</p>
                        <p className="text-xs text-amber-600 mt-2 font-medium">Action Required</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-slate-500">Upcoming Events</h3>
                            <Users className="w-5 h-5 text-emerald-500" />
                        </div>
                        <p className="text-3xl font-black text-slate-900">0</p>
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recruitment Pipeline (Kanban Placeholder) */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-900">Recruitment Pipeline</h2>
                            <button className="btn-secondary text-sm">Manage Settings</button>
                        </div>

                        <div className="grid grid-cols-3 gap-4 h-96">
                            {['Applied', 'Interviewing', 'Hired'].map((status) => (
                                <div key={status} className="bg-slate-100 rounded-xl p-4 flex flex-col">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">{status}</h3>
                                    <div className="flex-1 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400 text-sm">
                                        Empty
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl border border-slate-200">
                            <h3 className="font-bold text-slate-900 mb-4">Broadcast</h3>
                            <p className="text-sm text-slate-500 mb-4">Send a push notification to all {club._count.members} members.</p>
                            <button className="w-full btn-primary justify-center gap-2">
                                <Megaphone className="w-4 h-4" /> Send Alert
                            </button>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-slate-200">
                            <h3 className="font-bold text-slate-900 mb-4">Member Roles</h3>
                            <div className="space-y-3">
                                {club.members.map(exec => (
                                    <div key={exec.id} className="flex items-center justify-between text-sm">
                                        <span className="text-slate-700 font-medium">User {exec.userId.slice(0, 4)}...</span>
                                        <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold">{exec.role}</span>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-4 btn-secondary justify-center text-sm">
                                Manage Roster
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
