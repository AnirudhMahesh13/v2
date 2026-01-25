
import { MessageCircle, Share2, MoreHorizontal, Flag, BookOpen, User, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

interface PulseRightSidebarProps {
    post: any
}

export function PulseRightSidebar({ post }: PulseRightSidebarProps) {
    if (!post) {
        return (
            <div className="hidden lg:flex flex-col h-[calc(100vh-64px)] w-80 xl:w-96 sticky top-16 bg-white border-l border-slate-200 p-6 text-slate-500">
                <p>Select a pulse to view details</p>
            </div>
        )
    }

    return (
        <div className="hidden lg:flex flex-col h-[calc(100vh-64px)] w-80 xl:w-96 sticky top-0 bg-white border-l border-slate-200 overflow-y-auto">
            <div className="p-6 space-y-8">

                {/* 1. Author & Context */}
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-indigo-100 shadow-sm">
                            {post.user.image ? (
                                <img src={post.user.image} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-600 text-2xl font-bold">
                                    {post.user.name?.[0]}
                                </div>
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 font-display">{post.user.name}</h2>
                            <p className="text-sm text-slate-500">@{post.user.name.toLowerCase().replace(/\s/g, '')}</p>
                        </div>
                    </div>

                    {post.course && (
                        <Link href={`/schools/${post.user.schoolId}/courses/${post.course.id}`} className="block group">
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-3 transition-all group-hover:border-indigo-200 group-hover:bg-indigo-50/50">
                                <div className="p-2 bg-white rounded-lg text-indigo-500 shadow-sm">
                                    <BookOpen className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Related Course</p>
                                    <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{post.course.code}</p>
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
                            </div>
                        </Link>
                    )}
                </div>

                {/* 2. Caption & Tags */}
                <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</h3>
                    <p className="text-slate-700 leading-relaxed font-medium">
                        {post.caption}
                    </p>
                    {post.vibeTag && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-sm font-semibold border border-amber-100">
                                #{post.vibeTag}
                            </span>
                        </div>
                    )}
                </div>

                {/* 3. Comments Placeholder */}
                <div className="flex-1 min-h-[200px] flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Comments</h3>
                        <span className="text-xs text-slate-500">0 comments</span>
                    </div>

                    <div className="flex-1 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-slate-400">
                        <div className="text-center p-6">
                            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm font-medium">No comments yet.</p>
                            <p className="text-xs">Be the first to share your thoughts!</p>
                        </div>
                    </div>

                    {/* Comment Input */}
                    <div className="mt-4 flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0"></div>
                        <input
                            type="text"
                            placeholder="Add a comment..."
                            className="flex-1 bg-transparent border-b border-slate-200 pb-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                    </div>
                </div>

                {/* 4. Actions */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                    <button className="flex items-center justify-center gap-2 p-3 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all font-semibold shadow-sm">
                        <Share2 className="w-4 h-4" />
                        Share
                    </button>
                    <button className="flex items-center justify-center gap-2 p-3 rounded-lg bg-white border border-slate-200 hover:bg-rose-50 text-slate-600 hover:text-rose-500 hover:border-rose-200 transition-all font-semibold shadow-sm">
                        <Flag className="w-4 h-4" />
                        Report
                    </button>
                </div>

            </div>
        </div>
    )
}

export function PulseLeftSidebar() {
    const trending = ["Exam Season", "Coffee Spots", "CS Professors", "Dorm Hacks", "Internships"]

    return (
        <div className="hidden lg:flex flex-col h-[calc(100vh-64px)] w-64 xl:w-72 sticky top-0 bg-white border-r border-slate-200 p-6 z-10">
            <div className="mb-8">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight font-display mb-1">My Feed</h1>
                <p className="text-slate-500 text-sm font-medium">Discover what's happening.</p>
            </div>

            <div className="space-y-8">
                <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Trending Now</h3>
                    <ul className="space-y-3">
                        {trending.map((tag, i) => (
                            <li key={i}>
                                <a href="#" className="flex items-center justify-between group">
                                    <span className="text-slate-600 font-medium group-hover:text-indigo-600 transition-colors">#{tag.replace(/\s/g, '')}</span>
                                    <span className="text-xs text-slate-400 font-medium bg-slate-100 px-2 py-0.5 rounded-full">{(5 - i) * 120}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Suggested Students</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="flex items-center gap-3 group cursor-pointer">
                                <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">Student Name</p>
                                    <p className="text-xs text-slate-500 truncate">Computer Science</p>
                                </div>
                                <button className="text-xs font-bold text-indigo-500 hover:text-indigo-700 bg-indigo-50 p-1.5 rounded-md">Follow</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-auto pt-6 border-t border-slate-100 text-xs text-slate-400 font-medium">
                <p>© 2024 Classmate</p>
                <div className="flex gap-2 mt-2">
                    <a href="#" className="hover:text-slate-600">Privacy</a>
                    <span>•</span>
                    <a href="#" className="hover:text-slate-600">Terms</a>
                </div>
            </div>
        </div>
    )
}
