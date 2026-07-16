import { useState, useRef, useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'

const adminNavSections = [
  {
    label: 'ADMINISTRATION',
    items: [
      {
        to: '/admin',
        label: 'Dashboard',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        ),
      },
      {
        to: '/admin/stores',
        label: 'Stores',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        ),
      },
      {
        to: '/admin/subscriptions',
        label: 'Subscriptions',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'MONITORING',
    items: [
      {
        to: '/admin/audit-logs',
        label: 'Audit Logs',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
      },
      {
        to: '/admin/analytics',
        label: 'Platform Analytics',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      {
        to: '/admin/settings',
        label: 'Settings',
        disabled: true,
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        ),
      },
      {
        to: '/admin/about',
        label: 'About',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
    ],
  },
]

const adminPageTitles: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/stores': 'Stores',
  '/admin/subscriptions': 'Subscriptions',
  '/admin/audit-logs': 'Audit Logs',
  '/admin/analytics': 'Platform Analytics',
  '/admin/settings': 'Settings',
  '/admin/about': 'About',
}

function AdminSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { logout, user } = useAuth()

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 border-r border-slate-700
          transform transition-all duration-300 ease-in-out
          lg:relative lg:translate-x-0
          ${open ? 'translate-x-0 shadow-xl' : '-translate-x-full shadow-none'}
        `}
      >
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-700">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
            A
          </div>
          <div className="flex flex-col">
            <span className="text-base font-semibold text-white leading-tight">Business Tracker</span>
            <span className="text-[10px] font-medium text-red-400 uppercase tracking-wider">Admin Portal</span>
          </div>
        </div>

        <div className="flex flex-col h-[calc(100%-4rem)]">
          <nav className="flex-1 p-4 space-y-5 overflow-y-auto">
            {adminNavSections.map((section) => (
              <div key={section.label}>
                <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {section.label}
                </p>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/admin'}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                          item.disabled
                            ? 'text-slate-600 cursor-not-allowed opacity-50'
                            : isActive
                            ? 'bg-red-900/30 text-red-300'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && !item.disabled && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-red-500 rounded-r-full" />
                          )}
                          <span className={`shrink-0 ${isActive && !item.disabled ? 'text-red-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                            {item.icon}
                          </span>
                          {item.label}
                          {item.disabled && (
                            <span className="ml-auto text-[9px] font-medium text-slate-600 bg-slate-800 px-1.5 py-0.5 rounded">
                              Soon
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-700">
            <div className="flex items-center gap-3 px-3 py-2 text-sm text-slate-400 truncate">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-[10px] font-semibold text-white shrink-0">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="truncate">{user?.email}</span>
            </div>
            <button
              type="button"
              onClick={logout}
              className="mt-1 w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-900/20 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

function AdminTopNav({ onMenuClick }: { onMenuClick: () => void }) {
  const location = useLocation()
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const title = adminPageTitles[location.pathname] || 'Admin Portal'

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
    <header className="h-16 bg-slate-900 border-b border-slate-700 shadow-sm flex items-center px-4 lg:px-6 gap-4">
      <button
        type="button"
        className="lg:hidden p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
        onClick={onMenuClick}
        aria-label="Toggle sidebar"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="hidden lg:flex items-center gap-2 text-sm text-slate-400">
        <span className="text-red-400 font-medium">Admin Portal</span>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-white font-medium">{title}</span>
      </div>

      <h1 className="lg:hidden text-lg font-semibold text-white">{title}</h1>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          aria-label="Toggle theme"
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          )}
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-xs font-semibold text-white shadow-sm hover:shadow-md transition-shadow"
          >
            {initial}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 py-1 z-40 animate-fade-in">
              <div className="px-4 py-2 text-sm text-gray-500 dark:text-slate-400 border-b border-gray-100 dark:border-slate-700 truncate">
                {user?.email}
              </div>
              <button
                type="button"
                onClick={logout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopNav onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
