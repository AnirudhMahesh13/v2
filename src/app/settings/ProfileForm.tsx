'use client'

import { useState } from 'react'
import { updateProfile, updatePrivacySettings } from '@/actions/settings'
import { Loader2, Save, School, GraduationCap } from 'lucide-react'

export function ProfileForm({ user }: { user: any }) {
    const [name, setName] = useState(user.name || '')
    const [bio, setBio] = useState(user.bio || '')

    // Privacy Defaults
    const defaultPrivacy = (user.privacySettings as any) || {}
    const [showTimeline, setShowTimeline] = useState(defaultPrivacy.showTimeline ?? true)
    const [showCourses, setShowCourses] = useState(defaultPrivacy.showCourses ?? true)

    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setIsLoading(true)
        setMessage(null)

        // Parallel Updates
        const [profileRes, privacyRes] = await Promise.all([
            updateProfile({ name, bio }),
            updatePrivacySettings({ ...defaultPrivacy, showTimeline, showCourses })
        ])

        if (profileRes.success && privacyRes.success) {
            setMessage({ type: 'success', text: 'Profile updated successfully.' })
        } else {
            setMessage({ type: 'error', text: 'Failed to update settings.' })
        }

        setIsLoading(false)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Identity Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-indigo-100 text-indigo-600">
                        <School size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-indigo-900">Verified Student</h3>
                        <p className="text-xs text-indigo-700">
                            Linked to <span className="font-mono font-bold">{user.school?.domain}</span> ({user.school?.name})
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                        <input
                            type="text"
                            value={user.email}
                            disabled
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Bio</label>
                    <textarea
                        value={bio}
                        onChange={e => setBio(e.target.value)}
                        rows={3}
                        placeholder="Tell your classmates about yourself..."
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>

            <hr className="border-slate-100" />

            {/* Visibility Section */}
            <div className="space-y-4">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <GraduationCap size={18} className="text-slate-400" />
                    Visibility Settings
                </h3>

                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
                    <div>
                        <h4 className="font-medium text-slate-900">Show Academic Timeline</h4>
                        <p className="text-xs text-slate-500">Allow others to see your badges and activity history.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={showTimeline} onChange={e => setShowTimeline(e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
                    <div>
                        <h4 className="font-medium text-slate-900">Show Enrolled Courses</h4>
                        <p className="text-xs text-slate-500">Display your course list on your public profile.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={showCourses} onChange={e => setShowCourses(e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                </div>
            </div>

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
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                    {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    Save Changes
                </button>
            </div>
        </form>
    )
}
