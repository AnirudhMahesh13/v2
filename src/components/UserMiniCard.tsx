'use client'

import { motion } from 'framer-motion'
import { GraduationCap, BookOpen, MapPin } from 'lucide-react'
import { RecommendedUser } from '@/actions/discovery'

interface UserMiniCardProps {
    user: RecommendedUser
    onConnect: () => void
    isPending: boolean
}

export function UserMiniCard({ user, onConnect, isPending }: UserMiniCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute right-[290px] top-0 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 p-4"
        >
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                    {user.image ? (
                        <img src={user.image} alt={user.name || ''} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-xl font-bold text-slate-400">{user.name?.[0]}</span>
                    )}
                </div>
                <div>
                    <h3 className="font-bold text-slate-800">{user.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                        <GraduationCap size={12} />
                        {user.schoolName || 'Student'}
                    </p>
                </div>
            </div>

            {/* Context Stats */}
            <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2 text-xs text-slate-600">
                    <BookOpen size={14} className="mt-0.5 text-indigo-500" />
                    <div>
                        <span className="font-semibold text-indigo-600">{user.sharedCourseCount} Shared Courses</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {user.sharedCourseCodes.slice(0, 3).map(code => (
                                <span key={code} className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] text-slate-500 border border-slate-200">
                                    {code}
                                </span>
                            ))}
                            {user.sharedCourseCodes.length > 3 && (
                                <span className="text-[10px] text-slate-400">+{user.sharedCourseCodes.length - 3} more</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Action */}
            <button
                onClick={(e) => {
                    e.stopPropagation()
                    onConnect()
                }}
                disabled={isPending}
                className="w-full py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isPending ? 'Request Sent' : 'Connect'}
            </button>
        </motion.div>
    )
}
