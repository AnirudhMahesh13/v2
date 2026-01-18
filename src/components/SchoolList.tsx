'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, MapPin, Users, BookOpen, ArrowRight } from 'lucide-react'
import { EmptyState } from '@/components/EmptyState'

interface SchoolWithCounts {
    id: string
    name: string
    domain: string
    logoUrl: string | null
    _count: {
        courses: number
        users: number
    }
}

export function SchoolList({ schools }: { schools: SchoolWithCounts[] }) {
    const [search, setSearch] = useState('')

    const filteredSchools = schools.filter(school =>
        school.name.toLowerCase().includes(search.toLowerCase()) ||
        school.domain.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-8">
            {/* Search Bar */}
            <div className="relative w-full md:w-96">
                <input
                    type="text"
                    placeholder="Search universities..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all shadow-sm"
                />
                <Search className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
            </div>

            {/* Results */}
            {filteredSchools.length === 0 ? (
                <EmptyState
                    icon={MapPin}
                    title="No schools found"
                    description="Try searching for a different university."
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSchools.map(school => (
                        <Link key={school.id} href={`/schools/${school.id}`} className="group block h-full">
                            <div className="card h-full p-6 flex flex-col hover:border-slate-400 transition-colors">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="w-16 h-16 bg-slate-50 rounded-xl border border-slate-100 p-2 flex items-center justify-center">
                                        {school.logoUrl ? (
                                            <img src={school.logoUrl} alt={school.name} className="w-full h-full object-contain" />
                                        ) : (
                                            <MapPin className="w-8 h-8 text-slate-300" />
                                        )}
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>

                                <h2 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-slate-700 transition-colors font-display">{school.name}</h2>
                                <p className="text-sm font-medium text-slate-500 mb-6">{school.domain}</p>

                                <div className="mt-auto pt-6 border-t border-slate-100 flex items-center gap-6 text-sm text-slate-500">
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="w-4 h-4" />
                                        <span>{school._count.courses} Courses</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        <span>{school._count.users} Students</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
