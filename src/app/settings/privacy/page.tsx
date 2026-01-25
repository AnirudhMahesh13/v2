import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { PrivacyForm } from "./PrivacyForm"
import { redirect } from "next/navigation"

export default async function PrivacyPage() {
    const session = await auth()
    if (!session?.user?.id) redirect("/api/auth/signin")

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            privacySettings: true,
            blockedUserIds: true
        }
    })

    if (!user) return null

    // Fetch blocked user details
    const blockedUsers = user.blockedUserIds.length > 0
        ? await prisma.user.findMany({
            where: { id: { in: user.blockedUserIds } },
            select: { id: true, name: true, image: true, email: true }
        })
        : []

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-900">Privacy & Safety</h2>
                <p className="text-sm text-slate-500">Manage your visibility and blocked accounts.</p>
            </div>

            <div className="p-6">
                <PrivacyForm
                    settings={(user.privacySettings as any) || {}}
                    initialBlockedUsers={blockedUsers}
                />
            </div>
        </div>
    )
}
