'use client'

import { useState } from 'react'
import { createThread } from '@/actions/threads'

export function ThreadForm({ courseId }: { courseId: string }) {
    const [isOpen, setIsOpen] = useState(false)

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="text-sm text-indigo-600 font-medium hover:underline"
            >
                New Thread
            </button>
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold font-display text-slate-900">Start Discussion</h2>
                    <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                        ✕
                    </button>
                </div>

                <form action={async (formData) => {
                    await createThread(formData)
                    setIsOpen(false)
                }} className="space-y-4">
                    <input type="hidden" name="courseId" value={courseId} />

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Topic Title</label>
                        <input
                            type="text"
                            name="title"
                            required
                            placeholder="e.g. Midterm 1 study group"
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Content</label>
                        <textarea
                            name="body"
                            rows={4}
                            required
                            placeholder="What would you like to discuss?"
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                        />
                    </div>

                    <button type="submit" className="btn-primary w-full py-3">
                        Post Thread
                    </button>
                </form>
            </div>
        </div>
    )
}
