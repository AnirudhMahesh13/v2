
'use client'

import { Search, Filter, Sparkles } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'

const categories = ["All", "Academic", "Professional", "Hobby", "Cultural", "Sports"]

export function DiscoverySearch() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()
    const [query, setQuery] = useState(searchParams.get('q') || '')
    const [activeCategory, setActiveCategory] = useState(searchParams.get('c') || 'All')

    const handleSearch = (term: string) => {
        setQuery(term)
        const params = new URLSearchParams(searchParams)
        if (term) params.set('q', term)
        else params.delete('q')

        startTransition(() => {
            router.replace(`/clubs?${params.toString()}`)
        })
    }

    const handleCategory = (category: string) => {
        setActiveCategory(category)
        const params = new URLSearchParams(searchParams)
        if (category !== 'All') params.set('c', category)
        else params.delete('c')

        startTransition(() => {
            router.replace(`/clubs?${params.toString()}`)
        })
    }

    return (
        <div className="space-y-6 mb-8">
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-4 border border-slate-200 rounded-2xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow shadow-sm"
                    placeholder="Search clubs, societies, and communities..."
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {isPending && <div className="animate-spin h-4 w-4 border-2 border-indigo-500 rounded-full border-t-transparent"></div>}
                </div>
            </div>

            {/* Filter Chips */}
            <div className="flex items-center justify-center gap-2 flex-wrap">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => handleCategory(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${activeCategory === cat
                                ? 'bg-slate-900 text-white shadow-md transform scale-105'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>
    )
}
