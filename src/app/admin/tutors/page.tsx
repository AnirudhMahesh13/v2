import { prisma } from '@/lib/prisma'
import { CheckCircle, XCircle, FileText, BadgeCheck } from 'lucide-react'
import { VerifyTutorButton, RevokeTutorButton, AutoVerifyTrigger } from '@/components/admin/AdminActions'

export const dynamic = 'force-dynamic'

export default async function TutorManagementPage() {
    // Fetch unverified tutors or those with pending requests
    // For now, listing all tutors
    const listings = await prisma.tutorListing.findMany({
        include: { tutor: true, course: true },
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-slate-900 font-display">Tutor Management</h2>
                <p className="text-slate-500">Verify experts and handle appeals.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 font-bold text-slate-900">Tutor</th>
                            <th className="px-6 py-4 font-bold text-slate-900">Course</th>
                            <th className="px-6 py-4 font-bold text-slate-900">Trust Score</th>
                            <th className="px-6 py-4 font-bold text-slate-900">Status</th>
                            <th className="px-6 py-4 font-bold text-slate-900">Evidence</th>
                            <th className="px-6 py-4 font-bold text-slate-900">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {listings.map(listing => (
                            <tr key={listing.id} className="hover:bg-slate-50/50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">
                                            {listing.tutor.name?.[0]}
                                        </div>
                                        <span className="font-medium text-slate-900">{listing.tutor.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">{listing.course.code}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1">
                                        <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${listing.trustScore >= 40 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                                style={{ width: `${listing.trustScore}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-bold">{listing.trustScore.toFixed(0)}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {listing.isVerified ? (
                                        <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-1 rounded-full">
                                            <BadgeCheck className="w-3 h-3" /> VERIFIED
                                        </span>
                                    ) : (
                                        <span className="text-amber-600 font-bold text-xs bg-amber-50 px-2 py-1 rounded-full">PENDING</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="space-y-1">
                                        {listing.gradeEvidenceUrl ? (
                                            <a href="#" className="text-indigo-600 hover:underline flex items-center gap-1">
                                                <FileText className="w-3 h-3" /> View PDF
                                            </a>
                                        ) : (
                                            <span className="text-slate-400 italic">No file</span>
                                        )}
                                        <AutoVerifyTrigger listingId={listing.id} />
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-2">
                                        <VerifyTutorButton listingId={listing.id} />
                                        <RevokeTutorButton listingId={listing.id} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {listings.length === 0 && (
                            <tr className="text-center">
                                <td colSpan={6} className="py-8 text-slate-500">No active tutor listings to manage.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
