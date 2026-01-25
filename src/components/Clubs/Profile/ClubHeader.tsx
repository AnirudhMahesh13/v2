
'use client'

import { MapPin, Users, Calendar, Plus } from 'lucide-react'

// Using "any" for speed, ideally typed fully
export function ClubHeader({ club, isMember }: { club: any, isMember: boolean }) {
    return (
        <div className="bg-white border-b border-slate-200">
            {/* Cover Image */}
            <div className="h-48 md:h-64 bg-slate-100 relative">
                {club.coverUrl ? (
                    <img src={club.coverUrl} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-indigo-100 to-purple-100" />
                )}
            </div>

            <div className="container mx-auto px-4 pb-6">
                <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-12 mb-6">
                    {/* Logo */}
                    <div className="w-32 h-32 rounded-2xl bg-white p-2 shadow-lg ring-4 ring-white shrink-0">
                        {club.logoUrl ? (
                            <img src={club.logoUrl} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                            <div className="w-full h-full bg-indigo-50 rounded-xl flex items-center justify-center text-4xl font-bold text-indigo-500">
                                {club.name[0]}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 pb-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight font-display">{club.name}</h1>
                            {club.isVerified && <span className="text-blue-500">Let's verify!</span>}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-500">
                            <span className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {club._count.members} Members
                            </span>
                            <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {club._count.events} Events
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 uppercase text-xs font-bold tracking-wide">
                                {club.category}
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 w-full md:w-auto mt-4 md:mt-0">
                        {isMember ? (
                            <button className="flex-1 md:flex-none btn-secondary">
                                Member
                            </button>
                        ) : (
                            <button className="flex-1 md:flex-none btn-primary px-8">
                                Join Club
                            </button>
                        )}
                    </div>
                </div>

                {/* Description */}
                <p className="text-slate-600 max-w-3xl leading-relaxed font-medium">
                    {club.description}
                </p>
            </div>
        </div>
    )
}
