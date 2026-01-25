
'use client'

import { MapPin, Clock, Users } from 'lucide-react'
import { joinBeacon } from '@/actions/beacons'
import Link from 'next/link'
import { useTransition } from 'react'
import { useRouter } from 'next/navigation'

export function BeaconCard({ beacon, currentUserId }: { beacon: any, currentUserId: string }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    // Check if user is attending
    const isAttending = beacon.attendees.some((a: any) => a.userId === currentUserId)
    const isHost = beacon.userId === currentUserId

    const handleJoin = () => {
        startTransition(async () => {
            await joinBeacon(beacon.id)
            router.refresh()
        })
    }

    // Calculate time left in minutes
    const timeLeft = Math.max(0, Math.floor((new Date(beacon.expiresAt).getTime() - Date.now()) / 60000))

    const vibeColors = {
        QUIET: 'bg-blue-100 text-blue-700 border-blue-200',
        COLLABORATIVE: 'bg-green-100 text-green-700 border-green-200',
        INTENSE: 'bg-red-100 text-red-700 border-red-200'
    }

    return (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group">
            {/* Glow Effect */}
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-100 to-transparent opacity-50 rounded-bl-full pointer-events-none transition-opacity group-hover:opacity-100`} />

            <div className="flex items-start justify-between mb-4 relative z-10">
                <div className="flex items-center gap-3">
                    <Link href={`/profile/${beacon.user.id}`} className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-slate-200 hover:scale-105 transition-transform">
                        {beacon.user.image ? (
                            <img src={beacon.user.image} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-slate-400">?</div>
                        )}
                    </Link>
                    <div>
                        <Link href={`/profile/${beacon.user.id}`} className="font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                            {beacon.user.name}
                        </Link>
                        <p className="text-xs text-slate-500 font-medium">{beacon.course ? `Studying ${beacon.course.code}` : 'Studying'}</p>
                    </div>
                </div>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${vibeColors[beacon.vibe as keyof typeof vibeColors]}`}>
                    {beacon.vibe}
                </span>
            </div>

            <div className="space-y-3 mb-6 relative z-10">
                <h2 className="text-lg font-black text-slate-900 leading-tight">"{beacon.goal}"</h2>

                <div className="flex items-center gap-2 text-slate-600 font-medium text-sm">
                    <MapPin className="w-4 h-4 text-indigo-500" />
                    {beacon.locationName}
                </div>

                {beacon.description && (
                    <p className="text-sm text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        {beacon.description}
                    </p>
                )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 relative z-10">
                <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                    <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {beacon._count.attendees}
                    </span>
                    <span className="flex items-center gap-1 text-orange-500">
                        <Clock className="w-3 h-3" />
                        {timeLeft}m left
                    </span>
                </div>

                {!isHost && (
                    <button
                        onClick={handleJoin}
                        disabled={isPending}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${isAttending
                            ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                            : 'bg-slate-900 text-white hover:bg-indigo-600'
                            }`}
                    >
                        {isPending ? '...' : isAttending ? "I'm In!" : "Join In"}
                    </button>
                )}
            </div>
        </div>
    )
}
