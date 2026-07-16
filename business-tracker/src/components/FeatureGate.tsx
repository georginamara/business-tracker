import { useNavigate } from 'react-router-dom'
import { usePlanAccess, type PermissionKey } from '../hooks/usePlanAccess'
import { getMinPlanForFeature } from '../data/plans'

interface FeatureGateProps {
  feature: PermissionKey
  children: React.ReactNode
  fallback?: React.ReactNode
}

function DefaultLockedFallback({ feature }: { feature: PermissionKey }) {
  const navigate = useNavigate()
  const requiredPlan = getMinPlanForFeature(feature)

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-8">
      <div className="flex flex-col items-center text-center max-w-sm mx-auto">
        <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4">
          <svg className="w-7 h-7 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Upgrade Required
        </h3>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-5">
          This feature is available on the{' '}
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
            {requiredPlan} Plan
          </span>{' '}
          or higher.
        </p>
        <button
          onClick={() => navigate('/upgrade')}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          View Plans
        </button>
      </div>
    </div>
  )
}

export default function FeatureGate({ feature, children, fallback }: FeatureGateProps) {
  const { hasAccess } = usePlanAccess()

  if (hasAccess(feature)) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  return <DefaultLockedFallback feature={feature} />
}
