
import { auth } from '@/auth'
import { getLiveBeacons } from '@/actions/beacons'
import { BeaconFeed } from '@/components/Beacons/BeaconFeed'
import { redirect } from 'next/navigation'
import { Plus, Radio } from 'lucide-react'
import Link from 'next/link'

export default async function BeaconsPage() {
    const session = await auth()
    if (!session?.user) return redirect('/api/auth/signin')

    const beacons = await getLiveBeacons()

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-slate-900 text-white py-12 px-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-20 pointer-events-none" />

                <div className="container mx-auto relative z-10">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <Radio className="w-6 h-6 text-green-400 animate-pulse" />
                            <h1 className="text-3xl font-black tracking-tight font-display">The Beacon</h1>
                        </div>
                        {/* Create Button Placeholder (Ideally a modal trigger) */}
                        <Link href="/beacons/create" className="bg-white text-slate-900 px-4 py-2 rounded-full text-sm font-bold hover:bg-indigo-50 transition-colors flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Drop Beacon
                        </Link>
                    </div>
                    <p className="text-indigo-200 font-medium max-w-lg">
                        Real-time study sessions happening right now. Find your squad, verify the vibe, and get to work.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-6 py-8">
                <BeaconFeed initialBeacons={beacons} currentUserId={session.user.id || ''} />
            </div>
        </div>
    )
}
