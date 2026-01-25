
import { auth } from '@/auth'
import { getRecommendedClubs } from '@/actions/clubs-discovery'
import { DiscoverySearch } from '@/components/Clubs/DiscoverySearch'
import { ClubCard } from '@/components/Clubs/ClubCard'
import { redirect } from 'next/navigation'
import { Plus } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
    searchParams: { q?: string; c?: string }
}

export default async function ClubsDiscoveryPage({ searchParams }: { searchParams: Promise<{ q?: string; c?: string }> }) {
    const session = await auth()
    if (!session?.user) return redirect('/api/auth/signin')

    const { q, c } = await searchParams

    // Fetch clubs based on params
    const clubs = await getRecommendedClubs({
        query: q,
        category: c,
        schoolId: session.user.schoolId || ''
    })

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header / Hero */}
            <div className="bg-white border-b border-slate-200">
                <div className="container mx-auto px-6 py-12">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight font-display mb-2">
                                Discovery Hub
                            </h1>
                            <p className="text-slate-500 font-medium">
                                Find your community on campus. Join clubs, events, and squads.
                            </p>
                        </div>
                        <Link
                            href="/clubs/create"
                            className="hidden md:flex items-center gap-2 btn-primary"
                        >
                            <Plus className="w-4 h-4" />
                            Start a Club
                        </Link>
                    </div>

                    {/* Search Component */}
                    <DiscoverySearch />
                </div>
            </div>

            {/* Results Grid */}
            <div className="container mx-auto px-6 py-12">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900">
                        {q || c ? 'Search Results' : 'Recommended For You'}
                    </h2>
                    <span className="text-sm text-slate-500 font-medium">
                        Showing {clubs.length} clubs
                    </span>
                </div>

                {clubs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {clubs.map((club) => (
                            <ClubCard key={club.id} club={club} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                        <div className="text-slate-400 mb-4">
                            <div className="w-16 h-16 bg-slate-100 rounded-full mx-auto flex items-center justify-center">
                                <SearchPlaceholderIcon />
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">No clubs found</h3>
                        <p className="text-slate-500">Try adjusting your filters or search terms.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

function SearchPlaceholderIcon() {
    return (
        <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
    )
}
