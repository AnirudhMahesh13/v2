'use client'

import Link from 'next/link'
import { GraduationCap, BookOpen, Search, Users } from 'lucide-react'
import { Session } from 'next-auth'
import { signIn } from 'next-auth/react'
import { UserMenu } from './UserMenu'

export function Navigation({ user }: { user: Session['user'] | undefined }) {

    return (
        <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
            <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="p-1.5 bg-slate-900 rounded-lg group-hover:scale-105 transition-transform">
                        <GraduationCap className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-slate-900 tracking-tight font-display">Classmate</span>
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-8">
                    <Link href="/schools" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                        <Search className="w-4 h-4" />
                        Directory
                    </Link>
                    <Link href="/tutors" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                        <BookOpen className="w-4 h-4" />
                        Find Tutors
                    </Link>
                    <Link href="/clubs" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                        <Users className="w-4 h-4" />
                        Clubs
                    </Link>
                    {user && (
                        <Link href="/feed" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
                            <BookOpen className="w-4 h-4 text-indigo-500" />
                            My Feed
                        </Link>
                    )}
                </div>

                {/* Auth State */}
                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-4 pl-6 border-l border-slate-200">
                            <UserMenu user={user} />
                        </div>
                    ) : (
                        <button
                            onClick={() => signIn('google')}
                            className="btn-primary py-2 px-5 text-sm"
                        >
                            Get Started
                        </button>
                    )}
                </div>
            </div>
        </nav>
    )
}
