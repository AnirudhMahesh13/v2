import { prisma } from '@/lib/prisma'
import { Search, GraduationCap, Star, DollarSign, Calendar } from 'lucide-react'
import { EmptyState } from '@/components/EmptyState'

export default async function TutorsPage() {
    const listings = await prisma.tutorListing.findMany({
        include: {
            tutor: true,
            course: {
                include: { school: true }
            },
            reviews: true
        }
    })

    // Grouping Logic
    const groupedListings: Record<string, Record<string, typeof listings>> = {}

    listings.forEach(listing => {
        const schoolName = listing.course.school.name
        const courseCode = listing.course.code

        if (!groupedListings[schoolName]) {
            groupedListings[schoolName] = {}
        }
        if (!groupedListings[schoolName][courseCode]) {
            groupedListings[schoolName][courseCode] = []
        }
        groupedListings[schoolName][courseCode].push(listing)
    })

    return (
        <div className="container mx-auto px-6 py-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Find a Tutor</h1>
                    <p className="text-slate-500">Expert help for your specific courses.</p>
                </div>

                <div className="relative w-full md:w-96">
                    <input
                        type="text"
                        placeholder="Search by course code or subject..."
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                    />
                    <Search className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                </div>
            </div>

            {listings.length === 0 ? (
                <EmptyState
                    icon={GraduationCap}
                    title="No active tutors"
                    description="Be the first to sign up as a tutor for your best courses."
                    action={
                        <button className="mt-4 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                            Become a Tutor
                        </button>
                    }
                />
            ) : (
                <div className="space-y-12">
                    {Object.entries(groupedListings).map(([schoolName, courses]) => (
                        <div key={schoolName} className="space-y-6">
                            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-200">
                                <GraduationCap className="text-indigo-600" />
                                {schoolName}
                            </h2>

                            <div className="space-y-8 pl-4">
                                {Object.entries(courses).map(([courseCode, courseListings]) => (
                                    <div key={courseCode}>
                                        <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                                            <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-sm font-mono">
                                                {courseCode}
                                            </span>
                                            <span className="text-slate-500 text-sm font-normal">
                                                {courseListings[0].course.name}
                                            </span>
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {courseListings.map(listing => (
                                                <div key={listing.id} className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-indigo-300 transition-all group shadow-sm hover:shadow-md">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                                                                {listing.tutor.image ? (
                                                                    <img src={listing.tutor.image} alt="Tutor" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <span className="font-bold text-slate-500 text-lg">{listing.tutor.name?.charAt(0) ?? 'T'}</span>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <h3 className="font-bold text-slate-900">{listing.tutor.name}</h3>
                                                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                                                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                                                    <span className="font-bold text-slate-700">4.9</span>
                                                                    <span>(12 reviews)</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                                                            <DollarSign className="w-3 h-3" />
                                                            {listing.hourlyRate / 100}/hr
                                                        </div>
                                                    </div>

                                                    <div className="mb-6">
                                                        <p className="text-sm text-slate-600 line-clamp-2 min-h-[40px]">{listing.description}</p>
                                                    </div>

                                                    <button className="w-full py-3 bg-slate-900 text-white font-medium rounded-xl hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2">
                                                        <Calendar className="w-4 h-4" />
                                                        Book Session
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
