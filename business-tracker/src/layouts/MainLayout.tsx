import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import TopNav from '../components/TopNav'
import { useSubscriptionGuard } from '../hooks/useSubscriptionGuard'

function TrialWarningBanner({
  days,
  onDismiss,
}: {
  days: number
  onDismiss: () => void
}) {
  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 px-4 py-2.5 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-300">
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>
          Your trial expires in {days} day{days !== 1 ? 's' : ''}.
        </span>
      </div>
      <button
        onClick={onDismiss}
        className="p-1 rounded-md text-amber-500 hover:text-amber-700 dark:hover:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-800/40 transition-colors flex-shrink-0"
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { showTrialWarning, trialDaysRemaining, dismissTrialWarning } =
    useSubscriptionGuard()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopNav onMenuClick={() => setSidebarOpen(true)} />

        {showTrialWarning && trialDaysRemaining !== null && (
          <TrialWarningBanner days={trialDaysRemaining} onDismiss={dismissTrialWarning} />
        )}

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
