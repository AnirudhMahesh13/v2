
'use client'

import { useEffect, useState } from 'react'
import { BeaconCard } from './BeaconCard'
import { getLiveBeacons } from '@/actions/beacons'
import { Radio } from 'lucide-react'
import Link from 'next/link'

export function BeaconFeed({ initialBeacons, currentUserId }: { initialBeacons: any[], currentUserId: string }) {
    const [beacons, setBeacons] = useState(initialBeacons)

    useEffect(() => {
        const interval = setInterval(async () => {
            const fresh = await getLiveBeacons()
            setBeacons(fresh)
        }, 15000) // Poll every 15s

        return () => clearInterval(interval)
    }, [])

    if (beacons.length === 0) {
        return (
            <div className="text-center py-24">
                <div className="w-16 h-16 bg-white rounded-full mx-auto flex items-center justify-center mb-4 shadow-sm border border-slate-200">
                    <Radio className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">It's quiet... too quiet.</h3>
                <p className="text-slate-500 mb-6">No active beacons at your school right now.</p>
                <Link href="/beacons/create" className="btn-primary">
                    Be the first to drop one
                </Link>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {beacons.map((beacon) => (
                <BeaconCard key={beacon.id} beacon={beacon} currentUserId={currentUserId} />
            ))}
        </div>
    )
}
