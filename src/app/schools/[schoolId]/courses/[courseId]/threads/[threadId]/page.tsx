
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { MessageSquare, User } from "lucide-react"

interface PageProps {
    params: Promise<{
        schoolId: string
        courseId: string
        threadId: string
    }>
}

export default async function ThreadPage({ params }: PageProps) {
    const { schoolId, courseId, threadId } = await params
    const session = await auth()

    // 1. Fetch Thread
    const thread = await prisma.thread.findUnique({
        where: { id: threadId },
        include: {
            user: true,
            comments: {
                include: { user: true },
                orderBy: { createdAt: 'asc' }
            },
            course: true
        }
    })

    if (!thread || thread.courseId !== courseId) {
        notFound()
    }

    // 2. Simple Comment Action (Inline for speed, properly should be in actions file)
    async function reply(formData: FormData) {
        'use server'
        const session = await auth()
        if (!session?.user?.id) redirect('/api/auth/signin')

        const body = formData.get('content') as string
        if (!body) return

        await prisma.comment.create({
            data: {
                body,
                threadId: thread!.id,
                userId: session.user.id
            }
        })
        redirect(`/schools/${schoolId}/courses/${courseId}/threads/${threadId}`)
    }

    return (
        <div className="container mx-auto px-6 py-8 max-w-4xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">{thread.title}</h1>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span className="font-medium text-indigo-600">{thread.user.name}</span>
                    <span>•</span>
                    <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8 shadow-sm">
                <p className="text-slate-700 whitespace-pre-wrap">{thread.body}</p>
            </div>

            <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    {thread.comments.length} Comments
                </h3>

                {thread.comments.map(comment => (
                    <div key={comment.id} className="flex gap-4 p-4 bg-slate-50 rounded-xl">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold flex-shrink-0">
                            {comment.user.name?.charAt(0)}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-slate-900">{comment.user.name}</span>
                                <span className="text-xs text-slate-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-slate-700 text-sm">{comment.body}</p>
                        </div>
                    </div>
                ))}

                {session?.user ? (
                    <form action={reply} className="mt-8">
                        <textarea
                            name="content"
                            placeholder="Write a reply..."
                            className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px]"
                            required
                        />
                        <button type="submit" className="mt-2 px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700">
                            Post Reply
                        </button>
                    </form>
                ) : (
                    <div className="p-4 bg-amber-50 rounded-xl text-amber-800 text-sm">
                        Please <a href="/api/auth/signin" className="underline font-bold">sign in</a> to reply.
                    </div>
                )}
            </div>
        </div>
    )
}
