'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { User, Settings, LogOut, ChevronDown } from 'lucide-react'

interface UserMenuProps {
    user: {
        id?: string
        name?: string | null
        email?: string | null
        image?: string | null
    }
}

export function UserMenu({ user }: UserMenuProps) {
    const [isOpen, setIsOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-slate-100 transition-colors group focus:outline-none"
            >
                <div className="text-right hidden md:block">
                    <p className="text-sm font-bold text-slate-700 leading-none group-hover:text-slate-900">{user.name}</p>
                </div>
                <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-indigo-100 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center">
                        {user.image ? (
                            <img src={user.image} alt={user.name || "User"} className="w-full h-full object-cover" />
                        ) : (
                            <span className="font-bold text-indigo-600 text-sm">
                                {user.name?.charAt(0) ?? 'U'}
                            </span>
                        )}
                    </div>
                </div>
                <ChevronDown
                    size={14}
                    className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 origin-top-right"
                    >
                        <div className="p-2 space-y-1">
                            {/* Profile Link */}
                            <Link
                                href={`/profile/${user.id}`}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-slate-600 hover:text-indigo-600 transition-colors group"
                                onClick={() => setIsOpen(false)}
                            >
                                <div className="p-2 rounded-lg bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                    <User size={16} />
                                </div>
                                <span className="font-medium text-sm">Profile</span>
                            </Link>

                            {/* Settings Link */}
                            <Link
                                href="/settings"
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-slate-600 hover:text-indigo-600 transition-colors group"
                                onClick={() => setIsOpen(false)}
                            >
                                <div className="p-2 rounded-lg bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                    <Settings size={16} />
                                </div>
                                <span className="font-medium text-sm">Settings</span>
                            </Link>

                            <div className="h-px bg-slate-100 my-1 mx-2" />

                            {/* Sign Out Button */}
                            <button
                                onClick={() => signOut()}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 text-slate-600 hover:text-red-600 transition-colors group"
                            >
                                <div className="p-2 rounded-lg bg-slate-100 text-slate-500 group-hover:bg-red-100 group-hover:text-red-600 transition-colors">
                                    <LogOut size={16} />
                                </div>
                                <span className="font-medium text-sm">Sign Out</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
