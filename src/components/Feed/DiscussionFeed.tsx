'use client'

import { useState } from 'react'
import { getDiscussions } from '@/actions/feed'
import { MessageSquare, ThumbsUp, GraduationCap, MapPin, MoreHorizontal, Star, Trophy, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface DiscussionFeedProps {
    initialThreads: any[]
    schoolId: string
    initialCursor: string | null
}

export default function DiscussionFeed({ initialThreads, schoolId, initialCursor }: DiscussionFeedProps) {
    const [items, setItems] = useState(initialThreads)
    const [cursor, setCursor] = useState(initialCursor)
    const [isLoading, setIsLoading] = useState(false)

    const loadMore = async () => {
        if (!cursor || isLoading) return
        setIsLoading(true)
        const { threads: newItems, nextCursor } = await getDiscussions({ cursor, schoolId })
        setItems(prev => [...prev, ...newItems])
        setCursor(nextCursor)
        setIsLoading(false)
    }

    const renderHeader = (item: any) => (
        <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                    {item.user.image ? (
                        <img src={item.user.image} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold">
                            {item.user.name?.[0]}
                        </div>
                    )}
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 text-sm">{item.user.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                        {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                </div>
            </div>

            {/* Type Badge */}
            <div className="flex items-center gap-2">
                {item.type === 'BOUNTY' && (
                    <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-bold border border-amber-200 flex items-center gap-1">
                        <Trophy className="w-3 h-3" /> Bounty
                    </span>
                )}
                {item.type === 'REVIEW' && (
                    <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-bold border border-purple-200 flex items-center gap-1">
                        <Star className="w-3 h-3" /> Review
                    </span>
                )}
                <button className="text-slate-400 hover:text-slate-600">
                    <MoreHorizontal className="w-5 h-5" />
                </button>
            </div>
        </div>
    )

    return (
        <div className="w-full max-w-2xl mx-auto py-8">
            <div className="space-y-4">
                {items.map((item) => (
                    <div key={item.id} className={`bg-white rounded-xl border p-6 shadow-sm hover:shadow-md transition-shadow ${item.type === 'BOUNTY' ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200'
                        }`}>
                        {renderHeader(item)}

                        {/* Content */}
                        <div className="mb-4">
                            <div className="flex gap-2 mb-2 flex-wrap">
                                {item.course && (
                                    <Link
                                        href={`/schools/${schoolId}/courses/${item.course.id}`}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-600 text-xs font-semibold hover:bg-indigo-100 transition-colors"
                                    >
                                        <GraduationCap className="w-3.5 h-3.5" />
                                        {item.course.code}
                                    </Link>
                                )}
                                {item.professor && (
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-600 text-xs font-semibold">
                                        👨‍🏫 {item.professor.name}
                                    </div>
                                )}
                            </div>

                            {/* Title (for Threads & Bounties) */}
                            {item.title && <h2 className="text-lg font-bold text-slate-900 mb-1">{item.title}</h2>}

                            {/* Rating (for Reviews) */}
                            {item.type === 'REVIEW' && (
                                <div className="flex items-center gap-1 mb-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-4 h-4 ${i < item.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />
                                    ))}
                                    <span className="text-sm font-bold text-slate-700 ml-2">{item.rating}/5</span>
                                </div>
                            )}

                            {/* Reward (for Bounties) */}
                            {item.type === 'BOUNTY' && (
                                <div className="flex items-center gap-2 mb-3 bg-amber-100/50 p-2 rounded-lg border border-amber-100 text-amber-800 text-sm font-bold w-fit">
                                    <Trophy className="w-4 h-4" />
                                    Reward: {item.reward} Karma Points
                                </div>
                            )}

                            <p className="text-slate-600 leading-relaxed text-sm line-clamp-3 whitespace-pre-line">
                                {item.body || item.description || (item.type === 'BOUNTY' && 'Check out this task!')}
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center gap-6 pt-4 border-t border-slate-100">
                            {item.type === 'REVIEW' ? (
                                <span className="text-xs font-medium text-slate-400">Review</span>
                            ) : (
                                <>
                                    <button className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors text-sm font-medium">
                                        <ThumbsUp className="w-4 h-4" />
                                        <span>Upvote</span>
                                    </button>
                                    <button className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors text-sm font-medium">
                                        <MessageSquare className="w-4 h-4" />
                                        <span>{item._count?.comments || 0} Comments</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {items.length === 0 && (
                <div className="text-center py-20">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">No content yet</h3>
                    <p className="text-slate-500 max-w-xs mx-auto mt-2">Check back later for discussions.</p>
                </div>
            )}

            {/* Load More Button hidden for MVP mixed feed as cursor is complex */}
        </div>
    )
}
