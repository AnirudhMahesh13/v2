
'use client'

import { useState } from 'react'

export function ApplicationForm({ clubId }: { clubId: string }) {
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setStatus('submitting')
        // Simulate API call
        await new Promise(r => setTimeout(r, 1000))
        setStatus('success')
    }

    if (status === 'success') {
        return (
            <div className="bg-green-50 p-6 rounded-xl border border-green-200 text-center">
                <h3 className="text-green-800 font-bold mb-2">Application Sent!</h3>
                <p className="text-green-700">The executives will review your application shortly.</p>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                    Why do you want to join?
                </label>
                <textarea
                    required
                    className="w-full rounded-lg border-slate-200 focus:ring-indigo-500 focus:border-indigo-500"
                    rows={3}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                    Relevant Experience
                </label>
                <textarea
                    className="w-full rounded-lg border-slate-200 focus:ring-indigo-500 focus:border-indigo-500"
                    rows={2}
                />
            </div>
            <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full btn-primary justify-center"
            >
                {status === 'submitting' ? 'Sending...' : 'Submit Application'}
            </button>
        </form>
    )
}
