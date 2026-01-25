import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { ProfileForm } from "./ProfileForm"
import { redirect } from "next/navigation"

export default async function SettingsPage() {
    const session = await auth()
    if (!session?.user?.id) redirect("/api/auth/signin")

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            name: true,
            email: true,
            bio: true,
            image: true,
            school: { select: { name: true, domain: true } },
            privacySettings: true
        }
    })

    if (!user) return null

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-900">Academic Identity</h2>
                <p className="text-sm text-slate-500">Manage how you appear to your classmates.</p>
            </div>

            <div className="p-6">
                <ProfileForm user={user} />
            </div>
        </div>
    )
}
