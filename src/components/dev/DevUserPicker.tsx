'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { User } from '@prisma/client'
import { Terminal, X, ChevronUp, User as UserIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface DevUserPickerProps {
    users: (User & { school: { name: string } | null })[]
}

export function DevUserPicker({ users }: DevUserPickerProps) {
    const [isOpen, setIsOpen] = useState(false)

    if (process.env.NODE_ENV === 'production') return null

    return (
        <div className="fixed bottom-4 left-4 z-50 font-sans">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="mb-4 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden w-80"
                    >
                        <div className="bg-slate-800 px-4 py-3 flex items-center justifies-between border-b border-slate-700">
                            <div className="flex items-center gap-2 text-indigo-400 font-mono text-sm font-bold">
                                <Terminal size={14} />
                                <span>Dev Login</span>
                            </div>
                        </div>
                        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
                            {users.map(user => (
                                <button
                                    key={user.id}
                                    onClick={() => signIn('credentials', { email: user.email })}
                                    className="w-full text-left p-2 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-3 group"
                                >
                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 shrink-0 group-hover:bg-indigo-500/20 group-hover:text-indigo-400">
                                        {user.image ? (
                                            <img src={user.image} className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            <UserIcon size={14} />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-sm font-medium text-slate-200 truncate">{user.name}</div>
                                        <div className="text-xs text-slate-500 truncate">{user.school?.name ?? 'No School'}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 border border-slate-800 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all"
            >
                {isOpen ? <X size={18} /> : <Terminal size={18} />}
            </button>
        </div>
    )
}
