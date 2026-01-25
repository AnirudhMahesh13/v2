import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NotificationForm } from "./NotificationForm"
import { redirect } from "next/navigation"

export default async function NotificationsPage() {
    const session = await auth()
    if (!session?.user?.id) redirect("/api/auth/signin")

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            notificationPrefs: true
        }
    })

    if (!user) return null

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-900">Notification Preferences</h2>
                <p className="text-sm text-slate-500">Control what alerts you receive and how.</p>
            </div>

            <div className="p-6">
                <NotificationForm prefs={(user.notificationPrefs as any) || {}} />
            </div>
        </div>
    )
}
