
import { BookOpen, Users } from 'lucide-react'

export function SharedContext({ commonGround }: { commonGround: any }) {
    const hasCourses = commonGround.courses.length > 0
    const hasClubs = commonGround.clubs.length > 0

    if (!hasCourses && !hasClubs) return null

    return (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-6 flex flex-col md:flex-row md:items-center gap-4">
            <div className="shrink-0 bg-indigo-100 p-2 rounded-full">
                <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
                <h3 className="text-sm font-bold text-indigo-900">Common Ground</h3>
                <p className="text-sm text-indigo-700 leading-relaxed">
                    You both share
                    {hasCourses && (
                        <span className="font-semibold"> {commonGround.courses.length} courses </span>
                    )}
                    {hasCourses && hasClubs && 'and'}
                    {hasClubs && (
                        <span className="font-semibold"> {commonGround.clubs.length} clubs</span>
                    )}
                    .
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                    {commonGround.courses.map((c: any) => (
                        <span key={c.id} className="text-xs font-medium px-2 py-0.5 bg-white text-indigo-600 rounded-md border border-indigo-100 shadow-sm">
                            {c.code}
                        </span>
                    ))}
                    {commonGround.clubs.map((c: any) => (
                        <span key={c.id} className="text-xs font-medium px-2 py-0.5 bg-white text-indigo-600 rounded-md border border-indigo-100 shadow-sm">
                            {c.name}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    )
}
