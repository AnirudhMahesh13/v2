import { prisma } from '@/lib/prisma'
import { ModerationButtons } from '@/components/admin/AdminActions' // Imported Client Component
import { Eye, CheckCircle, XCircle, AlertOctagon } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ModerationPage() {
    // Fetch items with reports or hidden status
    const reportedReviews = await prisma.review.findMany({
        where: { OR: [{ reportCount: { gt: 0 } }, { isVisible: false }] },
        include: { user: true, reports: true },
        orderBy: { reportCount: 'desc' }
    })

    const reportedThreads = await prisma.thread.findMany({
        where: { OR: [{ reportCount: { gt: 0 } }, { isVisible: false }] },
        include: { user: true, reports: true },
        orderBy: { reportCount: 'desc' }
    })

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-slate-900 font-display">Moderation Queue</h2>
                <p className="text-slate-500">Review content flagged by the auto-moderator.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 font-bold text-slate-900">Type</th>
                            <th className="px-6 py-4 font-bold text-slate-900">Author</th>
                            <th className="px-6 py-4 font-bold text-slate-900">Content Snippet</th>
                            <th className="px-6 py-4 font-bold text-slate-900">Reports</th>
                            <th className="px-6 py-4 font-bold text-slate-900">Status</th>
                            <th className="px-6 py-4 font-bold text-slate-900">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {reportedReviews.map(review => (
                            <tr key={review.id} className="hover:bg-slate-50/50">
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600">
                                        Review
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-medium text-slate-900">{review.user.name}</td>
                                <td className="px-6 py-4 max-w-xs truncate">{review.body || "No text"}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1 text-rose-600 font-bold">
                                        <AlertOctagon className="w-4 h-4" />
                                        {review.reportCount}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {review.isVisible ? (
                                        <span className="text-green-600 font-medium">Live</span>
                                    ) : (
                                        <span className="text-rose-600 font-bold bg-rose-50 px-2 py-1 rounded inline-block">HIDDEN</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <ModerationButtons id={review.id} type="REVIEW" />
                                </td>
                            </tr>
                        ))}
                        {reportedThreads.map(thread => (
                            <tr key={thread.id} className="hover:bg-slate-50/50">
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-50 text-violet-600">
                                        Thread
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-medium text-slate-900">{thread.user.name}</td>
                                <td className="px-6 py-4 max-w-xs truncate">{thread.title}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1 text-rose-600 font-bold">
                                        <AlertOctagon className="w-4 h-4" />
                                        {thread.reportCount}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {thread.isVisible ? (
                                        <span className="text-green-600 font-medium">Live</span>
                                    ) : (
                                        <span className="text-rose-600 font-bold bg-rose-50 px-2 py-1 rounded inline-block">HIDDEN</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <ModerationButtons id={thread.id} type="THREAD" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {reportedReviews.length === 0 && reportedThreads.length === 0 && (
                    <div className="p-12 text-center text-slate-500">
                        <CheckCircle className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
                        <p>Queue is empty. Good job!</p>
                    </div>
                )}
            </div>
        </div>
    )
}
