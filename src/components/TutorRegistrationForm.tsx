'use client'

import { useState } from 'react'
import { getCoursesForSchool, registerTutor } from '@/actions/tutors'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

interface School {
    id: string
    name: string
}

interface Course {
    id: string
    name: string
    code: string
}

export function TutorRegistrationForm({ schools }: { schools: School[] }) {
    const [courses, setCourses] = useState<Course[]>([])
    const [loadingCourses, setLoadingCourses] = useState(false)
    const [selectedSchoolId, setSelectedSchoolId] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    async function handleSchoolChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const schoolId = e.target.value
        setSelectedSchoolId(schoolId)
        if (!schoolId) {
            setCourses([])
            return
        }

        setLoadingCourses(true)
        try {
            const data = await getCoursesForSchool(schoolId)
            setCourses(data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoadingCourses(false)
        }
    }

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true)
        try {
            await registerTutor(formData)
        } catch (error) {
            console.error(error)
            setIsSubmitting(false)
        }
    }

    return (
        <form action={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Select App School</label>
                <select
                    onChange={handleSchoolChange}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    required
                >
                    <option value="">Select a school...</option>
                    {schools.map(school => (
                        <option key={school.id} value={school.id}>{school.name}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Select Course to Teach</label>
                <div className="relative">
                    <select
                        name="courseId"
                        disabled={!selectedSchoolId || loadingCourses}
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-400"
                        required
                    >
                        <option value="">
                            {!selectedSchoolId ? 'Select a school first' :
                                loadingCourses ? 'Loading courses...' :
                                    courses.length === 0 ? 'No courses found' : 'Select a course...'}
                        </option>
                        {courses.map(course => (
                            <option key={course.id} value={course.id}>{course.code} - {course.name}</option>
                        ))}
                    </select>
                    {loadingCourses && (
                        <div className="absolute right-3 top-3.5">
                            <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                        </div>
                    )}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Hourly Rate ($)</label>
                <input
                    name="hourlyRate"
                    type="number"
                    min="1"
                    placeholder="25"
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">About You</label>
                <textarea
                    name="description"
                    rows={4}
                    placeholder="Tell students why you're a great tutor..."
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    required
                />
            </div>

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="block w-full py-4 bg-indigo-600 text-white font-bold text-center rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Registering...
                        </>
                    ) : (
                        'Complete Registration'
                    )}
                </button>
                <p className="text-xs text-center text-slate-400 mt-4">
                    By registering, you agree to our terms of service. Payments are processed securely via Stripe.
                </p>
            </div>
        </form>
    )
}
