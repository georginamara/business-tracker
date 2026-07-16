import { useState, useEffect } from 'react'
import { Timestamp } from 'firebase/firestore'
import type { Subscription } from '../data/subscription'
import type { PlanName } from '../data/plans'

const STATUSES: Subscription['status'][] = ['trial', 'active', 'expired', 'canceled']
const ACCOUNT_STATUSES: Subscription['accountStatus'][] = ['active', 'suspended', 'disabled']
const EDITABLE_PLAN_NAMES: PlanName[] = ['Starter', 'Business', 'Pro']

interface AdminSubscriptionModalProps {
  open: boolean
  ownerUid: string
  subscription: Pick<Subscription, 'plan' | 'status' | 'accountStatus' | 'trialEndsAt' | 'subscriptionEndsAt'>
  onSave: (
    ownerUid: string,
    data: Pick<Subscription, 'plan' | 'status' | 'accountStatus' | 'trialEndsAt' | 'subscriptionEndsAt'>
  ) => Promise<void>
  onClose: () => void
}

function toDateInputValue(ts: Timestamp | null): string {
  if (!ts) return ''
  return ts.toDate().toISOString().slice(0, 10)
}

export default function AdminSubscriptionModal({
  open,
  ownerUid,
  subscription,
  onSave,
  onClose,
}: AdminSubscriptionModalProps) {
  const [plan, setPlan] = useState(subscription.plan)
  const [status, setStatus] = useState(subscription.status)
  const [accountStatus, setAccountStatus] = useState(subscription.accountStatus)
  const [trialEndsAt, setTrialEndsAt] = useState(toDateInputValue(subscription.trialEndsAt))
  const [subscriptionEndsAt, setSubscriptionEndsAt] = useState(toDateInputValue(subscription.subscriptionEndsAt))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setPlan(subscription.plan)
    setStatus(subscription.status)
    setAccountStatus(subscription.accountStatus)
    setTrialEndsAt(toDateInputValue(subscription.trialEndsAt))
    setSubscriptionEndsAt(toDateInputValue(subscription.subscriptionEndsAt))
    setError('')
  }, [subscription, open])

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!trialEndsAt) return

    setSaving(true)
    setError('')

    try {
      await onSave(ownerUid, {
        plan,
        status: status as Subscription['status'],
        accountStatus: accountStatus as Subscription['accountStatus'],
        trialEndsAt: Timestamp.fromDate(new Date(trialEndsAt)),
        subscriptionEndsAt: subscriptionEndsAt
          ? Timestamp.fromDate(new Date(subscriptionEndsAt))
          : null,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update subscription.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md p-6 animate-scale-in max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Edit Subscription
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Plan</label>
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value as PlanName)}
              className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2.5 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
              required
            >
              {EDITABLE_PLAN_NAMES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Subscription Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Subscription['status'])}
              className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2.5 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
              required
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Account Status
            </label>
            <select
              value={accountStatus}
              onChange={(e) => setAccountStatus(e.target.value as Subscription['accountStatus'])}
              className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2.5 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
              required
            >
              {ACCOUNT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Trial End Date
            </label>
            <input
              type="date"
              value={trialEndsAt}
              onChange={(e) => setTrialEndsAt(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2.5 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Subscription End Date
            </label>
            <input
              type="date"
              value={subscriptionEndsAt}
              onChange={(e) => setSubscriptionEndsAt(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2.5 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving…
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
