import { useMemo, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAdmin } from '../hooks/useAdmin'
import { useAdminDashboard } from '../hooks/useAdminDashboard'
import DashboardCard from '../components/DashboardCard'
import EmptyState from '../components/EmptyState'
import { CardSkeleton } from '../components/Skeleton'
import type { AdminStoreRow } from '../data/admin'
import type { AuditLogWithId } from '../data/audit'

function formatDate(ts: { toDate(): Date } | null): string {
  if (!ts) return '—'
  const d = ts.toDate()
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatDateTime(ts: { toDate(): Date } | null): string {
  if (!ts) return '—'
  const d = ts.toDate()
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function actionLabel(action: string): string {
  const labels: Record<string, string> = {
    subscription_updated: 'Subscription Updated',
  }
  return labels[action] || action.replace(/_/g, ' ').replace(/\b\w/g, (s) => s.toUpperCase())
}

function QuickActionCard({
  title,
  description,
  icon,
  accent,
  onClick,
}: {
  title: string
  description: string
  icon: React.ReactNode
  accent: string
  onClick: () => void
}) {
  const colors: Record<string, { bg: string; text: string; hover: string }> = {
    indigo: { bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-600 dark:text-indigo-400', hover: 'hover:border-indigo-300 dark:hover:border-indigo-700' },
    green: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400', hover: 'hover:border-green-300 dark:hover:border-green-700' },
    amber: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', hover: 'hover:border-amber-300 dark:hover:border-amber-700' },
  }
  const c = colors[accent] || colors.indigo

  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 ${c.hover}`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${c.bg} ${c.text}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{title}</p>
          <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{description}</p>
        </div>
        <svg className="w-4 h-4 text-gray-400 dark:text-slate-500 shrink-0 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  )
}

export default function AdminHome() {
  const navigate = useNavigate()
  const { isSuperAdmin, loading: adminLoading } = useAdmin()
  const { stores, stats, loading, error } = useAdminDashboard()
  const [recentLogs, setRecentLogs] = useState<AuditLogWithId[]>([])
  const [logsLoading, setLogsLoading] = useState(true)

  useEffect(() => {
    if (!isSuperAdmin) return
    setLogsLoading(true)
    const q = query(collection(db, 'audit_logs'), orderBy('createdAt', 'desc'), limit(5))
    getDocs(q)
      .then((snap) => {
        const logs: AuditLogWithId[] = []
        snap.forEach((doc) => logs.push({ id: doc.id, ...doc.data() } as AuditLogWithId))
        setRecentLogs(logs)
      })
      .catch(() => setRecentLogs([]))
      .finally(() => setLogsLoading(false))
  }, [isSuperAdmin])

  const latestStores = useMemo(() => {
    return [...stores]
      .sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() ?? 0
        const bTime = b.createdAt?.toMillis?.() ?? 0
        return bTime - aTime
      })
      .slice(0, 5)
  }, [stores])

  if (adminLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 rounded-lg bg-gray-200 dark:bg-slate-700 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
              <div className="h-40 animate-pulse bg-gray-100 dark:bg-slate-700 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!isSuperAdmin) {
    return (
      <div className="text-center py-20 text-gray-500 dark:text-slate-400">
        <p className="text-lg font-medium">Access denied.</p>
        <p className="text-sm mt-1">You do not have permission to view this page.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h2>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <DashboardCard
            title="Registered Stores"
            value={stats.registeredStores}
            accent="indigo"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
          />
          <DashboardCard
            title="Trial Accounts"
            value={stats.trialAccounts}
            accent="blue"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <DashboardCard
            title="Active Subscriptions"
            value={stats.activeSubscriptions}
            accent="green"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <DashboardCard
            title="Expired Subscriptions"
            value={stats.expiredSubscriptions}
            accent="red"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            }
          />
          <DashboardCard
            title="Disabled Accounts"
            value={stats.disabledAccounts}
            accent="amber"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            }
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Latest Registrations</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {latestStores.length === 0 ? (
              <div className="py-0">
                <EmptyState
                  icon={
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  }
                  title="No registered businesses"
                  description="Businesses will appear after owners create accounts."
                />
              </div>
            ) : (
              latestStores.map((row: AdminStoreRow) => (
                <div key={row.uid} className="px-5 py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{row.storeName}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{row.businessType} &middot; {formatDate(row.createdAt)}</p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold shrink-0 ${
                    row.subscriptionStatus === 'active'
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                      : row.subscriptionStatus === 'trial'
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                      : row.subscriptionStatus === 'expired'
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400'
                  }`}>
                    {row.subscriptionStatus.charAt(0).toUpperCase() + row.subscriptionStatus.slice(1)}
                  </span>
                </div>
              ))
            )}
          </div>
          <div className="px-5 py-3 border-t border-gray-100 dark:border-slate-700">
            <button
              type="button"
              onClick={() => navigate('/admin/stores')}
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            >
              View all stores →
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {logsLoading ? (
              <div className="px-5 py-6">
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-5 bg-gray-100 dark:bg-slate-700 rounded animate-pulse" />
                  ))}
                </div>
              </div>
            ) : recentLogs.length === 0 ? (
              <div className="py-0">
                <EmptyState
                  icon={
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  }
                  title="No audit logs"
                  description="Administrative activities will appear here."
                />
              </div>
            ) : (
              recentLogs.map((log) => (
                <div key={log.id} className="px-5 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-gray-900 dark:text-white truncate">
                      <span className="font-medium">{log.actorEmail}</span>
                      <span className="text-gray-500 dark:text-slate-400"> — </span>
                      <span className="text-gray-600 dark:text-slate-300">{actionLabel(log.action)}</span>
                    </p>
                    <span className="text-[11px] text-gray-400 dark:text-slate-500 whitespace-nowrap shrink-0">
                      {formatDateTime(log.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="px-5 py-3 border-t border-gray-100 dark:border-slate-700">
            <button
              type="button"
              onClick={() => navigate('/admin/audit-logs')}
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            >
              View all activity →
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickActionCard
            title="Manage Stores"
            description="View and edit store subscriptions"
            accent="indigo"
            onClick={() => navigate('/admin/stores')}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
          />
          <QuickActionCard
            title="Platform Analytics"
            description="Charts, revenue, growth metrics"
            accent="green"
            onClick={() => navigate('/admin/analytics')}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          />
          <QuickActionCard
            title="Audit Logs"
            description="Review all system changes"
            accent="amber"
            onClick={() => navigate('/admin/audit-logs')}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          />
        </div>
      </div>
    </div>
  )
}
