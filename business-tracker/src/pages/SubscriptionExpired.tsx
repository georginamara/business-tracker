import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function SubscriptionExpired() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Subscription Expired</h1>
        <p className="text-gray-600 dark:text-slate-400 mb-6 leading-relaxed">
          Your subscription has ended. To regain access to your store and all features, please renew your plan.
        </p>
        <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 mb-6 text-sm text-gray-500 dark:text-slate-400">
          <p>If you believe this is an error, please contact support for assistance.</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg transition-colors shadow-sm"
        >
          Back to Login
        </button>
      </div>
    </div>
  )
}
