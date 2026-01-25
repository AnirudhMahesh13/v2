
'use client'

import { useState } from 'react'
import { createBeacon } from '@/actions/beacons'
import { useRouter } from 'next/navigation'
import { MapPin, Target, Clock, Zap } from 'lucide-react'
import { BeaconVibe } from '@prisma/client'

export default function CreateBeaconPage() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Form State
    const [location, setLocation] = useState('')
    const [goal, setGoal] = useState('')
    const [vibe, setVibe] = useState<BeaconVibe>('COLLABORATIVE')
    const [duration, setDuration] = useState(120) // Minutes

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            await createBeacon({
                locationName: location,
                goal,
                vibe,
                expiresInMinutes: duration
            })
            router.push('/beacons')
            router.refresh()
        } catch (error) {
            console.error(error)
            alert('Failed to drop beacon')
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-slate-900 px-6 py-8 text-white relative overflow-hidden">
                    <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-indigo-500 rounded-full blur-[80px] opacity-30 pointer-events-none" />
                    <h1 className="text-2xl font-black font-display relative z-10">Drop a Beacon</h1>
                    <p className="text-indigo-200 relative z-10">Broadcast your signal to the network.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Location */}
                    <div>
                        <label className="block text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-indigo-500" /> Location
                        </label>
                        <input
                            required
                            type="text"
                            placeholder="e.g. 4th Floor Library, Coffee Shop"
                            className="w-full rounded-xl border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                            value={location}
                            onChange={e => setLocation(e.target.value)}
                        />
                    </div>

                    {/* Goal */}
                    <div>
                        <label className="block text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                            <Target className="w-4 h-4 text-rose-500" /> Mission
                        </label>
                        <input
                            required
                            type="text"
                            placeholder="e.g. Cramming for COMP1405"
                            className="w-full rounded-xl border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                            value={goal}
                            onChange={e => setGoal(e.target.value)}
                        />
                    </div>

                    {/* Vibe */}
                    <div>
                        <label className="block text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-amber-500" /> Vibe Check
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['QUIET', 'COLLABORATIVE', 'INTENSE'] as BeaconVibe[]).map((v) => (
                                <button
                                    key={v}
                                    type="button"
                                    onClick={() => setVibe(v)}
                                    className={`py-2 px-1 rounded-lg text-xs font-bold border transition-all ${vibe === v
                                            ? 'bg-slate-900 text-white border-slate-900 shadow-md transform scale-105'
                                            : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    {v}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Duration */}
                    <div>
                        <label className="block text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-emerald-500" /> Duration
                        </label>
                        <input
                            type="range"
                            min="30"
                            max="240"
                            step="30"
                            value={duration}
                            onChange={(e) => setDuration(Number(e.target.value))}
                            className="w-full accent-indigo-600 cursor-pointer"
                        />
                        <div className="flex justify-between text-xs font-medium text-slate-400 mt-1">
                            <span>30m</span>
                            <span className="text-indigo-600 font-bold">{Math.floor(duration / 60)}h {duration % 60}m</span>
                            <span>4h</span>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full btn-primary justify-center py-4 text-lg shadow-lg shadow-indigo-200"
                        >
                            {isSubmitting ? 'Igniting...' : 'Ignite Beacon'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
