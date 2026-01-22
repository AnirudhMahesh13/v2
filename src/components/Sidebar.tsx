'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Users, Trophy, Zap, ChevronLeft, ChevronRight, Home, School } from 'lucide-react'
import { getOnlineFriends } from '@/actions/presence'

interface SidebarProps {
    user: any
}

export function Sidebar({ user }: SidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [friends, setFriends] = useState<any[]>([])
    const pathname = usePathname()

    useEffect(() => {
        // Poll friends
        const load = () => getOnlineFriends().then(setFriends)
        load()
        const interval = setInterval(load, 30000)
        return () => clearInterval(interval)
    }, [])

    const toggle = () => setIsCollapsed(!isCollapsed)

    // Framer Variants
    const sidebarVariants = {
        open: { width: 280, transition: { type: "spring", stiffness: 300, damping: 30 } },
        closed: { width: 80, transition: { type: "spring", stiffness: 300, damping: 30 } }
    }

    return (
        <motion.aside
            initial="open"
            animate={isCollapsed ? "closed" : "open"}
            variants={sidebarVariants}
            className="fixed left-0 top-16 bottom-0 z-40 bg-white border-r border-slate-200 shadow-xl hidden lg:flex flex-col overflow-hidden"
        >
            {/* Toggle Button */}
            <button
                onClick={toggle}
                className="absolute -right-3 top-6 bg-white border border-slate-200 rounded-full p-1 shadow-sm text-slate-500 hover:text-indigo-600 z-50"
            >
                {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
            </button>

            <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-8 scrollbar-thin">

                {/* 1. SHORTCUTS */}
                <div className="space-y-2">
                    {!isCollapsed && <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Workspace</h3>}
                    <NavItem href="/dashboard" icon={Home} label="Dashboard" active={pathname === '/dashboard'} collapsed={isCollapsed} />
                    <NavItem href="/schools" icon={School} label="Directory" active={pathname === '/schools'} collapsed={isCollapsed} />
                    <NavItem href="/feed" icon={Zap} label="My Feed" active={pathname === '/feed'} collapsed={isCollapsed} />
                </div>

                {/* 2. ENROLLED COURSES */}
                <div className="space-y-2">
                    {!isCollapsed && <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Enrolled</h3>}
                    {user.enrolledCourseIds?.length > 0 ? (
                        user.enrolledCourseIds.map((id: string) => (
                            <Link key={id} href={`/schools/${user.schoolId || 'default'}/courses/${id}`} className="block">
                                <div className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${pathname.includes(id) ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs shrink-0">
                                        {/* Ideally fetch course code, using ID hash for now */}
                                        {id.substring(0, 2).toUpperCase()}
                                    </div>
                                    {!isCollapsed && (
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">Course {id.substring(0, 6)}...</p>
                                        </div>
                                    )}
                                </div>
                            </Link>
                        ))
                    ) : (
                        !isCollapsed && <p className="text-xs text-slate-400 pl-2">No courses enrolled.</p>
                    )}
                </div>


            </div>

            {/* 4. KARMA & PROFILE */}
            <div className="p-4 border-t border-slate-100">
                <div className={`bg-slate-900 rounded-xl p-3 flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
                    <div className="relative shrink-0">
                        {/* Ring */}
                        <svg className="w-10 h-10 transform -rotate-90">
                            <circle cx="20" cy="20" r="18" fill="transparent" stroke="#334155" strokeWidth="3" />
                            <circle cx="20" cy="20" r="18" fill="transparent" stroke="#818cf8" strokeWidth="3" strokeDasharray="113" strokeDashoffset={113 - (113 * (Math.min(user.karma || 0, 100) / 100))} />
                        </svg>
                        <Trophy className="w-4 h-4 text-amber-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    {!isCollapsed && (
                        <div>
                            <p className="text-white text-xs font-bold">{user.karma || 0} Karma</p>
                            <p className="text-slate-400 text-[10px]">Level {Math.floor((user.karma || 0) / 50) + 1}</p>
                        </div>
                    )}
                </div>
            </div>
        </motion.aside>
    )
}

function NavItem({ href, icon: Icon, label, active, collapsed }: any) {
    return (
        <Link href={href} className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>
            <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-indigo-600' : 'text-slate-400'}`} />
            {!collapsed && <span className="text-sm font-medium">{label}</span>}
        </Link>
    )
}
