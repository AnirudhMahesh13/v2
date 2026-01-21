import { prisma } from '@/lib/prisma'
import { Building2, Plus, Globe } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function SchoolManagementPage() {
    const schools = await prisma.school.findMany({
        include: {
            _count: { select: { users: true, courses: true } }
        },
        orderBy: { name: 'asc' }
    })

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 font-display">School Management</h2>
                    <p className="text-slate-500">Manage university domains and assets.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors">
                    <Plus className="w-5 h-5" />
                    Add School
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {schools.map(school => (
                    <div key={school.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center p-2">
                                {school.logoUrl ? (
                                    <img src={school.logoUrl} alt={school.name} className="w-full h-full object-contain" />
                                ) : (
                                    <Building2 className="w-6 h-6 text-slate-300" />
                                )}
                            </div>
                            <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-500">
                                {school.domain}
                            </span>
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 mb-1">{school.name}</h3>
                        <a href={`https://${school.domain}`} target="_blank" rel="noreferrer" className="text-sm text-indigo-600 hover:underline flex items-center gap-1 mb-6">
                            <Globe className="w-3 h-3" /> Visit Website
                        </a>

                        <div className="mt-auto grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                            <div>
                                <div className="text-2xl font-bold text-slate-900">{school._count.courses}</div>
                                <div className="text-xs text-slate-500 font-medium">Courses</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-slate-900">{school._count.users}</div>
                                <div className="text-xs text-slate-500 font-medium">Students</div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Empty State / Add New Card */}
                <button className="bg-slate-50 border-2 border-dashed border-slate-200 p-6 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:border-indigo-300 hover:text-indigo-600 transition-all group">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                        <Plus className="w-6 h-6" />
                    </div>
                    <span className="font-bold">Register New University</span>
                </button>
            </div>
        </div>
    )
}
