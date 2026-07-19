import { useAdmin, toDate, computeDaysRemaining } from '../../hooks/useAdmin'
import {
  Store, UserPlus, CreditCard, Clock, Ban, ArrowRight,
  Users, BarChart3, ClipboardList, TrendingUp, Activity,
  AlertTriangle, Bell,
} from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AdminDashboard() {
  const { owners, loading } = useAdmin()

  const now = new Date()
  const thisMonth = owners.filter((o) => {
    const d = (o.createdAt as { toDate?: () => Date })?.toDate?.()
    if (!d) return false
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })

  const trialCount = owners.filter((o) => (o.subscription?.status || 'trial') === 'trial').length
  const activeCount = owners.filter((o) => o.subscription?.status === 'active').length
  const expiredCount = owners.filter((o) => o.subscription?.status === 'expired').length
  const cancelledCount = owners.filter((o) => o.subscription?.status === 'cancelled').length

  const statCards = [
    { label: 'Registered Stores', value: owners.length, icon: <Store size={20} />, bgLight: 'bg-emerald-500/10', iconColor: 'text-emerald-400' },
    { label: 'Trial Accounts', value: trialCount, icon: <UserPlus size={20} />, bgLight: 'bg-yellow-500/10', iconColor: 'text-yellow-400' },
    { label: 'Active Subscriptions', value: activeCount, icon: <CreditCard size={20} />, bgLight: 'bg-blue-500/10', iconColor: 'text-blue-400' },
    { label: 'Expired Subscriptions', value: expiredCount, icon: <Clock size={20} />, bgLight: 'bg-amber-500/10', iconColor: 'text-amber-400' },
    { label: 'Cancelled Stores', value: cancelledCount, icon: <Ban size={20} />, bgLight: 'bg-red-500/10', iconColor: 'text-red-400' },
  ]

  const warnings: { text: string; type: 'trial' | 'subscription' | 'expired' }[] = []
  owners.forEach((o) => {
    const sub = o.subscription
    if (!sub) return
    if (sub.status === 'trial' && sub.trialEnd) {
      const end = toDate(sub.trialEnd)
      if (end) {
        const days = Math.ceil((end.getTime() - now.getTime()) / 86400000)
        if (days <= 0) warnings.push({ text: `${o.email}: trial expired`, type: 'expired' })
        else if (days <= 3) warnings.push({ text: `${o.email}: trial expires in ${days}d`, type: 'trial' })
      }
    }
    if (sub.status === 'active' && sub.subscriptionEnd) {
      const end = toDate(sub.subscriptionEnd)
      if (end) {
        const days = Math.ceil((end.getTime() - now.getTime()) / 86400000)
        if (days <= 0) warnings.push({ text: `${o.email}: subscription expired today`, type: 'expired' })
        else if (days <= 7) warnings.push({ text: `${o.email}: subscription expires in ${days}d`, type: 'subscription' })
      }
    }
  })

  const latestRegistrations = owners.slice(0, 5)

  const recentActivity = owners.slice(0, 5).map((o) => {
    const sub = o.subscription
    const trialEnd = toDate(sub?.trialEnd)
    const daysLeft = computeDaysRemaining(sub)
    return {
      id: o.uid,
      business: o.businessType || 'Unknown',
      plan: sub?.plan || o.plan,
      trialEnd: trialEnd ? trialEnd.toLocaleDateString() : '—',
      status: sub?.status || 'trial',
      daysLeft,
    }
  })

  const quickActions = [
    { label: 'Manage Stores', desc: 'View and manage all registered stores', icon: <Users size={20} />, to: '/admin/users', color: 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' },
    { label: 'Platform Analytics', desc: 'View growth charts and insights', icon: <BarChart3 size={20} />, to: '/admin/analytics', color: 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20' },
    { label: 'Audit Logs', desc: 'Review all admin actions', icon: <ClipboardList size={20} />, to: '/admin/audit', color: 'bg-violet-500/10 text-violet-400 hover:bg-violet-500/20' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Overview of your platform</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <TrendingUp size={14} className="text-emerald-400" />
          <span className="text-xs font-medium text-emerald-400">{thisMonth.length} new this month</span>
        </div>
      </div>

      {warnings.length > 0 && (
        <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Bell size={16} className="text-amber-400" />
            <h3 className="text-sm font-semibold text-amber-400">Notifications</h3>
          </div>
          <div className="space-y-1">
            {warnings.map((w, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <AlertTriangle size={12} className={w.type === 'expired' ? 'text-red-400' : 'text-amber-400'} />
                <span className={w.type === 'expired' ? 'text-red-300' : 'text-amber-300'}>{w.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="group rounded-xl bg-slate-800 border border-slate-700/50 p-5 hover:border-slate-600 transition-all duration-300 hover:shadow-lg hover:shadow-black/20">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${s.bgLight} flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${s.iconColor}`}>
                {s.icon}
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{loading ? '—' : s.value}</p>
            <p className="text-xs text-slate-400 mt-1 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-xl bg-slate-800 border border-slate-700/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserPlus size={16} className="text-emerald-400" />
              <h2 className="text-sm font-semibold text-white">Latest Registrations</h2>
            </div>
            <Link to="/admin/users" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {loading ? (
            <div className="p-6 text-sm text-slate-400">Loading...</div>
          ) : latestRegistrations.length === 0 ? (
            <div className="p-6 text-sm text-slate-400">No registrations yet.</div>
          ) : (
            <div className="divide-y divide-slate-700/50">
              {latestRegistrations.map((o) => {
                const sub = o.subscription
                const trialEnd = toDate(sub?.trialEnd)
                return (
                  <div key={o.uid} className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-700/30 transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">{o.businessType || 'Unknown'}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{o.email}</p>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full ${(sub?.plan || o.plan) === 'Business' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-700 text-slate-300'}`}>{sub?.plan || o.plan}</span>
                      <span className="text-[10px] text-slate-500 hidden sm:inline">
                        Trial ends {trialEnd ? trialEnd.toLocaleDateString() : '—'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="rounded-xl bg-slate-800 border border-slate-700/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700/50 flex items-center gap-2">
            <Activity size={16} className="text-blue-400" />
            <h2 className="text-sm font-semibold text-white">Recent Activity</h2>
          </div>
          {loading ? (
            <div className="p-6 text-sm text-slate-400">Loading...</div>
          ) : recentActivity.length === 0 ? (
            <div className="p-6 text-sm text-slate-400">No activity yet.</div>
          ) : (
            <div className="divide-y divide-slate-700/50">
              {recentActivity.map((a) => (
                <div key={a.id} className="px-6 py-3.5 flex items-center gap-3 hover:bg-slate-700/30 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <Store size={14} className="text-emerald-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white">{a.business}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {a.plan} plan · {a.status} · {a.daysLeft > 0 ? `${a.daysLeft}d remaining` : 'Expired'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <ArrowRight size={16} className="text-slate-400" />
          Quick Actions
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {quickActions.map((a) => (
            <Link key={a.label} to={a.to} className={`group rounded-xl border border-slate-700/50 p-5 transition-all duration-300 hover:shadow-lg hover:shadow-black/20 hover:border-slate-600 ${a.color}`}>
              <div className="flex items-center gap-3 mb-2">
                {a.icon}
                <h3 className="text-sm font-semibold text-white">{a.label}</h3>
              </div>
              <p className="text-xs text-slate-400">{a.desc}</p>
              <ArrowRight size={14} className="mt-3 text-slate-500 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
