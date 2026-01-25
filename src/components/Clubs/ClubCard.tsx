
import Link from 'next/link'
import { Users, Calendar } from 'lucide-react'

// Define a type for the club input (can be the Prisma type or specific selection)
interface ClubCardProps {
    club: {
        id: string
        slug: string
        name: string
        description: string
        logoUrl: string | null
        coverUrl: string | null
        category: string
        _count: {
            members: number
            events: number
        }
    }
}

export function ClubCard({ club }: ClubCardProps) {
    return (
        <Link href={`/clubs/${club.slug}`} className="group block h-full">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-indigo-200 transition-all h-full flex flex-col">
                {/* Cover Image */}
                <div className="h-24 bg-slate-100 relative">
                    {club.coverUrl ? (
                        <img src={club.coverUrl} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-indigo-50 to-slate-100" />
                    )}

                    {/* Logo (absolute positioned) */}
                    <div className="absolute -bottom-6 left-4">
                        <div className="w-12 h-12 rounded-xl bg-white p-1 shadow-sm border border-slate-100">
                            {club.logoUrl ? (
                                <img src={club.logoUrl} className="w-full h-full object-cover rounded-lg" />
                            ) : (
                                <div className="w-full h-full bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-bold text-lg">
                                    {club.name[0]}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-4 pt-8 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {club.category}
                        </span>
                    </div>

                    <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-1 truncate">
                        {club.name}
                    </h3>

                    <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">
                        {club.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs font-medium text-slate-400 pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            <span>{club._count.members} Members</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{club._count.events} Events</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}
