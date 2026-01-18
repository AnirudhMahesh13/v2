
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { CheckCircle, Calendar, ArrowRight } from "lucide-react"
import Link from "next/link"
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-12-15.clover',
    typescript: true
})

interface PageProps {
    searchParams: Promise<{
        session_id: string
        booking_id: string
    }>
}

export default async function BookingSuccessPage({ searchParams }: PageProps) {
    const { session_id, booking_id } = await searchParams
    const session = await auth()

    if (!session?.user || !session_id || !booking_id) {
        redirect('/dashboard')
    }

    // 1. Verify Stripe Session
    let checkoutSession;
    try {
        checkoutSession = await stripe.checkout.sessions.retrieve(session_id)
    } catch (error) {
        console.error("Failed to retrieve Stripe session:", error)
        redirect('/dashboard')
    }

    if (checkoutSession.payment_status !== 'paid') {
        return (
            <div className="container mx-auto px-6 py-20 text-center">
                <h1 className="text-2xl font-bold text-slate-900">Payment Incomplete</h1>
                <p className="text-slate-500 mt-2">Please try again.</p>
                <Link href="/dashboard" className="block mt-4 text-indigo-600 underline">Return to Dashboard</Link>
            </div>
        )
    }

    // 2. Update Booking Status (Simple Demo Logic)
    // In production, use Webhooks to prevent replay attacks/refresh abuse, but this is fine for MVP
    await prisma.booking.update({
        where: { id: booking_id },
        data: {
            status: 'CONFIRMED',
            stripeSessionId: session_id
        }
    })

    const booking = await prisma.booking.findUnique({
        where: { id: booking_id },
        include: {
            tutorListing: {
                include: {
                    tutor: true,
                    course: true
                }
            }
        }
    })

    if (!booking) redirect('/dashboard')

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                </div>

                <h1 className="text-3xl font-bold text-slate-900 mb-2">Booking Confirmed!</h1>
                <p className="text-slate-500 mb-8">You are all set for your session.</p>

                <div className="bg-slate-50 rounded-2xl p-6 mb-8 text-left space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                            {booking.tutorListing.course.code.substring(0, 2)}
                        </div>
                        <div>
                            <p className="font-bold text-slate-900">{booking.tutorListing.course.code}</p>
                            <p className="text-xs text-slate-500">{booking.tutorListing.course.name}</p>
                        </div>
                    </div>

                    <div className="border-t border-slate-200 pt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Tutor</span>
                            <span className="font-medium text-slate-900">{booking.tutorListing.tutor.name}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Date</span>
                            <span className="font-medium text-slate-900">
                                {new Date(booking.scheduledAt).toLocaleDateString()}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Time</span>
                            <span className="font-medium text-slate-900">
                                {new Date(booking.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                </div>

                <Link
                    href="/dashboard"
                    className="block w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                >
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    )
}
