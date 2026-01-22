'use client'

import { useEffect, useState } from 'react'
import { getCoursePresenceCount } from '@/actions/presence'
import { Users, Loader2 } from 'lucide-react'

export function PresenceWidget({ courseId }: { courseId: string }) {
    const [count, setCount] = useState<number | null>(null)

    useEffect(() => {
        getCoursePresenceCount(courseId).then(setCount)

        // Poll every 30s
        const interval = setInterval(() => {
            getCoursePresenceCount(courseId).then(setCount)
        }, 30000)

        return () => clearInterval(interval)
    }, [courseId])

    if (count === null) return null // loading

    return (
        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full text-indigo-700 text-xs font-bold shadow-sm animate-in fade-in">
            <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span>{count > 0 ? `${count} Studying Now` : 'Library Empty'}</span>
        </div>
    )
}
