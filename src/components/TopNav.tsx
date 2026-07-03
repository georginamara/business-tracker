import { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

interface TopNavProps {
  onMenuClick: () => void
}

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/products': 'Products',
  '/sales': 'Sales',
  '/expenses': 'Expenses',
  '/reports': 'Reports',
  '/settings': 'Settings',
}

export default function TopNav({ onMenuClick }: TopNavProps) {
  const location = useLocation()
  const { user, logout } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const title = pageTitles[location.pathname] || 'Business Tracker'

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const initial = user?.email?.charAt(0).toUpperCase() || 'U'

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

      <div className="ml-auto relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-xs font-semibold text-white shadow-sm hover:shadow-md transition-shadow"
        >
          {initial}
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-40 animate-fade-in">
            <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100 truncate">
              {user?.email}
            </div>
            <button
              type="button"
              onClick={logout}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
