import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
    icon: LucideIcon
    title: string
    description: string
    action?: React.ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
            <div className="p-4 bg-white rounded-full shadow-sm mb-4 border border-slate-100">
                <Icon className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <p className="text-slate-500 mt-1 max-w-sm mb-6">{description}</p>
            {action}
        </div>
    )
}
