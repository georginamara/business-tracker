import { useState, useMemo } from 'react'
import { useSubscription } from '../hooks/useSubscription'
import { useSubscriptionGuard } from '../hooks/useSubscriptionGuard'
import { useAdmin } from '../hooks/useAdmin'
import { PLANS, type PlanName } from '../data/plans'
import { APP_VERSION } from '../data/appInfo'

const STATUS_STYLES: Record<string, string> = {
  trial: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  active: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  expired: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  canceled: 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-400',
}

const ACCOUNT_STYLES: Record<string, string> = {
  active: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  suspended: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  disabled: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const PLAN_FEATURES: Record<PlanName, string[]> = {
  Starter: [
    'Sales Monitoring',
    'Inventory Tracking',
    'Expense Management',
  ],
  Business: [
    'Everything in Starter',
    'Business Dashboard Reports',
    'Continuous Updates',
  ],
  Pro: [
    'Everything in Business',
    'Advanced Analytics',
    'Detailed Reports',
    'Business Insights',
    'Priority Support',
  ],
  Platform: [
    'Full Platform Access',
    'All Business Features',
    'Advanced Analytics',
    'AI Insights',
    'Platform Management',
  ],
}

const CONTACT_EMAIL = 'georgi.admin@gmail.com'

function formatDate(ts: { toDate(): Date } | null | undefined): string {
  if (!ts) return '---'
  try {
    return ts.toDate().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return '---'
  }
}

function daysBetween(a: Date, b: Date): number {
  return Math.max(0, Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)))
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${className ?? ''}`}>
      {children}
    </span>
  )
}

function CheckIcon() {
  return (
    <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
}

export default function Subscription() {
  const { subscription, loading } = useSubscription()
  const { trialDaysRemaining } = useSubscriptionGuard()
  const { isSuperAdmin } = useAdmin()
  const [showModal, setShowModal] = useState(false)

  const currentPlan = subscription?.plan ?? 'Starter'
  const status = subscription?.status ?? 'trial'
  const accountStatus = subscription?.accountStatus ?? 'active'

  const daysRemaining = useMemo(() => {
    const now = new Date()
    if (status === 'trial' && trialDaysRemaining !== null) {
      return trialDaysRemaining
    }
    if (status === 'active' && subscription?.subscriptionEndsAt) {
      const ends = subscription.subscriptionEndsAt.toDate()
      return daysBetween(now, ends)
    }
    return 0
  }, [status, trialDaysRemaining, subscription?.subscriptionEndsAt])

  const currentPlanDef = PLANS.find((p) => p.id === currentPlan) ?? PLANS[0]
  const includedFeatures = PLAN_FEATURES[currentPlan]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 rounded-lg bg-gray-200 dark:bg-slate-700 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-64 rounded-xl bg-gray-200 dark:bg-slate-700 animate-pulse" />
          <div className="h-64 rounded-xl bg-gray-200 dark:bg-slate-700 animate-pulse" />
        </div>
      </div>
    )
  }

  if (isSuperAdmin) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Subscription</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Platform account management.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Platform Account</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Account Name</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">Business Tracker Platform</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Role</p>
                  <Badge className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">Super Administrator</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Subscription</p>
                  <Badge className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">Platform</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Status</p>
                  <Badge className={ACCOUNT_STYLES[accountStatus]}>
                    {accountStatus.charAt(0).toUpperCase() + accountStatus.slice(1)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Expires</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">Never</p>
                </div>
              </div>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-6">
              <p className="text-sm text-indigo-700 dark:text-indigo-300">
                This account manages the Business Tracker platform. Subscription management is not applicable.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Features Included</h3>
              <div className="space-y-3">
                {includedFeatures.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <CheckIcon />
                    <span className="text-sm text-gray-700 dark:text-slate-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {PLANS.filter((p) => p.id !== 'Platform').map((plan) => (
              <div
                key={plan.id}
                className="rounded-xl border shadow-sm p-5 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 opacity-60"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-white">{plan.label}</h4>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {plan.priceLabel}
                  <span className="text-sm font-normal text-gray-500 dark:text-slate-400">/month</span>
                </p>
                <ul className="space-y-2 mb-4">
                  {PLAN_FEATURES[plan.id].map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600 dark:text-slate-400">
                      <CheckIcon />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  disabled
                  className="w-full py-2 px-4 rounded-lg text-sm font-medium bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500 cursor-not-allowed"
                >
                  Platform Account
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">About Billing</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">
            Current Version: <span className="font-medium text-gray-700 dark:text-slate-300">{APP_VERSION}</span>
          </p>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            This is the platform owner account. Subscription management is not applicable.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Subscription</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          Manage your Business Tracker subscription.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Current Subscription</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Current Plan</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{currentPlanDef.label}</p>
                <p className="text-sm text-gray-500 dark:text-slate-400">{currentPlanDef.priceLabel}/month</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Subscription Status</p>
                <Badge className={STATUS_STYLES[status]}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Account Status</p>
                <Badge className={ACCOUNT_STYLES[accountStatus]}>
                  {accountStatus.charAt(0).toUpperCase() + accountStatus.slice(1)}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Days Remaining</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {daysRemaining}
                  <span className="text-sm font-normal text-gray-500 dark:text-slate-400 ml-1">
                    day{daysRemaining !== 1 ? 's' : ''}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Trial Ends</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatDate(subscription?.trialEndsAt)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Subscription Ends</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatDate(subscription?.subscriptionEndsAt)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Features Included</h3>
            <div className="space-y-3">
              {includedFeatures.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <CheckIcon />
                  <span className="text-sm text-gray-700 dark:text-slate-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {PLANS.map((plan) => {
            const isCurrent = plan.id === currentPlan
            return (
              <div
                key={plan.id}
                className={`rounded-xl border shadow-sm p-5 ${
                  isCurrent
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700'
                    : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-white">{plan.label}</h4>
                  {plan.recommended && !isCurrent && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-800/50 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                      Recommended
                    </span>
                  )}
                  {isCurrent && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-green-100 dark:bg-green-800/50 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {plan.priceLabel}
                  <span className="text-sm font-normal text-gray-500 dark:text-slate-400">/month</span>
                </p>
                <ul className="space-y-2 mb-4">
                  {PLAN_FEATURES[plan.id].map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600 dark:text-slate-400">
                      <CheckIcon />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-2 px-4 rounded-lg text-sm font-medium bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500 cursor-not-allowed"
                  >
                    Current Plan
                  </button>
                ) : (
                  <button
                    onClick={() => setShowModal(true)}
                    className="w-full py-2 px-4 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled
                  >
                    Upgrade
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">About Billing</h3>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">
          Current Version: <span className="font-medium text-gray-700 dark:text-slate-300">{APP_VERSION}</span>
        </p>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Subscription updates and renewals are currently handled manually. Future versions will support online payments and automatic renewals.
        </p>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Upgrade Subscription
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
              Thank you for your interest in upgrading your Business Tracker subscription.
              <br /><br />
              For now, subscription upgrades are processed manually. Please contact the developer to upgrade your account.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
              >
                Close
              </button>
              <a
                href={`mailto:${CONTACT_EMAIL}?subject=Subscription%20Upgrade%20Request`}
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
              >
                Contact Developer
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
