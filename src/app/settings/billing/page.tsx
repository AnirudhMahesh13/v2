import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { CreditCard, ExternalLink, DollarSign } from 'lucide-react'

export default async function BillingPage() {
    const session = await auth()
    if (!session?.user?.id) redirect("/api/auth/signin")

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-900">Billing & Payouts</h2>
                <p className="text-sm text-slate-500">Manage your payment methods and tutor earnings.</p>
            </div>

            <div className="p-6 space-y-6">

                {/* Payment Methods */}
                <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-indigo-600 shadow-sm border border-slate-100">
                            <CreditCard size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">Payment Methods</h3>
                            <p className="text-sm text-slate-500">Cards used for booking tutors.</p>
                        </div>
                    </div>
                    <button className="w-full py-3 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-colors flex items-center justify-center gap-2">
                        Manage Cards on Stripe <ExternalLink size={14} />
                    </button>
                </div>

                {/* Payouts */}
                <div className="p-6 bg-slate-900 rounded-xl border border-slate-800 text-white">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                            <DollarSign size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">Tutor Earnings</h3>
                            <p className="text-sm text-slate-400">View your payout history and balance.</p>
                        </div>
                    </div>
                    <button className="w-full py-3 bg-indigo-600 border border-transparent text-white font-bold rounded-xl hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/50">
                        Go to Stripe Express Dashboard <ExternalLink size={14} />
                    </button>
                </div>

            </div>
        </div>
    )
}
