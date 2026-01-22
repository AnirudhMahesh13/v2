import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { getCommonCourses, sendFriendRequest, updateFriendRequestStatus } from "@/actions/social"
import { Users, BookOpen, MessageSquare, UserPlus, Check, Clock } from "lucide-react"

export default async function ProfilePage({ params }: { params: { id: string } }) {
    const session = await auth()
    const currentUserId = session?.user?.id
    const targetUserId = params.id

    if (currentUserId === targetUserId) {
        redirect('/dashboard')
    }

    const user = await prisma.user.findUnique({
        where: { id: targetUserId },
        include: {
            school: true,
            _count: {
                select: {
                    following: true,
                    followedBy: true
                }
            }
        }
    })

    if (!user) notFound()

    // Check Friendship Status
    let friendshipStatus: 'NONE' | 'PENDING' | 'ACCEPTED' | 'DECLINED' = 'NONE'
    let existingRequest = null
    let isRequester = false

    if (currentUserId) {
        const friendship = await prisma.friendship.findFirst({
            where: {
                OR: [
                    { requesterId: currentUserId, addresseeId: targetUserId },
                    { requesterId: targetUserId, addresseeId: currentUserId }
                ]
            }
        })

        if (friendship) {
            friendshipStatus = friendship.status
            existingRequest = friendship
            isRequester = friendship.requesterId === currentUserId
        }
    }

    // Get Common Courses
    const commonCourses = currentUserId ? await getCommonCourses(targetUserId) : []

    return (
        <div className="min-h-screen pb-20">
            {/* Banner */}
            <div className="h-48 bg-gradient-to-r from-indigo-600 to-purple-600 relative">
                <div className="absolute inset-0 bg-black/20"></div>
            </div>

            <div className="max-w-4xl mx-auto px-6 -mt-16 relative z-10">
                <div className="flex flex-col md:flex-row gap-6 items-end md:items-start">
                    {/* Avatar */}
                    <div className="w-32 h-32 rounded-2xl bg-white p-1 shadow-xl">
                        <div className="w-full h-full rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden">
                            {user.image ? (
                                <img src={user.image} alt={user.name || ''} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-4xl font-bold text-slate-300">{user.name?.[0]}</span>
                            )}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 pt-2 md:pt-16 dark:text-white">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-bold">{user.name}</h1>
                                <p className="text-white/60 font-medium">{user.school?.name || 'Student'}</p>
                            </div>

                            {/* Actions */}
                            {currentUserId && (
                                <div className="flex gap-3">
                                    {friendshipStatus === 'ACCEPTED' ? (
                                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition shadow-lg shadow-blue-500/20">
                                            <MessageSquare size={18} />
                                            Message
                                        </button>
                                    ) : friendshipStatus === 'PENDING' ? (
                                        <button disabled className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white/60 rounded-lg cursor-not-allowed">
                                            <Clock size={18} />
                                            {isRequester ? 'Request Sent' : 'Pending Approval'}
                                        </button>
                                    ) : (
                                        <form action={async () => {
                                            'use server'
                                            await sendFriendRequest(targetUserId)
                                        }}>
                                            <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-slate-100 transition shadow-lg">
                                                <UserPlus size={18} />
                                                Connect
                                            </button>
                                        </form>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="flex gap-6 mt-6">
                            <div className="flex items-center gap-2 text-white/60">
                                <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-xs ring-1 ring-orange-500/40">
                                    {user.karma}
                                </div>
                                <span className="text-sm font-medium">Karma</span>
                            </div>
                            <div className="flex items-center gap-2 text-white/60">
                                <Users size={18} />
                                <span className="text-sm font-medium">{user._count.followedBy} Followers</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 text-white">
                    {/* Main Logic: Common Ground */}
                    <div className="md:col-span-2 space-y-8">
                        {/* Common Courses */}
                        <section>
                            <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                                <BookOpen size={20} className="text-blue-400" />
                                Shared Courses
                            </h2>
                            {commonCourses.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {commonCourses.map(course => (
                                        <div key={course.id} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition">
                                            <div className="font-bold text-blue-200">{course.code}</div>
                                            <div className="text-sm text-white/60 truncate">{course.name}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-6 rounded-xl bg-white/5 border border-white/5 text-center text-white/40 italic">
                                    No shared courses found.
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        {/* Bio or Quick Info could go here */}
                        <div className="p-6 rounded-xl bg-white/5 border border-white/5">
                            <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-4">About</h3>
                            <p className="text-sm text-white/60 leading-relaxed">
                                Student at {user.school?.name}.
                                Joined Classmate to collaborate and learn.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
