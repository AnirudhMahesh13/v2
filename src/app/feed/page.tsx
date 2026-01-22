import { getPersonalizedFeed } from '@/actions/social'
import { FeedItem } from '@/components/feed/FeedItem'
import { AcademicIdentity } from '@/components/feed/AcademicIdentity'
import { Sparkles } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function FeedPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
    const params = await searchParams
    const filter = (params.filter === 'TRENDING' ? 'TRENDING' : 'ALL') as 'TRENDING' | 'ALL'

    const { items, user } = await getPersonalizedFeed(filter)

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Please log in to view your feed.</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* Left Sidebar - Navigation */}
                <div className="hidden lg:block lg:col-span-1">
                    <div className="sticky top-24 space-y-4">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                            <h3 className="font-bold text-slate-900 mb-2">Filters</h3>
                            <a href="/feed" className={`block w-full text-left px-3 py-2 rounded-lg font-medium text-sm mb-1 ${filter === 'ALL' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                                My Feed
                            </a>
                            <a href="/feed?filter=TRENDING" className={`block w-full text-left px-3 py-2 rounded-lg font-medium text-sm ${filter === 'TRENDING' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                                Trending at {user.schoolId ? 'My School' : 'Classmate'}
                            </a>
                        </div>
                    </div>
                </div>

                {/* Main Feed */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-5 h-5 text-indigo-500 fill-indigo-500" />
                        <h1 className="text-xl font-bold text-slate-900">
                            {filter === 'TRENDING' ? 'Trending Content' : 'Your Academic Feed'}
                        </h1>
                    </div>

                    {items.length > 0 ? (
                        items.map((item: any) => (
                            <FeedItem key={`${item.type}-${item.data.id}`} item={item} currentUser={user} />
                        ))
                    ) : (
                        <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 border-dashed">
                            <p className="text-slate-500">No activity yet. Follow some students or courses!</p>
                        </div>
                    )}
                </div>

                {/* Right Sidebar - Identity */}
                <div className="hidden lg:block lg:col-span-1">
                    <div className="sticky top-24">
                        <AcademicIdentity user={user} />

                        {/* Suggested Follows (Placeholder) */}
                        <div className="mt-6">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Recommended</h3>
                            {/* <SuggestedUserList /> */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
