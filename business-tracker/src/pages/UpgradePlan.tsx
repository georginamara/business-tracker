import { useNavigate } from 'react-router-dom'
import { usePlanAccess } from '../hooks/usePlanAccess'
import { PLANS, type PlanName, type PlanDef } from '../data/plans'

function CheckIcon() {
  return (
    <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
}

function PlanCard({ planDef, isCurrent, isHigher }: {
  planDef: PlanDef
  isCurrent: boolean
  isHigher: boolean
}) {
  return (
    <div
      className={`relative flex flex-col bg-white dark:bg-slate-800 rounded-2xl border-2 p-6 transition-all duration-200 ${
        planDef.recommended
          ? 'border-indigo-500 shadow-lg shadow-indigo-500/10 dark:shadow-indigo-500/5'
          : isCurrent
          ? 'border-green-500 shadow-md'
          : 'border-gray-200 dark:border-slate-700 shadow-sm'
      }`}
    >
      {planDef.recommended && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-white bg-indigo-600 rounded-full shadow-sm">
            Recommended
          </span>
        </div>
      )}

      {isCurrent && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-white bg-green-600 rounded-full shadow-sm">
            Current Plan
          </span>
        </div>
      )}

      <div className="text-center mb-5">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{planDef.label}</h3>
        <div className="mt-3">
          <span className="text-4xl font-extrabold text-gray-900 dark:text-white">{planDef.priceLabel}</span>
          <span className="text-sm text-gray-500 dark:text-slate-400 ml-1">/month</span>
        </div>
        <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">{planDef.description}</p>
      </div>

      <div className="flex-1 space-y-3 mb-6">
        {planDef.features.map((feature) => (
          <div key={feature} className="flex items-start gap-3">
            <CheckIcon />
            <span className="text-sm text-gray-700 dark:text-slate-300">{feature}</span>
          </div>
        ))}
      </div>

      {isCurrent ? (
        <div className="px-4 py-2.5 text-sm font-medium text-center text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg">
          Your Current Plan
        </div>
      ) : isHigher ? (
        <button
          onClick={() => {}}
          className="w-full px-4 py-2.5 text-sm font-medium text-center text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg transition-colors shadow-sm cursor-default"
        >
          Contact Business Tracker
        </button>
      ) : (
        <div className="px-4 py-2.5 text-sm font-medium text-center text-gray-400 dark:text-slate-500 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
          Lower Plan
        </div>
      )}
    </div>
  )
}

export default function UpgradePlan() {
  const { plan: currentPlan } = usePlanAccess()
  const navigate = useNavigate()

  const planOrder: PlanName[] = ['Starter', 'Business', 'Pro']
  const currentIdx = planOrder.indexOf(currentPlan)

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Choose Your Plan</h1>
        <p className="mt-2 text-gray-500 dark:text-slate-400 max-w-lg mx-auto">
          Unlock more features by upgrading your subscription plan. All plans include core business management tools.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {PLANS.filter((p) => p.id !== 'Platform').map((p) => (
          <PlanCard
            key={p.id}
            planDef={p}
            isCurrent={p.id === currentPlan}
            isHigher={planOrder.indexOf(p.id) > currentIdx}
          />
        ))}
      </div>

      <div className="text-center">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6 max-w-lg mx-auto">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Need Help?</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
            Contact us to subscribe, change plans, or ask any questions about our pricing.
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg transition-colors shadow-sm"
          >
            Contact Business Tracker
          </button>
        </div>
      </div>
    </div>
  )
}
