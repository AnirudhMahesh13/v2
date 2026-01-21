'use client'

import { useState } from 'react'
import { UploadCloud, Loader2, FileText, CheckCircle } from 'lucide-react'
import { uploadResource } from '@/actions/social'

export function ResourceUpload({ courseId }: { courseId: string }) {
    const [title, setTitle] = useState('')
    const [url, setUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        await uploadResource(courseId, url, title)
        setLoading(false)
        setSuccess(true)
        setTitle('')
        setUrl('')
        setTimeout(() => setSuccess(false), 3000)
    }

    return (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
            <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-indigo-600" />
                Share Study Material
            </h3>
            <p className="text-sm text-slate-500 mb-4">Earn karma by helping your peers.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Resource Title</label>
                    <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Midterm 1 Study Guide"
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">File URL / Link</label>
                    <input
                        type="url"
                        required
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://drive.google.com/..."
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Paste a link to your file (Google Drive, Dropbox, etc.)</p>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (success ? <CheckCircle className="w-4 h-4" /> : 'Upload Resource')}
                    {success && 'Shared!'}
                </button>
            </form>
        </div>
    )
}
