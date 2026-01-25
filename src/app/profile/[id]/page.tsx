
import { auth } from '@/auth'
import { getProfileData } from '@/actions/profile'
import { notFound, redirect } from 'next/navigation'
import { ProfileHeader } from '@/components/Profile/ProfileHeader'
import { SharedContext } from '@/components/Profile/SharedContext'
import { AcademicTimeline } from '@/components/Profile/AcademicTimeline'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Activity, LayoutGrid, Users } from 'lucide-react'
import { ClubCard } from '@/components/Clubs/ClubCard'

interface PageProps {
    params: { id: string }
}

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session?.user) return redirect('/api/auth/signin')

    const { id } = await params
    const profile = await getProfileData(id)

    if (!profile) return notFound()

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <ProfileHeader profile={profile} />

            <div className="container mx-auto px-4 py-8">
                {/* Common Ground (Only if viewing someone else) */}
                {!profile.isOwnProfile && <SharedContext commonGround={profile.commonGround} />}

                <Tabs defaultValue="timeline" className="w-full">
                    <TabsList className="h-12 bg-transparent p-0 gap-8 mb-8 border-b border-slate-200 w-full justify-start rounded-none">
                        <TabsTrigger value="timeline" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:shadow-none px-0 font-medium text-slate-500 data-[state=active]:text-indigo-600 transition-all flex items-center gap-2">
                            <BookOpen className="w-4 h-4" /> Timeline
                        </TabsTrigger>
                        <TabsTrigger value="clubs" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:shadow-none px-0 font-medium text-slate-500 data-[state=active]:text-indigo-600 transition-all flex items-center gap-2">
                            <Users className="w-4 h-4" /> Clubs
                        </TabsTrigger>
                        <TabsTrigger value="activity" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:shadow-none px-0 font-medium text-slate-500 data-[state=active]:text-indigo-600 transition-all flex items-center gap-2">
                            <Activity className="w-4 h-4" /> Activity
                        </TabsTrigger>
                        <TabsTrigger value="resources" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:shadow-none px-0 font-medium text-slate-500 data-[state=active]:text-indigo-600 transition-all flex items-center gap-2">
                            <LayoutGrid className="w-4 h-4" /> Resources
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="timeline" className="focus:outline-none max-w-4xl">
                        <AcademicTimeline courses={profile.enrolledCourses} />
                    </TabsContent>

                    <TabsContent value="clubs" className="focus:outline-none">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {profile.user.clubMemberships.map((m: any) => (
                                <ClubCard key={m.club.id} club={m.club} />
                            ))}
                            {profile.user.clubMemberships.length === 0 && (
                                <div className="col-span-3 text-center py-12 text-slate-500">
                                    No clubs joined yet.
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="activity" className="focus:outline-none">
                        <div className="max-w-2xl mx-auto text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
                            <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500">Activity feed coming soon...</p>
                        </div>
                    </TabsContent>

                    <TabsContent value="resources" className="focus:outline-none">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Resources Placeholder */}
                            {profile.user.resources.length === 0 && (
                                <div className="col-span-3 text-center py-12 text-slate-500">
                                    No resources uploaded.
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
