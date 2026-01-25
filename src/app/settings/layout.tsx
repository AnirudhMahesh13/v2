import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { User, Bell, Shield, CreditCard, ChevronLeft } from "lucide-react"

export default async function SettingsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()
    if (!session?.user) redirect("/api/auth/signin")

    const tabs = [
        { name: "Profile & Identity", href: "/settings", icon: User },
        { name: "Notifications", href: "/settings/notifications", icon: Bell },
        { name: "Privacy & Safety", href: "/settings/privacy", icon: Shield },
        { name: "Billing & Payouts", href: "/settings/billing", icon: CreditCard },
    ]

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="mb-6 flex items-center gap-4">
                    <Link href="/dashboard" className="p-2 bg-white rounded-full border border-slate-200 text-slate-500 hover:text-indigo-600 transition-colors">
                        <ChevronLeft size={20} />
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-900">Settings Center</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar Navigation */}
                    <nav className="lg:col-span-1 space-y-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon
                            return (
                                <Link
                                    key={tab.name}
                                    href={tab.href}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-slate-600 hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                >
                                    <Icon size={18} />
                                    {tab.name}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Main Content Area */}
                    <main className="lg:col-span-3">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    )
}
