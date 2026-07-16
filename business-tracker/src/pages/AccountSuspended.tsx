import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function AccountSuspended() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m9.364-7.364A9 9 0 1112 3a9 9 0 017.364 4.636z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Account Suspended</h1>
        <p className="text-gray-600 dark:text-slate-400 mb-6 leading-relaxed">
          Your account has been temporarily suspended. You are unable to access the dashboard until this is resolved.
        </p>
        <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 mb-6 text-sm text-gray-500 dark:text-slate-400">
          <p>If you have questions or believe this was done in error, please contact support.</p>
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
