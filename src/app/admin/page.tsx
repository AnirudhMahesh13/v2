import { getDashboardStats } from '@/actions/admin' // Import the new stats helper
import { Activity, AlertTriangle, CheckCircle, DollarSign } from 'lucide-react'

export const dynamic = 'force-dynamic' // Ensure real-time data

export default async function AdminDashboard() {
    const stats = await getDashboardStats()

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-slate-900 font-display">System Health</h2>
                <p className="text-slate-500">Real-time overview of the autonomous network.</p>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    label="Active Users"
                    value={stats.totalUsers.toLocaleString()}
                    icon={Activity}
                    trend="Live Count"
                    color="indigo"
                />
                <StatCard
                    label="Mod Queue"
                    value={stats.pendingModeration.toString()}
                    icon={AlertTriangle}
                    alert={stats.pendingModeration > 10}
                    color="amber"
                />
                <StatCard
                    label="At-Risk Tutors"
                    value={stats.highRiskTutors.toString()}
                    icon={CheckCircle}
                    color="rose"
                />
                <StatCard
                    label="Est. Platform Rev"
                    value={`$${(stats.totalRevenue / 100).toFixed(2)}`}
                    icon={DollarSign}
                    color="emerald"
                />
            </div>

            {/* Recent Anomalies / Activity Feed */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-900 mb-4">Anomaly Detection</h3>
                    <div className="space-y-4">
                        {stats.highRiskTutors > 0 && (
                            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-bold text-amber-900">{stats.highRiskTutors} Tutors below trust threshold</h4>
                                    <p className="text-xs text-amber-700 mt-1">
                                        These accounts have been automatically hidden pending review.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* If no alerts */}
                        {stats.highRiskTutors === 0 && (
                            <div className="h-full flex flex-col items-center justify-center py-8 text-center text-slate-400">
                                <CheckCircle className="w-12 h-12 mb-3 text-emerald-100" />
                                <p>No anomalies detected.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-900 mb-4">Verification Logs</h3>
                    <div className="space-y-2">
                        {stats.logs.map(log => (
                            <div key={log.id} className="flex items-center justify-between text-sm py-2 border-b border-slate-50 last:border-0">
                                <span className="flex items-center gap-2 text-slate-600">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    Verified {log.tutor.name}
                                </span>
                                <span className="text-xs text-slate-400">
                                    {new Date(log.updatedAt).toLocaleTimeString()}
                                </span>
                            </div>
                        ))}
                        {stats.logs.length === 0 && (
                            <p className="text-sm text-slate-400 italic">No recent verification activity.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatCard({ label, value, icon: Icon, trend, alert, color }: any) {
    const colors = {
        indigo: "bg-indigo-50 text-indigo-600",
        amber: "bg-amber-50 text-amber-600",
        rose: "bg-rose-50 text-rose-600",
        emerald: "bg-emerald-50 text-emerald-600",
    }
    // @ts-expect-error -- color mapping
    const colorClass = colors[color] || colors.indigo

    return (
        <div className={`bg-white p-6 rounded-2xl shadow-sm border ${alert ? 'border-rose-200 ring-2 ring-rose-100' : 'border-slate-100'}`}>
            <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                </div>
                {trend && <span className="text-xs font-semibold text-emerald-600">{trend}</span>}
            </div>
            <div className="text-2xl font-bold text-slate-900">{value}</div>
            <div className="text-sm text-slate-500 font-medium">{label}</div>
        </div>
    )
}
