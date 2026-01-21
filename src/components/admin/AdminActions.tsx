'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, Play, Loader2 } from 'lucide-react'
import { verifyTutorGrade, submitReport, approveContent, hideContent, verifyTutor } from '@/actions/admin'
import { useRouter } from 'next/navigation'

export function VerifyTutorButton({ listingId }: { listingId: string }) {
    const [loading, setLoading] = useState(false)

    async function onClick() {
        setLoading(true)
        try {
            // Manual override assumes "A+" for simplicity in this "God Mode" button
            // Or we call the auto-verifier? Let's call the auto-verifier which might fail, 
            // OR we create a specific "force verify" action.
            // Let's use a new force verify action.
            await verifyTutor(listingId, true)
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={onClick}
            disabled={loading}
            className="p-1 text-slate-400 hover:text-green-600 disabled:opacity-50"
            title="Force Verify"
        >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
        </button>
    )
}

export function RevokeTutorButton({ listingId }: { listingId: string }) {
    const [loading, setLoading] = useState(false)

    async function onClick() {
        setLoading(true)
        try {
            await verifyTutor(listingId, false)
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={onClick}
            disabled={loading}
            className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-50"
            title="Revoke Verification"
        >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
        </button>
    )
}

export function ModerationButtons({ id, type }: { id: string, type: 'REVIEW' | 'THREAD' }) {
    const [loading, setLoading] = useState(false)

    async function onApprove() {
        setLoading(true)
        await approveContent(id, type)
        setLoading(false)
    }

    async function onHide() {
        setLoading(true)
        await hideContent(id, type)
        setLoading(false)
    }

    return (
        <div className="flex gap-2">
            <button
                onClick={onApprove}
                disabled={loading}
                className="p-1 text-slate-400 hover:text-green-600 disabled:opacity-50"
                title="Approve (Clear Reports)"
            >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
            </button>
            <button
                onClick={onHide}
                disabled={loading}
                className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-50"
                title="Hide Content"
            >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
            </button>
        </div>
    )
}

export function AutoVerifyTrigger({ listingId }: { listingId: string }) {
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<string | null>(null)

    async function onClick() {
        setLoading(true)
        const res = await verifyTutorGrade(listingId)
        setResult(res.grade)
        setLoading(false)
    }

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={onClick}
                disabled={loading}
                className="text-indigo-600 hover:underline flex items-center gap-1 text-sm font-medium disabled:opacity-50"
            >
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                Run Auto-Check
            </button>
            {result && <span className="text-xs font-mono bg-slate-100 px-1 rounded">{result}</span>}
        </div>
    )
}
