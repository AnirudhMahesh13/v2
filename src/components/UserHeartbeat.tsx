'use client'

import { useEffect } from 'react'

export function UserHeartbeat() {
    useEffect(() => {
        // Ping immediately
        ping()

        // Ping every 60s
        const interval = setInterval(ping, 60000)

        // Ping on visibility change (tab focus)
        const onVisibilityChange = () => {
            if (document.visibilityState === 'visible') ping()
        }
        document.addEventListener('visibilitychange', onVisibilityChange)

        return () => {
            clearInterval(interval)
            document.removeEventListener('visibilitychange', onVisibilityChange)
        }
    }, [])

    const ping = () => {
        // Use sendBeacon for reliability on unload, or fetch. Fetch is fine for heartbeat.
        fetch('/api/presence', { method: 'POST', keepalive: true }).catch(() => { })
    }

    return null // Invisible
}
