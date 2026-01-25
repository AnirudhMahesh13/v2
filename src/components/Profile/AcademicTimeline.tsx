
import { BookOpen } from 'lucide-react'

export function AcademicTimeline({ courses }: { courses: any[] }) {
    // Group courses by level (1000, 2000, etc) to simulate years for MVP
    const years = {
        'First Year': courses.filter(c => c.code.match(/[A-Z]{4}1\d{3}/)),
        'Second Year': courses.filter(c => c.code.match(/[A-Z]{4}2\d{3}/)),
        'Third Year': courses.filter(c => c.code.match(/[A-Z]{4}3\d{3}/)),
        'Fourth Year': courses.filter(c => c.code.match(/[A-Z]{4}4\d{3}/)),
    }

    return (
        <div className="space-y-8">
            {Object.entries(years).map(([year, yearCourses]) => (
                yearCourses.length > 0 && (
                    <div key={year} className="relative pl-8 border-l-2 border-slate-100 last:border-0 pb-8 last:pb-0">
                        <div className="absolute top-0 left-[-9px] w-4 h-4 rounded-full bg-slate-200 border-2 border-white" />

                        <h3 className="text-lg font-bold text-slate-900 mb-4">{year}</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {yearCourses.map((course: any) => (
                                <div key={course.id} className="bg-white p-4 rounded-xl border border-slate-200 flex items-start gap-4">
                                    <div className="p-2 bg-indigo-50 rounded-lg shrink-0">
                                        <BookOpen className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900">{course.code}</div>
                                        <div className="text-sm text-slate-500 line-clamp-1">{course.name}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            ))}
            {courses.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                    No enrolled courses visible.
                </div>
            )}
        </div>
    )
}
