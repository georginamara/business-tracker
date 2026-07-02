import { useLocation } from 'react-router-dom'

interface TopNavProps {
  onMenuClick: () => void
}

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/products': 'Products',
  '/sales': 'Sales',
  '/expenses': 'Expenses',
}

export default function TopNav({ onMenuClick }: TopNavProps) {
  const location = useLocation()
  const title = pageTitles[location.pathname] || 'Business Tracker'

  return (
    <header className="h-16 bg-white border-b border-gray-200 shadow-sm flex items-center px-4 lg:px-6 gap-4">
      <button
        type="button"
        className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        onClick={onMenuClick}
        aria-label="Toggle sidebar"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="hidden lg:flex items-center gap-2 text-sm text-gray-500">
        <span>Business Tracker</span>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-900 font-medium">{title}</span>
      </div>

      <h1 className="lg:hidden text-lg font-semibold text-gray-900">{title}</h1>

      <div className="hidden lg:flex items-center gap-3 ml-auto">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-xs font-semibold text-white shadow-sm">
          U
        </div>
      </div>
    </header>
  )
}
