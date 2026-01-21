import { Trophy, Users, BookOpen } from 'lucide-react'

export function AcademicIdentity({ user }: { user: any }) {
    if (!user) return null

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="text-center mb-6">
                <div className="w-20 h-20 rounded-full bg-slate-200 mx-auto mb-3 flex items-center justify-center text-2xl font-bold text-slate-500 border-4 border-white shadow-lg">
                    {user.image ? <img src={user.image} className="w-full h-full rounded-full" /> : user.name?.[0]}
                </div>
                <h2 className="font-bold text-lg text-slate-900">{user.name}</h2>
                <div className="text-sm text-slate-500 mb-2">{user.bio || 'Student at Classmate U'}</div>

                <div className="flex items-center justify-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100">
                        <Trophy className="w-3 h-3" /> {user.karma} Karma
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                        Level {Math.floor(user.karma / 100) + 1}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-6">
                <div className="text-center">
                    <div className="text-xl font-bold text-slate-900">{user.following?.length || 0}</div>
                    <div className="text-xs text-slate-500 font-medium flex items-center justify-center gap-1">
                        <Users className="w-3 h-3" /> Following
                    </div>
                </div>
                <div className="text-center border-l border-slate-100">
                    <div className="text-xl font-bold text-slate-900">{user.enrolledCourseIds?.length || 0}</div>
                    <div className="text-xs text-slate-500 font-medium flex items-center justify-center gap-1">
                        <BookOpen className="w-3 h-3" /> Courses
                    </div>
                </div>
            </div>

            {/* Badges Placeholder */}
            {user.badges && user.badges.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Badges</h3>
                    <div className="flex flex-wrap gap-2">
                        {user.badges.map((b: any) => (
                            <div key={b.id} title={b.description} className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                                <Trophy className="w-4 h-4" />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
