
'use client'

import { Mail, UserPlus, Check, MessageSquare } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toggleFollow } from '@/actions/social'

export function ProfileHeader({ profile }: { profile: any }) {
    const { user, isFollowing, isOwnProfile } = profile

    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const handleFollow = () => {
        startTransition(async () => {
            await toggleFollow(user.id)
        })
    }

    const handleMessage = () => {
        router.push(`?chat=${user.id}`)
    }

    return (
        <div className="bg-white border-b border-slate-200 shadow-sm relative z-20">
            {/* Cover Banner */}
            <div className="h-64 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>

            <div className="container mx-auto px-6 pb-8">
                <div className="flex flex-col md:flex-row items-end -mt-20 gap-6 relative z-30">
                    {/* Avatar */}
                    <div className="w-40 h-40 rounded-full border-4 border-white bg-slate-100 shadow-2xl overflow-hidden shrink-0 ring-1 ring-slate-900/5 relative group">
                        {user.image ? (
                            <img
                                src={user.image}
                                alt={user.name || 'User'}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500 block"
                                style={{ width: '100%', height: '100%' }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-500 text-5xl font-bold">
                                {user.name?.[0]}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 mb-2 pt-2 md:pt-0 text-center md:text-left">
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight font-display mb-1 drop-shadow-sm">{user.name}</h1>
                        <p className="text-slate-600 font-medium text-lg flex items-center justify-center md:justify-start gap-2">
                            <span>{user.bio || 'Computer Science Student'}</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-indigo-600 font-semibold">{user.school?.name}</span>
                        </p>

                        <div className="flex items-center justify-center md:justify-start gap-8 mt-5">
                            <Stat label="Karma" value={user.karma} />
                            <Stat label="Followers" value={user._count.followedBy} />
                            <Stat label="Following" value={user._count.following} />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 mb-4 w-full md:w-auto justify-center md:justify-start">
                        {!isOwnProfile && (
                            <>
                                <button
                                    onClick={handleMessage}
                                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 transition-all shadow-sm active:scale-95 cursor-pointer"
                                >
                                    <MessageSquare className="w-5 h-5" />
                                    <span>Message</span>
                                </button>
                                <button
                                    onClick={handleFollow}
                                    disabled={isPending}
                                    className={`flex items-center justify-center gap-2 px-6 py-2.5 font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer text-white min-w-[140px] ${isFollowing
                                        ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'
                                        : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30 hover:shadow-indigo-600/40'
                                        }`}
                                >
                                    {isFollowing ? (
                                        <>
                                            <Check className="w-5 h-5" /> Following
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="w-5 h-5" /> Follow
                                        </>
                                    )}
                                </button>
                            </>
                        )}
                        {isOwnProfile && (
                            <button className="px-6 py-2.5 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all cursor-pointer">
                                Edit Profile
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function Stat({ label, value }: { label: string, value: number }) {
    return (
        <div className="flex flex-col">
            <span className="font-black text-slate-900 text-lg">{value}</span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</span>
        </div>
    )
}
