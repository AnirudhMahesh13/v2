'use client'

import { useState } from 'react'
import { updatePrivacySettings, unblockUser } from '@/actions/settings'
import { Loader2, Save, Eye, EyeOff, Lock, UserX, Download } from 'lucide-react'

interface PrivacySettings {
    discoverable: boolean
    showInFriendFinder: boolean
}

interface BlockedUser {
    id: string
    name: string | null
    image: string | null
    email: string | null
}

export function PrivacyForm({ settings: initialSettings, initialBlockedUsers }: { settings: PrivacySettings, initialBlockedUsers: BlockedUser[] }) {
    const [discoverable, setDiscoverable] = useState(initialSettings.showInFriendFinder ?? true)
    const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>(initialBlockedUsers)
    const [isLoading, setIsLoading] = useState(false)

    async function handleSavePrivacy() {
        setIsLoading(true)
        await updatePrivacySettings({ ...initialSettings, showInFriendFinder: discoverable })
        setIsLoading(false)
    }

    async function handleUnblock(userId: string) {
        // Optimistic remove
        setBlockedUsers(prev => prev.filter(u => u.id !== userId))
        await unblockUser(userId)
    }

    return (
        <div className="space-y-10">

            {/* Visibility */}
            <section>
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    {discoverable ? <Eye size={18} className="text-emerald-500" /> : <EyeOff size={18} className="text-slate-400" />}
                    Discoverability
                </h3>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center justify-between">
                    <div>
                        <div className="font-bold text-slate-900">Appear in Friend Finder</div>
                        <p className="text-sm text-slate-500">Allow classmates to find you based on shared courses.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={discoverable} onChange={e => setDiscoverable(e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                </div>
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={handleSavePrivacy}
                        disabled={isLoading}
                        className="text-sm font-bold text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
                    >
                        {isLoading ? 'Saving...' : 'Save Visibility Settings'}
                    </button>
                </div>
            </section>

            <hr className="border-slate-100" />

            {/* Blocked Users */}
            <section>
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <UserX size={18} className="text-red-500" />
                    Blocked Users
                </h3>
                {blockedUsers.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-100 border-dashed text-slate-500 text-sm">
                        You haven't blocked anyone yet.
                    </div>
                ) : (
                    <div className="space-y-2">
                        {blockedUsers.map(user => (
                            <div key={user.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400">
                                        {user.image ? <img src={user.image} className="w-full h-full rounded-full" /> : user.name?.[0]}
                                    </div>
                                    <span className="font-medium text-slate-900">{user.name}</span>
                                </div>
                                <button
                                    onClick={() => handleUnblock(user.id)}
                                    className="text-xs font-bold text-slate-500 hover:text-slate-900 px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                                >
                                    Unblock
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <hr className="border-slate-100" />

            {/* Data Export */}
            <section>
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Lock size={18} className="text-slate-500" />
                    Your Data
                </h3>
                <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                    <div>
                        <div className="font-bold text-slate-900">Download My Data</div>
                        <p className="text-sm text-slate-500">Get a copy of your profile, courses, and settings.</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-bold hover:bg-slate-50 transition-colors">
                        <Download size={16} />
                        Request Archive
                    </button>
                </div>
            </section>

        </div>
    )
}
