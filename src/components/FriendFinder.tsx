'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserPlus, Sparkles, RefreshCw } from 'lucide-react'
import { getFriendRecommendations } from '@/actions/social'
import { sendFriendRequest } from '@/actions/social'
import { UserMiniCard } from './UserMiniCard'

interface RecommendedUser {
    id: string
    name: string | null
    image: string | null
    sharedCourseCount: number
    schoolName: string | undefined | null
    sharedCourseCodes: string[]
}

export default function FriendFinder({ isCollapsed }: { isCollapsed: boolean }) {
    const [recommendations, setRecommendations] = useState<RecommendedUser[]>([])
    const [loading, setLoading] = useState(true)
    const [sentRequests, setSentRequests] = useState<Set<string>>(new Set())
    const [hoveredUserId, setHoveredUserId] = useState<string | null>(null)

    useEffect(() => {
        loadRecommendations()
    }, [])

    const loadRecommendations = async () => {
        setLoading(true)
        try {
            const data = await getFriendRecommendations()
            setRecommendations(data as any)
        } finally {
            setLoading(false)
        }
    }

    const handleConnect = async (userId: string) => {
        setSentRequests(prev => new Set(prev).add(userId))

        // Optimistic UI updates could happen here (remove from list), 
        // but keeping it as "Sent" is better feedback.
        await sendFriendRequest(userId)
    }

    if (loading) {
        return (
            <div className={`p-4 flex ${isCollapsed ? 'justify-center' : 'justify-center'}`}>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-500"></div>
            </div>
        )
    }

    if (recommendations.length === 0) {
        return (
            <div className="p-4 text-center">
                {!isCollapsed && <p className="text-xs text-slate-400">No new recommendations.</p>}
                <button onClick={loadRecommendations} className={`mt-2 text-[10px] text-indigo-500 hover:underline flex items-center justify-center gap-1 w-full ${isCollapsed ? 'p-1' : ''}`}>
                    <RefreshCw size={10} /> {!isCollapsed && "Refresh"}
                </button>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            <div className={`px-4 py-2 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                {isCollapsed ? (
                    <div title="Discover">
                        <Sparkles size={16} className="text-amber-400" />
                    </div>
                ) : (
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Sparkles size={12} className="text-amber-400" />
                        Discover
                    </h3>
                )}
            </div>

            <div className="flex-1 space-y-1 p-2">
                {recommendations.map((user) => {
                    const isSent = sentRequests.has(user.id)
                    return (
                        <div
                            key={user.id}
                            className={`relative group ${isCollapsed ? 'flex justify-center' : ''}`}
                            onMouseEnter={() => setHoveredUserId(user.id)}
                            onMouseLeave={() => setHoveredUserId(null)}
                        >
                            <div className={`flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer ${isCollapsed ? 'p-1' : ''}`}>
                                {/* Avatar */}
                                <div className="w-8 h-8 rounded-full bg-slate-100 ring-1 ring-slate-200 overflow-hidden flex items-center justify-center shrink-0 relative">
                                    {user.image ? (
                                        <img src={user.image} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-[10px] font-bold text-slate-500">{user.name?.[0]}</span>
                                    )}

                                    {/* Action Overlay for Collapsed Mode */}
                                    {isCollapsed && (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            {isSent ? (
                                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                            ) : (
                                                <UserPlus size={12} className="text-white" />
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                {!isCollapsed && (
                                    <>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-700 truncate">{user.name}</p>
                                            <p className="text-[10px] text-slate-400 truncate">
                                                {user.sharedCourseCount} Shared Courses
                                            </p>
                                        </div>

                                        {/* Quick Action */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                if (!isSent) handleConnect(user.id)
                                            }}
                                            disabled={isSent}
                                            className={`p-1.5 rounded-md transition-all ${isSent
                                                ? 'bg-green-50 text-green-600'
                                                : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 opacity-0 group-hover:opacity-100'
                                                }`}
                                        >
                                            {isSent ? (
                                                <span className="text-[10px] font-bold">Sent</span>
                                            ) : (
                                                <UserPlus size={14} />
                                            )}
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Hover Card Portal/Absolute */}
                            <AnimatePresence>
                                {hoveredUserId === user.id && (
                                    <div className="hidden lg:block z-50"> {/* Only show on desktop for now */}
                                        <UserMiniCard
                                            user={user}
                                            onConnect={() => handleConnect(user.id)}
                                            isPending={isSent}
                                        />
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
