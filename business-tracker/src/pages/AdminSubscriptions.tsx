import { useEffect, useState } from 'react'
import { collection, getDocs, query, orderBy, doc, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'
import { useAdmin } from '../hooks/useAdmin'
import EmptyState from '../components/EmptyState'
import { CardSkeleton } from '../components/Skeleton'
import AdminSubscriptionModal from '../components/AdminSubscriptionModal'
import { useAudit } from '../hooks/useAudit'
import type { Subscription } from '../data/subscription'
import type { PlanName } from '../data/plans'
import type { AuditChanges } from '../data/audit'

interface SubscriptionRow {
  ownerId: string
  plan: string
  status: string
  accountStatus: string
  trialEndsAt: { toDate(): Date } | null
  subscriptionEndsAt: { toDate(): Date } | null
  lastLoginAt: { toDate(): Date } | null
  storeName: string
}

function formatDate(ts: { toDate(): Date } | null): string {
  if (!ts) return '—'
  return ts.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function AdminSubscriptions() {
  const { user } = useAuth()
  const { isSuperAdmin, loading: adminLoading } = useAdmin()
  const uid = user?.uid
  const { logAction } = useAudit()
  const [rows, setRows] = useState<SubscriptionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState('')
  const [editTarget, setEditTarget] = useState<Pick<Subscription, 'plan' | 'status' | 'accountStatus' | 'trialEndsAt' | 'subscriptionEndsAt'> | null>(null)
  const [editingUid, setEditingUid] = useState('')
  const [editingStoreName, setEditingStoreName] = useState('')

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [subSnap, storeSnap] = await Promise.all([
        getDocs(query(collection(db, 'subscriptions'), orderBy('createdAt', 'desc'))),
        getDocs(collection(db, 'stores')),
      ])

      const storeNames: Record<string, string> = {}
      storeSnap.forEach((doc) => {
        const data = doc.data()
        storeNames[doc.id] = data.storeName || 'Unknown'
      })

      const results: SubscriptionRow[] = []
      subSnap.forEach((doc) => {
        if (doc.id === uid) return
        const data = doc.data()
        results.push({
          ownerId: doc.id,
          plan: data.plan || '—',
          status: data.status || '—',
          accountStatus: data.accountStatus || 'active',
          trialEndsAt: data.trialEndsAt || null,
          subscriptionEndsAt: data.subscriptionEndsAt || null,
          lastLoginAt: data.lastLoginAt || null,
          storeName: storeNames[doc.id] || 'Unknown',
        })
      })
      setRows(results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subscriptions.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isSuperAdmin) fetchData()
  }, [isSuperAdmin])

  const filtered = rows.filter((r) => r.storeName.toLowerCase().includes(search.toLowerCase()) || r.plan.toLowerCase().includes(search.toLowerCase()))

  const handleEdit = (row: SubscriptionRow) => {
    setEditingUid(row.ownerId)
    setEditingStoreName(row.storeName)
    setEditTarget({
      plan: (row.plan === '—' ? 'Starter' : row.plan) as PlanName,
      status: (row.status === '—' ? 'trial' : row.status) as Subscription['status'],
      accountStatus: (row.accountStatus === '—' ? 'active' : row.accountStatus) as Subscription['accountStatus'],
      trialEndsAt: row.trialEndsAt as Subscription['trialEndsAt'],
      subscriptionEndsAt: row.subscriptionEndsAt as Subscription['subscriptionEndsAt'],
    })
  }

  const handleSaveSubscription = async (
    ownerUid: string,
    data: Pick<Subscription, 'plan' | 'status' | 'accountStatus' | 'trialEndsAt' | 'subscriptionEndsAt'>
  ) => {
    const old = editTarget

    await updateDoc(doc(db, 'subscriptions', ownerUid), {
      plan: data.plan,
      status: data.status,
      accountStatus: data.accountStatus,
      trialEndsAt: data.trialEndsAt,
      subscriptionEndsAt: data.subscriptionEndsAt,
      updatedAt: new Date(),
    })

    const changes: AuditChanges = {}
    if (old) {
      if (data.plan !== old.plan) changes.plan = { old: old.plan, new: data.plan }
      if (data.status !== old.status) changes.status = { old: old.status, new: data.status }
      if (data.accountStatus !== old.accountStatus) changes.accountStatus = { old: old.accountStatus, new: data.accountStatus }
    }

    if (Object.keys(changes).length > 0) {
      logAction({ action: 'subscription_updated', targetUid: ownerUid, targetStore: editingStoreName, changes }).catch(() => {})
    }

    setToast('Subscription updated successfully.')
    setEditTarget(null)
    setEditingUid('')
    setEditingStoreName('')
    fetchData()
    setTimeout(() => setToast(''), 3000)
  }

  if (adminLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 rounded-lg bg-gray-200 dark:bg-slate-700 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Subscriptions</h2>
        <button
          onClick={fetchData}
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
        <div className="px-5 py-4 border-b border-gray-200 dark:border-slate-700">
          <div className="relative w-full sm:max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by store name or plan..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-sm dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm table-card">
            <thead>
              <tr className="text-left text-gray-500 dark:text-slate-400 font-medium border-b border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-700/50">
                <th className="px-5 py-4">Store</th>
                <th className="px-5 py-4">Plan</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Account</th>
                <th className="px-5 py-4">Trial Ends</th>
                <th className="px-5 py-4">Subscription Ends</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-0">
                    <EmptyState
                      icon={
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      }
                      title={search ? 'No subscriptions found' : 'No subscriptions yet'}
                      description={search ? 'Try a different search term.' : 'Subscriptions will appear after businesses register.'}
                    />
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.ownerId} className="transition-colors hover:bg-gray-50 dark:hover:bg-slate-700/50">
                    <td className="px-5 py-4 font-medium text-gray-900 dark:text-white" data-label="Store">
                      {row.storeName}
                    </td>
                    <td className="px-5 py-4" data-label="Plan">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400">
                        {row.plan}
                      </span>
                    </td>
                    <td className="px-5 py-4" data-label="Status">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        row.status === 'active' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                          : row.status === 'trial' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                          : row.status === 'expired' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                          : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400'
                      }`}>
                        {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-5 py-4" data-label="Account">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        row.accountStatus === 'active' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                          : row.accountStatus === 'suspended' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
                          : row.accountStatus === 'disabled' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                          : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400'
                      }`}>
                        {row.accountStatus.charAt(0).toUpperCase() + row.accountStatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-600 dark:text-slate-400" data-label="Trial Ends">
                      {formatDate(row.trialEndsAt)}
                    </td>
                    <td className="px-5 py-4 text-gray-600 dark:text-slate-400" data-label="Subscription Ends">
                      {formatDate(row.subscriptionEndsAt)}
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
        <div className="px-5 py-3 border-t border-gray-100 dark:border-slate-700 text-xs text-gray-400 dark:text-slate-400">
          {filtered.length} subscription{filtered.length !== 1 ? 's' : ''}
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
