import Link from 'next/link'
import { LayoutDashboard, ShieldAlert, GraduationCap, Building2, LogOut } from 'lucide-react'
import { signOut } from '@/auth' // You might need a client-side signout or server action wrapper
// Actually, standard next-auth signout is often client side, but we can make a server action or just a link.
// For simplicity, we'll keep it simple.

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full z-20">
                <div className="p-6 border-b border-slate-800">
                    <h1 className="text-xl font-bold tracking-tight font-display">Command Center</h1>
                    <p className="text-xs text-slate-400 mt-1">Autonomous Admin v1.0</p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <NavItem href="/admin" icon={LayoutDashboard} label="Dashboard" />
                    <NavItem href="/admin/moderation" icon={ShieldAlert} label="Moderation Queue" />
                    <NavItem href="/admin/tutors" icon={GraduationCap} label="Tutors & Appeals" />
                    <NavItem href="/admin/schools" icon={Building2} label="School Domains" />
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <Link href="/" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-sm font-medium">
                        <LogOut className="w-5 h-5" />
                        Exit to App
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-6xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}

function NavItem({ href, icon: Icon, label }: { href: string, icon: any, label: string }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-sm font-medium"
        >
            <Icon className="w-5 h-5" />
            {label}
        </Link>
    )
}
