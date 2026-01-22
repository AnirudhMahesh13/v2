import { prisma } from '@/lib/prisma'
import { Trophy, Medal, Star } from 'lucide-react'

export async function Leaderboard({ schoolId }: { schoolId?: string }) {
    // Top Contributors (by Karma)
    const topUsers = await prisma.user.findMany({
        where: schoolId ? { schoolId } : undefined,
        orderBy: { karma: 'desc' },
        take: 5
    })

    // Top Tutors (by Trust Score)
    // Note: Tutors are Users, but listed via TutorListing
    // Let's just find distinct tutors with high scores
    // Actually, let's just use top users for now to simplify

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="flex items-center gap-2 font-bold text-slate-900 mb-4">
                <Trophy className="w-5 h-5 text-amber-500" />
                School Leaderboard
            </h3>

            <div className="space-y-4">
                {topUsers.map((user, index) => (
                    <div key={user.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 flex items-center justify-center font-bold text-xs rounded ${index === 0 ? 'bg-amber-100 text-amber-700' :
                                index === 1 ? 'bg-slate-100 text-slate-700' :
                                    index === 2 ? 'bg-orange-50 text-orange-700' : 'text-slate-400'
                                }`}>
                                {index + 1}
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                                    {user.image ? <img src={user.image} className="w-full h-full object-cover" /> : null}
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-slate-900 leading-tight">{user.name}</div>
                                    <div className="text-[10px] text-slate-500">{user.bio || 'Student'}</div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                            <Star className="w-3 h-3 fill-indigo-600" />
                            {user.karma}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-50 text-center">
                <a href="#" className="text-xs font-semibold text-slate-400 hover:text-indigo-600 uppercase tracking-widest">
                    View All Rankings
                </a>
            </div>
        </div>
    )
}
