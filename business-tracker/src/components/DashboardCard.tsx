import type { ReactNode } from 'react'

interface DashboardCardProps {
  title: string
  value: string | number
  icon: ReactNode
  accent?: string
}

export default function DashboardCard({ title, value, icon, accent = 'indigo' }: DashboardCardProps) {
  const accentMap: Record<string, { bg: string; text: string }> = {
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
    green: { bg: 'bg-green-50', text: 'text-green-600' },
    red: { bg: 'bg-red-50', text: 'text-red-600' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
  }

  const colors = accentMap[accent] || accentMap.indigo

  return (
    <div className="group bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default">
      <div className={`shrink-0 w-12 h-12 rounded-lg ${colors.bg} ${colors.text} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  )
}
