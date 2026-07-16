import { useEffect, useState, useMemo, useCallback } from 'react'
import { collection, query, orderBy, where, limit, getDocs, Timestamp, type QueryConstraint } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAdmin } from '../hooks/useAdmin'
import EmptyState from '../components/EmptyState'
import AuditLogDetailsModal from '../components/AuditLogDetailsModal'
import type { AuditLogWithId, AuditLog } from '../data/audit'

const ACTION_FILTERS = [
  { label: 'All Actions', value: '' },
  { label: 'Subscription Updated', value: 'subscription_updated' },
  { label: 'Product', value: 'product_' },
  { label: 'Expense', value: 'expense_' },
  { label: 'Inventory', value: 'inventory_' },
  { label: 'Login', value: 'login' },
  { label: 'Other', value: '__other__' },
] as const

function formatDate(ts: AuditLog['createdAt']): string {
  if (!ts) return '—'
  const d = ts.toDate()
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
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

function changesSummary(changes: AuditLog['changes']): string {
  if (!changes) return '—'
  const parts = Object.entries(changes).slice(0, 2).map(([field, entry]) => {
    const label = field.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()).replace('_', ' ')
    return `${label}: ${displayValue(entry.old)} → ${displayValue(entry.new)}`
  })
  if (Object.keys(changes).length > 2) parts.push('…')
  return parts.join(', ')
}

function displayValue(value: unknown): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'object' && 'toDate' in (value as object)) {
    return (value as { toDate: () => Date }).toDate().toLocaleDateString()
  }
  return String(value)
}

function matchesActionFilter(action: string, filter: string): boolean {
  if (!filter) return true
  if (filter === '__other__') {
    const prefixes = ACTION_FILTERS.filter((f) => f.value && f.value !== '__other__').map((f) => f.value)
    return !prefixes.some((p) => action.startsWith(p))
  }
  return action.startsWith(filter)
}

export default function AdminAuditLogs() {
  const { isSuperAdmin, loading: adminLoading } = useAdmin()

  const [logs, setLogs] = useState<AuditLogWithId[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selectedLog, setSelectedLog] = useState<AuditLogWithId | null>(null)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc'), limit(500)]

      if (dateFrom) {
        const fromDate = new Date(dateFrom)
        fromDate.setHours(0, 0, 0, 0)
        constraints.unshift(where('createdAt', '>=', Timestamp.fromDate(fromDate)))
      }

      if (dateTo) {
        const toDate = new Date(dateTo)
        toDate.setHours(23, 59, 59, 999)
        constraints.unshift(where('createdAt', '<=', Timestamp.fromDate(toDate)))
      }

      const q = query(collection(db, 'audit_logs'), ...constraints)
      const snap = await getDocs(q)

      const results: AuditLogWithId[] = []
      snap.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() } as AuditLogWithId)
      })

      setLogs(results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit logs.')
    } finally {
      setLoading(false)
    }
  }, [dateFrom, dateTo])

  useEffect(() => {
    if (!isSuperAdmin) return
    fetchLogs()
  }, [fetchLogs, isSuperAdmin])

  const filtered = useMemo(() => {
    const query = search.toLowerCase()
    return logs.filter((log) => {
      if (!matchesActionFilter(log.action, actionFilter)) return false

      if (query) {
        const matchesEmail = log.actorEmail.toLowerCase().includes(query)
        const matchesStore = (log.targetStore ?? '').toLowerCase().includes(query)
        const matchesAction = actionLabel(log.action).toLowerCase().includes(query)
        if (!matchesEmail && !matchesStore && !matchesAction) return false
      }

      if (dateFrom && log.createdAt) {
        const fromDate = new Date(dateFrom)
        fromDate.setHours(0, 0, 0, 0)
        if (log.createdAt.toMillis() < fromDate.getTime()) return false
      }

      if (dateTo && log.createdAt) {
        const toDate = new Date(dateTo)
        toDate.setHours(23, 59, 59, 999)
        if (log.createdAt.toMillis() > toDate.getTime()) return false
      }

      return true
    })
  }, [logs, search, actionFilter, dateFrom, dateTo])

  if (adminLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 rounded-lg bg-gray-200 dark:bg-slate-700 animate-pulse" />
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
          <div className="h-64 animate-pulse bg-gray-100 dark:bg-slate-700 rounded-lg" />
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Audit Logs</h2>
        <button
          onClick={fetchLogs}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-slate-400 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-slate-700 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Activity Log</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search email, store, action..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-sm dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-white"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow dark:bg-slate-700 dark:text-white bg-white"
            >
              {ACTION_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>

            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              placeholder="Date From"
              className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow dark:bg-slate-700 dark:text-white bg-white"
            />

            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              placeholder="Date To"
              className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow dark:bg-slate-700 dark:text-white bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm table-card">
            <thead>
              <tr className="text-left text-gray-500 dark:text-slate-400 font-medium border-b border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-700/50">
                <th className="px-5 py-4">Date &amp; Time</th>
                <th className="px-5 py-4">Actor</th>
                <th className="px-5 py-4">Action</th>
                <th className="px-5 py-4">Target Store</th>
                <th className="px-5 py-4">Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12">
                    <div className="space-y-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-6 bg-gray-100 dark:bg-slate-700 rounded animate-pulse" />
                      ))}
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-0">
                    <EmptyState
                      icon={
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      }
                      title={search || actionFilter || dateFrom || dateTo ? 'No audit logs found' : 'No audit logs'}
                      description={search || actionFilter || dateFrom || dateTo ? 'Try adjusting your filters.' : 'Administrative activities will appear here.'}
                    />
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="transition-colors hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer"
                  >
                    <td className="px-5 py-4 text-gray-600 dark:text-slate-400 whitespace-nowrap" data-label="Date & Time">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="px-5 py-4 text-gray-900 dark:text-white" data-label="Actor">
                      {log.actorEmail}
                    </td>
                    <td className="px-5 py-4" data-label="Action">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400">
                        {actionLabel(log.action)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-600 dark:text-slate-400" data-label="Target Store">
                      {log.targetStore || '—'}
                    </td>
                    <td className="px-5 py-4 text-gray-600 dark:text-slate-400 max-w-xs truncate" data-label="Summary">
                      {changesSummary(log.changes)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-100 dark:border-slate-700 text-xs text-gray-400 dark:text-slate-400">
          <span>{filtered.length} log{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {selectedLog && (
        <AuditLogDetailsModal
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </div>
  )
}
