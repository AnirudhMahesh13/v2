'use client'

import { format } from 'util' // Node only, avoid. Use native.
import { MessageSquare, Star, FileText, Download, ThumbsUp, ImageIcon } from 'lucide-react'
import { toggleVote } from '@/actions/social'
import { useState } from 'react'
import Link from 'next/link'

// Helper for dates
const formatDate = (dateString: Date) => {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric'
    }).format(new Date(dateString))
}

export function FeedItem({ item, currentUser }: { item: any, currentUser: any }) {
    const { type, data, date } = item
    const user = data.user

    // Optimistic UI for voting
    const [votes, setVotes] = useState(data.upvotes?.length || 0)
    const [hasVoted, setHasVoted] = useState(data.upvotes?.some((v: any) => v.userId === currentUser.id) || false)

    async function handleVote() {
        // Toggle Local State
        setVotes((prev: number) => hasVoted ? prev - 1 : prev + 1)
        setHasVoted(!hasVoted)

        // Server Action
        const result = await toggleVote(type, data.id)

        // Revert if server differs (optional, simplifing for now)
    }

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">
                        {user.image ? <img src={user.image} className="w-full h-full rounded-full" /> : user.name?.[0]}
                    </div>
                    <div>
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                            {user.name}
                            {user.karma > 100 && (
                                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold">
                                    Pro
                                </span>
                            )}
                        </div>
                        <div className="text-xs text-slate-500">
                            {formatDate(date)} •
                            {data.course && <span className="ml-1 font-mono bg-slate-100 px-1 rounded">{data.course.code}</span>}
                            {type === 'REVIEW' && <span className="ml-1 text-emerald-600 font-medium">wrote a review</span>}
                            {type === 'THREAD' && <span className="ml-1 text-violet-600 font-medium">started a discussion</span>}
                            {type === 'RESOURCE' && <span className="ml-1 text-blue-600 font-medium">shared a resource</span>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Body */}
            <div>
                {type === 'REVIEW' && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-1 mb-2">
                            <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-4 h-4 ${i < data.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                                ))}
                            </div>
                        </div>
                        <p className="text-slate-800">{data.body}</p>
                        {data.images && data.images.length > 0 && (
                            <div className="grid grid-cols-2 gap-2 mt-3">
                                {data.images.map((img: string, i: number) => (
                                    <img key={i} src={img} className="rounded-lg object-cover w-full h-48 bg-slate-100" />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {type === 'THREAD' && (
                    <div className="space-y-2">
                        <Link href={`/schools/${data.course?.schoolId || 'default'}/courses/${data.courseId}/threads/${data.id}`} className="block group">
                            <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors">{data.title}</h3>
                        </Link>
                        <p className="text-slate-600 line-clamp-3">{data.body}</p>
                        <div className="flex items-center gap-2 text-slate-400 text-sm mt-3">
                            <MessageSquare className="w-4 h-4" />
                            {data._count?.comments || 0} comments
                        </div>
                    </div>
                )}

                {type === 'RESOURCE' && (
                    <div className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl bg-slate-50">
                        <div className="p-3 bg-white rounded-lg border border-slate-100 text-slate-400">
                            <FileText className="w-8 h-8" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-slate-900">{data.title}</h4>
                            <p className="text-sm text-slate-500">{data.fileType} • Uploaded by {user.name}</p>
                        </div>
                        <a href={data.url} target="_blank" className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                            <Download className="w-5 h-5" />
                        </a>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-50 flex items-center gap-4">
                <button
                    onClick={handleVote}
                    className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${hasVoted ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'}`}
                >
                    <ThumbsUp className={`w-4 h-4 ${hasVoted ? 'fill-current' : ''}`} />
                    {votes || 'Like'}
                </button>
                {/* Add Comment Button Placeholder */}
            </div>
        </div>
    )
}
