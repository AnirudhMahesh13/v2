'use client'

import { useState } from 'react'
import { createBookingSession } from '@/actions/stripe'
import { Calendar, Loader2 } from 'lucide-react'

export function BookingButton({ tutorListingId, courseCode, tutorName }: { tutorListingId: string, courseCode: string, tutorName: string }) {
    const [isLoading, setIsLoading] = useState(false)

    async function handleBooking() {
        setIsLoading(true)
        // For MVP, we will just book for "tomorrow at 10am" as a default slot
        // In a real app, this would open a Modal with a DatePicker
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        tomorrow.setHours(10, 0, 0, 0)

        try {
            await createBookingSession(tutorListingId, tomorrow.toISOString())
        } catch (error: any) {
            console.error("Booking failed:", error)
            alert(error.message || "Failed to start booking session.")
            setIsLoading(false)
        }
    }

    return (
        <button
            onClick={handleBooking}
            disabled={isLoading}
            className="w-full py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
                <Calendar className="w-3 h-3" />
            )}
            {isLoading ? 'Redirecting...' : 'Book Session'}
        </button>
    )
}
