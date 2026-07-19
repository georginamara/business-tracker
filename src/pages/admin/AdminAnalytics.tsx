import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useAdmin } from '../../hooks/useAdmin'
import { BarChart3, PieChart as PieChartIcon } from 'lucide-react'

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#6366f1', '#ec4899']

const darkTooltipStyle = {
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '8px',
  color: '#f8fafc',
  fontSize: '12px',
}

export default function AdminAnalytics() {
  const { owners, loading } = useAdmin()

  const byType = useMemo(() => {
    const map = new Map<string, number>()
    owners.forEach((o) => {
      const key = o.businessType || 'Unknown'
      map.set(key, (map.get(key) || 0) + 1)
    })
    return [...map.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
  }, [owners])

  const byPlan = useMemo(() => {
    const starter = owners.filter((o) => o.plan === 'Starter').length
    const business = owners.filter((o) => o.plan === 'Business').length
    return [
      { name: 'Starter', value: starter },
      { name: 'Business', value: business },
    ]
  }, [owners])

  const byStatus = useMemo(() => {
    const active = owners.filter((o) => o.status === 'active').length
    const suspended = owners.filter((o) => o.status === 'suspended').length
    return [
      { name: 'Active', value: active },
      { name: 'Suspended', value: suspended },
    ]
  }, [owners])

  const byMonth = useMemo(() => {
    const map = new Map<string, number>()
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = d.toLocaleString('default', { month: 'short', year: '2-digit' })
      map.set(key, 0)
    }
    owners.forEach((o) => {
      const d = (o.createdAt as { toDate?: () => Date })?.toDate?.()
      if (!d) return
      const key = d.toLocaleString('default', { month: 'short', year: '2-digit' })
      if (map.has(key)) map.set(key, (map.get(key) || 0) + 1)
    })
    return [...map.entries()].map(([name, count]) => ({ name, count }))
  }, [owners])

  if (loading) return <div className="text-sm text-slate-400 p-6">Loading...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-sm text-slate-400 mt-1">Platform growth and distribution insights</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-xl bg-slate-800 border border-slate-700/50 p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={16} className="text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Businesses by Type</h3>
          </div>
          {byType.length === 0 ? (
            <p className="text-sm text-slate-400">No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={byType} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip contentStyle={darkTooltipStyle} />
                <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-xl bg-slate-800 border border-slate-700/50 p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={16} className="text-blue-400" />
            <h3 className="text-sm font-semibold text-white">Monthly Registrations</h3>
          </div>
          {byMonth.every((m) => m.count === 0) ? (
            <p className="text-sm text-slate-400">No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={byMonth} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip contentStyle={darkTooltipStyle} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-xl bg-slate-800 border border-slate-700/50 p-6">
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon size={16} className="text-violet-400" />
            <h3 className="text-sm font-semibold text-white">Starter vs Business</h3>
          </div>
          {byPlan.every((p) => p.value === 0) ? (
            <p className="text-sm text-slate-400">No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={byPlan} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {byPlan.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={darkTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-xl bg-slate-800 border border-slate-700/50 p-6">
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon size={16} className="text-amber-400" />
            <h3 className="text-sm font-semibold text-white">Active vs Suspended</h3>
          </div>
          {byStatus.every((s) => s.value === 0) ? (
            <p className="text-sm text-slate-400">No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={byStatus} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {byStatus.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={darkTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
