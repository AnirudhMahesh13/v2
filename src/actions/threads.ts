'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createThread(formData: FormData) {
    const session = await auth()
    const user = session?.user

    if (!user || !user.id) {
        redirect('/api/auth/signin?callbackUrl=/schools')
    }

    const courseId = formData.get('courseId') as string
    const title = formData.get('title') as string
    const body = formData.get('body') as string

    if (!courseId || !title || !body) {
        throw new Error('Missing required fields')
    }

    await prisma.thread.create({
        data: {
            title,
            body,
            courseId,
            userId: user.id
        }
    })

    revalidatePath(`/schools/[schoolId]/courses/${courseId}`)
}
