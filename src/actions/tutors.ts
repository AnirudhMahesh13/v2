'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function getCoursesForSchool(schoolId: string) {
    if (!schoolId) return []

    try {
        const courses = await prisma.course.findMany({
            where: { schoolId },
            select: { id: true, name: true, code: true },
            orderBy: { code: 'asc' }
        })
        return courses
    } catch (error) {
        console.error("Failed to fetch courses:", error)
        return []
    }
}

export async function registerTutor(formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Unauthorized" }

    const courseId = formData.get("courseId") as string
    const hourlyRate = parseInt(formData.get("hourlyRate") as string) * 100 // Convert to cents
    const description = formData.get("description") as string

    if (!courseId || !hourlyRate || !description) {
        return { error: "Missing fields" }
    }

    try {
        await prisma.tutorListing.create({
            data: {
                courseId,
                tutorId: session.user.id,
                hourlyRate, // already in cents
                description
            }
        })
    } catch (error) {
        console.error("Registration failed:", error)
        return { error: "Failed to register" }
    }

    revalidatePath('/dashboard')
    revalidatePath('/tutors')
    redirect('/dashboard')
}
