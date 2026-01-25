import { getFeed, getDiscussions } from '@/actions/feed'
import { auth } from '@/auth'
import VerticalReel from '@/components/Feed/VerticalReel'
import DiscussionFeed from '@/components/Feed/DiscussionFeed'
import { redirect } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, MessageSquare } from 'lucide-react'

export default async function FeedPage() {
    const session = await auth()
    if (!session?.user?.id) return redirect('/api/auth/signin')

    const schoolId = session.user.schoolId || ''

    // Server Component Fetch - Parallel
    const [pulseData, discussionData] = await Promise.all([
        getFeed({ schoolId }),
        getDiscussions({ schoolId })
    ])

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Tabs defaultValue="pulse" className="w-full h-full flex flex-col">
                {/* Header / Tab Switcher */}
                <header className="sticky top-16 lg:top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
                    <div className="container mx-auto px-4 h-14 flex items-center justify-center">
                        <TabsList className="bg-slate-100 p-1 rounded-full border border-slate-200">
                            <TabsTrigger value="pulse" className="rounded-full px-6 py-1.5 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all flex items-center gap-2 text-slate-500">
                                <Sparkles className="w-4 h-4" />
                                Pulse
                            </TabsTrigger>
                            <TabsTrigger value="discussions" className="rounded-full px-6 py-1.5 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all flex items-center gap-2 text-slate-500">
                                <MessageSquare className="w-4 h-4" />
                                Discussions
                            </TabsTrigger>
                        </TabsList>
                    </div>
                </header>

                <TabsContent value="pulse" className="flex-1 mt-0">
                    <VerticalReel
                        initialPosts={pulseData.posts}
                        schoolId={schoolId}
                        initialCursor={pulseData.nextCursor}
                    />
                </TabsContent>

                <TabsContent value="discussions" className="flex-1 mt-0 bg-slate-50 h-[calc(100vh-120px)] overflow-y-auto">
                    <DiscussionFeed
                        initialThreads={discussionData.threads}
                        schoolId={schoolId}
                        initialCursor={discussionData.nextCursor}
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
}

