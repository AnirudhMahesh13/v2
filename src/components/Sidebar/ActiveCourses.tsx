'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getEnrolledCoursesDetails } from '@/actions/enrollment'

interface Course {
    id: string
    code: string
    name: string
    schoolId: string
}

export function ActiveCourses({ isCollapsed }: { isCollapsed: boolean }) {
    const [courses, setCourses] = useState<Course[]>([])
    const pathname = usePathname()

    useEffect(() => {
        const fetchCourses = async () => {
            const data = await getEnrolledCoursesDetails()
            setCourses(data as any)
        }
        fetchCourses()

        // Listen for cache revalidation events if possible, or simple interval
        // For MVP, we rely on the fact that toggleCourseEnrollment revalidates '/dashboard'
        // But since this is a client component inside a layout (maybe?), we might need polling or just rely on page nav
        // Let's add a slow poll for ensuring sync
        const interval = setInterval(fetchCourses, 5000)
        return () => clearInterval(interval)
    }, [])

    if (courses.length === 0) {
        return !isCollapsed ? (
            <div className="px-2 py-4 text-center border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                <p className="text-xs text-slate-500 mb-2">No active courses.</p>
                <Link href="/onboarding/courses" className="text-xs font-bold text-indigo-600 hover:underline">
                    + Add Courses
                </Link>
            </div>
        ) : null
    }

    return (
        <div className="space-y-1">
            {courses.map(course => (
                <Link key={course.id} href={`/schools/${course.schoolId}/courses/${course.id}`} className="block group">
                    <div className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${pathname.includes(course.id) ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0 transition-colors ${pathname.includes(course.id) ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
                            {course.code.substring(0, 4)}
                        </div>
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold truncate">{course.code}</p>
                                <p className="text-[10px] text-slate-400 truncate">{course.name}</p>
                            </div>
                        )}
                    </div>
                </Link>
            ))}
        </div>
    )
}
