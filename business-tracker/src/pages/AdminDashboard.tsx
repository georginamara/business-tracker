import { useMemo, useState } from 'react'
import type { Timestamp } from 'firebase/firestore'
import { useAdmin } from '../hooks/useAdmin'
import { useAdminDashboard } from '../hooks/useAdminDashboard'
import DashboardCard from '../components/DashboardCard'
import EmptyState from '../components/EmptyState'
import { CardSkeleton } from '../components/Skeleton'
import AdminSubscriptionModal from '../components/AdminSubscriptionModal'
import { useAudit } from '../hooks/useAudit'
import type { Subscription } from '../data/subscription'
import type { PlanName } from '../data/plans'
import type { AdminStoreRow } from '../data/admin'
import type { AuditChanges } from '../data/audit'

function formatDate(ts: Timestamp | null): string {
  if (!ts) return '—'
  const d = ts.toDate()
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function AdminDashboard() {
  const { isSuperAdmin, loading: adminLoading } = useAdmin()
  const { stores, stats, loading, error, refetch, updateSubscription } = useAdminDashboard()
  const { logAction } = useAudit()
  const [search, setSearch] = useState('')
  const [editingUid, setEditingUid] = useState('')
  const [editingStoreName, setEditingStoreName] = useState('')
  const [editTarget, setEditTarget] = useState<Pick<Subscription, 'plan' | 'status' | 'accountStatus' | 'trialEndsAt' | 'subscriptionEndsAt'> | null>(null)
  const [toast, setToast] = useState('')

  const handleSaveSubscription = async (
    ownerUid: string,
    data: Pick<Subscription, 'plan' | 'status' | 'accountStatus' | 'trialEndsAt' | 'subscriptionEndsAt'>
  ) => {
    const old = editTarget
    await updateSubscription(ownerUid, data)

    const changes: AuditChanges = {}
    if (old) {
      if (data.plan !== old.plan) changes.plan = { old: old.plan, new: data.plan }
      if (data.status !== old.status) changes.status = { old: old.status, new: data.status }
      if (data.accountStatus !== old.accountStatus) changes.accountStatus = { old: old.accountStatus, new: data.accountStatus }
      const oldTrial = old.trialEndsAt?.toMillis() ?? null
      const newTrial = data.trialEndsAt?.toMillis() ?? null
      if (oldTrial !== newTrial) changes.trialEndsAt = { old: old.trialEndsAt, new: data.trialEndsAt }
      const oldSubEnd = old.subscriptionEndsAt?.toMillis() ?? null
      const newSubEnd = data.subscriptionEndsAt?.toMillis() ?? null
      if (oldSubEnd !== newSubEnd) changes.subscriptionEndsAt = { old: old.subscriptionEndsAt, new: data.subscriptionEndsAt }
    }

    if (Object.keys(changes).length > 0) {
      logAction({
        action: 'subscription_updated',
        targetUid: ownerUid,
        targetStore: editingStoreName,
        changes,
      }).catch(() => {})
    }

    setToast('Subscription updated successfully.')
    setEditTarget(null)
    setEditingUid('')
    setEditingStoreName('')
    refetch()
    setTimeout(() => setToast(''), 3000)
  }

  const handleEdit = (row: AdminStoreRow) => {
    setEditingUid(row.uid)
    setEditingStoreName(row.storeName)
    setEditTarget({
      plan: (row.plan === '—' ? 'Starter' : row.plan) as PlanName,
      status: (row.subscriptionStatus === '—' ? 'trial' : row.subscriptionStatus) as Subscription['status'],
      accountStatus: (row.accountStatus === '—' ? 'active' : row.accountStatus) as Subscription['accountStatus'],
      trialEndsAt: row.trialEndsAt as Timestamp,
      subscriptionEndsAt: row.subscriptionEndsAt,
    })
  }

  const filtered = useMemo(
    () => stores.filter((s) => s.storeName.toLowerCase().includes(search.toLowerCase()) || s.businessType.toLowerCase().includes(search.toLowerCase())),
    [stores, search]
  )

  if (adminLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 rounded-lg bg-gray-200 dark:bg-slate-700 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Stores</h2>
        <button
          onClick={refetch}
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

      {stats && (
        <>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-4">Platform Overview</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.platformAccount}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Platform Owner</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.registeredStores}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Business Accounts</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.activeSubscriptions}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Active Subscribers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.trialAccounts}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Trial</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.expiredSubscriptions}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Expired</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.disabledAccounts}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Disabled</p>
              </div>
            </div>
          </div>

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
        </>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">All Stores</h3>
            <div className="relative w-full sm:max-w-xs">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by store name..."
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
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-card">
            <thead>
              <tr className="text-left text-gray-500 dark:text-slate-400 font-medium border-b border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-700/50">
                <th className="px-5 py-4">Store Name</th>
                <th className="px-5 py-4">Business Type</th>
                <th className="px-5 py-4">Plan</th>
                <th className="px-5 py-4">Subscription Status</th>
                <th className="px-5 py-4">Account Status</th>
                <th className="px-5 py-4">Last Login</th>
                <th className="px-5 py-4">Created Date</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-0">
                    <EmptyState
                      icon={
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      }
                      title={search ? 'No stores found' : 'No registered businesses'}
                      description={search ? 'Try a different search term.' : 'Businesses will appear after owners create accounts.'}
                    />
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.uid} className="transition-colors hover:bg-gray-50 dark:hover:bg-slate-700/50">
                    <td className="px-5 py-4 font-medium text-gray-900 dark:text-white" data-label="Store Name">
                      {row.storeName}
                    </td>
                    <td className="px-5 py-4" data-label="Business Type">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400">
                        {row.businessType}
                      </span>
                    </td>
                    <td className="px-5 py-4" data-label="Plan">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400">
                        {row.plan}
                      </span>
                    </td>
                    <td className="px-5 py-4" data-label="Subscription Status">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
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
                    </td>
                    <td className="px-5 py-4" data-label="Account Status">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        row.accountStatus === 'active'
                          ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                          : row.accountStatus === 'suspended'
                          ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
                          : row.accountStatus === 'disabled'
                          ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                          : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400'
                      }`}>
                        {row.accountStatus.charAt(0).toUpperCase() + row.accountStatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-600 dark:text-slate-400" data-label="Last Login">
                      {formatDate(row.lastLoginAt)}
                    </td>
                    <td className="px-5 py-4 text-gray-600 dark:text-slate-400" data-label="Created Date">
                      {formatDate(row.createdAt)}
                    </td>
                    <td className="px-5 py-4" data-label="Actions">
                      <button
                        onClick={() => handleEdit(row)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-100 dark:border-slate-700 text-xs text-gray-400 dark:text-slate-400 flex items-center justify-between">
          <span>{filtered.length} store{filtered.length !== 1 ? 's' : ''}</span>
          {search && <span>Filtered by: &quot;{search}&quot;</span>}
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-fade-in">
          {toast}
        </div>
      )}

      {editTarget && (
        <AdminSubscriptionModal
          open={true}
          ownerUid={editingUid}
          subscription={editTarget}
          onSave={handleSaveSubscription}
          onClose={() => { setEditTarget(null); setEditingUid('') }}
        />
      )}
    </div>
  )
}
