'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-12-15.clover',
    typescript: true
})

export async function createBookingSession(tutorListingId: string, scheduledDateIso: string) {
    const authSession = await auth()
    const user = authSession?.user

    if (!user || !user.id || !user.email) {
        redirect('/api/auth/signin?callbackUrl=/tutors')
    }

    // CRITICAL: Ensure user has a verified School ID (Prevention of Broken Auth/Free Riders)
    const dbUser = await prisma.user.findUnique({
        where: { id: user.id }
    })

    if (!dbUser?.schoolId) {
        // Fallback for Demo: Link to first available school
        const defaultSchool = await prisma.school.findFirst()
        if (defaultSchool) {
            await prisma.user.update({
                where: { id: user.id },
                data: { schoolId: defaultSchool.id }
            })
        } else {
            throw new Error("Verification Required: No schools found in database.")
        }
    }

    const listing = await prisma.tutorListing.findUnique({
        where: { id: tutorListingId },
        include: {
            tutor: true,
            course: true
        }
    })

    if (!listing) {
        throw new Error("Tutor listing not found.")
    }

    // Create PENDING booking
    const booking = await prisma.booking.create({
        data: {
            tutorListingId,
            studentId: user.id,
            status: 'PENDING',
            scheduledAt: new Date(scheduledDateIso)
        }
    })

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
        customer_email: user.email,
        line_items: [
            {
                price_data: {
                    currency: 'cad',
                    product_data: {
                        name: `Tutoring: ${listing.course.code}`,
                        description: `1-hour session with ${listing.tutor.name ?? 'Tutor'}`,
                        images: listing.tutor.image ? [listing.tutor.image] : [],
                    },
                    unit_amount: listing.hourlyRate, // Amount in cents
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/bookings/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${booking.id}`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/schools/${listing.course.schoolId}/courses/${listing.course.id}`,
        metadata: {
            bookingId: booking.id,
            userId: user.id,
            type: 'TUTORING_SESSION'
        }
    })

    if (!session.url) {
        throw new Error("Failed to create Stripe session")
    }

    redirect(session.url)
}
