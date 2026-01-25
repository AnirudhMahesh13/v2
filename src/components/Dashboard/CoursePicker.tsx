'use client'

import { useState, useTransition, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Check, BookOpen, Clock, X } from 'lucide-react'
import { searchCourses, toggleCourseEnrollment } from '@/actions/enrollment'
import { useRouter } from 'next/navigation'

interface Course {
    id: string
    code: string
    name: string
}

interface CoursePickerProps {
    initialActive: string[]
    initialCompleted: string[]
}

export function CoursePicker({ initialActive, initialCompleted }: CoursePickerProps) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<Course[]>([])
    const [activeIds, setActiveIds] = useState<string[]>(initialActive)
    const [completedIds, setCompletedIds] = useState<string[]>(initialCompleted)
    const [tab, setTab] = useState<'ACTIVE' | 'COMPLETED'>('ACTIVE')
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    // Debounced Search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length >= 2) {
                const res = await searchCourses(query)
                setResults(res)
            } else {
                setResults([])
            }
        }, 300)
        return () => clearTimeout(timer)
    }, [query])

    const handleToggle = (course: Course) => {
        // Optimistic Update
        if (tab === 'ACTIVE') {
            const isActive = activeIds.includes(course.id)
            setActiveIds(prev => isActive ? prev.filter(id => id !== course.id) : [...prev, course.id])
            if (!isActive) setCompletedIds(prev => prev.filter(id => id !== course.id)) // Remove from past if adding to active
        } else {
            const isCompleted = completedIds.includes(course.id)
            setCompletedIds(prev => isCompleted ? prev.filter(id => id !== course.id) : [...prev, course.id])
            if (!isCompleted) setActiveIds(prev => prev.filter(id => id !== course.id)) // Remove from active if adding to past
        }

        startTransition(async () => {
            const res = await toggleCourseEnrollment(course.id, tab)
            if (res.active) setActiveIds(res.active)
            if (res.completed) setCompletedIds(res.completed)
            router.refresh()
        })
    }

    return (
        <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col h-[600px]">
            {/* Header / Tabs */}
            <div className="bg-slate-50 border-b border-slate-200 p-2 flex gap-2">
                <button
                    onClick={() => setTab('ACTIVE')}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${tab === 'ACTIVE'
                            ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200'
                            : 'text-slate-500 hover:bg-slate-100'
                        }`}
                >
                    <BookOpen className="w-4 h-4" /> Current Semester
                    <span className="bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full text-xs ml-1">{activeIds.length}</span>
                </button>
                <button
                    onClick={() => setTab('COMPLETED')}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${tab === 'COMPLETED'
                            ? 'bg-white text-emerald-600 shadow-sm ring-1 ring-slate-200'
                            : 'text-slate-500 hover:bg-slate-100'
                        }`}
                >
                    <Clock className="w-4 h-4" /> Past Courses
                    <span className="bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full text-xs ml-1">{completedIds.length}</span>
                </button>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-slate-100 relative z-10">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder={tab === 'ACTIVE' ? "Search for courses you're taking now..." : "Search courses you've finished..."}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                        autoFocus
                    />
                </div>
            </div>

            {/* Results Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
                {query.length < 2 && results.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                        <Search className="w-12 h-12 mb-3" />
                        <p className="font-medium">Type a course code (e.g. COMP)</p>
                    </div>
                ) : (
                    <motion.div layout className="grid grid-cols-1 gap-3">
                        <AnimatePresence mode='popLayout'>
                            {results.map((course) => {
                                const isSelected = tab === 'ACTIVE' ? activeIds.includes(course.id) : completedIds.includes(course.id)
                                const isOtherTab = tab === 'ACTIVE' ? completedIds.includes(course.id) : activeIds.includes(course.id)

                                return (
                                    <motion.button
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        key={course.id}
                                        onClick={() => handleToggle(course)}
                                        className={`w-full text-left p-4 rounded-xl border-2 flex items-center justify-between group transition-all ${isSelected
                                                ? (tab === 'ACTIVE' ? 'bg-indigo-50 border-indigo-500' : 'bg-emerald-50 border-emerald-500')
                                                : 'bg-white border-transparent hover:border-slate-200 shadow-sm'
                                            }`}
                                    >
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className={`font-black tracking-tight ${isSelected ? (tab === 'ACTIVE' ? 'text-indigo-700' : 'text-emerald-700') : 'text-slate-900'}`}>{course.code}</h4>
                                                {isOtherTab && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Moved</span>}
                                            </div>
                                            <p className="text-sm text-slate-500 font-medium line-clamp-1">{course.name}</p>
                                        </div>

                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isSelected
                                                ? (tab === 'ACTIVE' ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white')
                                                : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                                            }`}>
                                            {isSelected ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                        </div>
                                    </motion.button>
                                )
                            })}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
