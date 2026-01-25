'use client'

import { useState } from 'react'
import { updateNotificationPrefs } from '@/actions/settings'
import { Loader2, Save, Bell, Mail, MessageSquare, Zap, BadgeCheck } from 'lucide-react'

interface Prefs {
    social: {
        newFollower: boolean
        threadReply: boolean
        karmaAwarded: boolean
    },
    marketplace: {
        bookingConfirmation: boolean
        tutorMessage: boolean
        bountyFulfilled: boolean
    },
    channels: {
        email: boolean
        push: boolean
    }
}

const DEFAULT_PREFS: Prefs = {
    social: { newFollower: true, threadReply: true, karmaAwarded: true },
    marketplace: { bookingConfirmation: true, tutorMessage: true, bountyFulfilled: true },
    channels: { email: true, push: false }
}

export function NotificationForm({ prefs: initialPrefs }: { prefs: any }) {
    // Merge deep defaults
    const [prefs, setPrefs] = useState<Prefs>({
        social: { ...DEFAULT_PREFS.social, ...initialPrefs.social },
        marketplace: { ...DEFAULT_PREFS.marketplace, ...initialPrefs.marketplace },
        channels: { ...DEFAULT_PREFS.channels, ...initialPrefs.channels }
    })

    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const handleToggle = (category: keyof Prefs, key: string, value: boolean) => {
        setPrefs(prev => ({
            ...prev,
            [category]: {
                ...(prev[category] as any),
                [key]: value
            }
        }))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setIsLoading(true)
        setMessage(null)

        const result = await updateNotificationPrefs(prefs)

        if (result.success) {
            setMessage({ type: 'success', text: 'Preferences saved.' })
        } else {
            setMessage({ type: 'error', text: 'Failed to save preferences.' })
        }

        setIsLoading(false)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">

            {/* Social Alerts */}
            <section>
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <MessageSquare size={18} className="text-indigo-500" />
                    Social Activity
                </h3>
                <div className="space-y-3 pl-2 border-l-2 border-slate-100">
                    <Toggle label="New Follower" description="When someone starts following you." checked={prefs.social.newFollower} onChange={c => handleToggle('social', 'newFollower', c)} />
                    <Toggle label="Thread Replies" description="When someone comments on your thread." checked={prefs.social.threadReply} onChange={c => handleToggle('social', 'threadReply', c)} />
                    <Toggle label="Karma Awards" description="When you receive karma or badges." checked={prefs.social.karmaAwarded} onChange={c => handleToggle('social', 'karmaAwarded', c)} />
                </div>
            </section>

            {/* Marketplace Alerts */}
            <section>
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Zap size={18} className="text-amber-500" />
                    Marketplace & Gigs
                </h3>
                <div className="space-y-3 pl-2 border-l-2 border-slate-100">
                    <Toggle label="Booking Confirmations" description="Updates on your tutor sessions." checked={prefs.marketplace.bookingConfirmation} onChange={c => handleToggle('marketplace', 'bookingConfirmation', c)} />
                    <Toggle label="Tutor Messages" description="Direct messages related to bookings." checked={prefs.marketplace.tutorMessage} onChange={c => handleToggle('marketplace', 'tutorMessage', c)} />
                    <Toggle label="Bounty Fulfilled" description="When your bounty is claimed or paid." checked={prefs.marketplace.bountyFulfilled} onChange={c => handleToggle('marketplace', 'bountyFulfilled', c)} />
                </div>
            </section>

            <hr className="border-slate-100" />

            {/* Channels */}
            <section>
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Bell size={18} className="text-slate-500" />
                    Delivery Channels
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${prefs.channels.email ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}`}
                        onClick={() => handleToggle('channels', 'email', !prefs.channels.email)}>
                        <div className="flex items-center gap-3">
                            <Mail className={prefs.channels.email ? 'text-indigo-600' : 'text-slate-400'} />
                            <div>
                                <div className="font-bold text-slate-900">Email Digest</div>
                                <div className="text-xs text-slate-500">Daily summaries + critical alerts</div>
                            </div>
                            {prefs.channels.email && <BadgeCheck className="ml-auto text-indigo-600 w-5 h-5" />}
                        </div>
                    </div>
                    {/* Push Notifications (Placeholder for future) */}
                    <div className="p-4 rounded-xl border-2 border-slate-100 opacity-60 cursor-not-allowed bg-slate-50">
                        <div className="flex items-center gap-3">
                            <Bell className="text-slate-400" />
                            <div>
                                <div className="font-bold text-slate-400">Push Notifications</div>
                                <div className="text-xs text-slate-400">Coming to iOS & Android soon</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-4">
                {message ? (
                    <div className={`text-sm font-medium ${message.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {message.text}
                    </div>
                ) : <div></div>}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                    {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    Save Preferences
                </button>
            </div>
        </form>
    )
}

function Toggle({ label, description, checked, onChange }: { label: string, description: string, checked: boolean, onChange: (c: boolean) => void }) {
    return (
        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
            <div>
                <div className="font-medium text-slate-900 text-sm">{label}</div>
                <div className="text-xs text-slate-500">{description}</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="sr-only peer" />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-900"></div>
            </label>
        </div>
    )
}
