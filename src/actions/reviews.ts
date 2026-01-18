'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createReview(formData: FormData) {
    const session = await auth()
    const user = session?.user

    if (!user || !user.id) {
        redirect('/api/auth/signin?callbackUrl=/schools')
    }

    const courseId = formData.get('courseId') as string
    const rating = parseInt(formData.get('rating') as string)
    const difficulty = parseInt(formData.get('difficulty') as string)
    const workload = parseInt(formData.get('workload') as string)
    const body = formData.get('body') as string

    if (!courseId || !rating || !body) {
        throw new Error('Missing required fields')
    }

    await prisma.review.create({
        data: {
            rating,
            difficulty,
            workload,
            body,
            courseId,
            userId: user.id
        }
    })

    revalidatePath(`/schools/[schoolId]/courses/${courseId}`)
}
