import { useState, useMemo } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useAdmin, toDate } from '../hooks/useAdmin'
import {
  LayoutDashboard,
  Users,
  CreditCard,
  BarChart3,
  ClipboardList,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Shield,
  Bell,
} from 'lucide-react'

interface NavItem {
  to: string
  label: string
  icon: React.ReactNode
  end?: boolean
}

interface NavGroup {
  title: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    title: 'Administration',
    items: [
      { to: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={18} />, end: true },
      { to: '/admin/users', label: 'Manage Stores', icon: <Users size={18} /> },
      { to: '/admin/subscriptions', label: 'Subscriptions', icon: <CreditCard size={18} /> },
    ],
  },
  {
    title: 'Monitoring',
    items: [
      { to: '/admin/analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
      { to: '/admin/audit', label: 'Audit Logs', icon: <ClipboardList size={18} /> },
    ],
  },
]

const pageTitles: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/users': 'Manage Stores',
  '/admin/subscriptions': 'Subscriptions',
  '/admin/analytics': 'Analytics',
  '/admin/audit': 'Audit Logs',
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { logout, user } = useAuth()
  const { owners } = useAdmin()
  const location = useLocation()
  const title = pageTitles[location.pathname] || 'Admin'

  const notificationCount = useMemo(() => {
    const now = new Date()
    let count = 0
    owners.forEach((o) => {
      const sub = o.subscription
      if (!sub) return
      if (sub.status === 'trial' && sub.trialEnd) {
        const end = toDate(sub.trialEnd)
        if (end) {
          const days = Math.ceil((end.getTime() - now.getTime()) / 86400000)
          if (days <= 3) count++
        }
      }
      if (sub.status === 'active' && sub.subscriptionEnd) {
        const end = toDate(sub.subscriptionEnd)
        if (end) {
          const days = Math.ceil((end.getTime() - now.getTime()) / 86400000)
          if (days <= 7) count++
        }
      }
      if (sub.status === 'expired') count++
    })
    return count
  }, [owners])

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-700/50 flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-700/50 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-emerald-500/20">
            G
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white tracking-tight">GeoDesk</span>
            <span className="text-[10px] text-slate-400 leading-tight">Super Admin Panel</span>
          </div>
          <button
            type="button"
            className="ml-auto lg:hidden text-slate-400 hover:text-white transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {navGroups.map((group) => (
            <div key={group.title}>
              <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                {group.title}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-400 shadow-sm'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span className={`transition-colors ${isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                          {item.icon}
                        </span>
                        {item.label}
                        {isActive && (
                          <ChevronRight size={14} className="ml-auto text-emerald-400/60" />
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-700/50 shrink-0">
          <div className="px-3 py-2 mb-2">
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={() => { logout(); setSidebarOpen(false) }}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-all duration-200"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-slate-800/80 backdrop-blur-md border-b border-slate-700/50 flex items-center px-4 lg:px-6 gap-4 sticky top-0 z-30">
          <button
            type="button"
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
            onClick={() => setSidebarOpen(true)}
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>

          <div className="hidden lg:flex items-center gap-2 text-sm">
            <Shield size={14} className="text-emerald-400" />
            <span className="text-slate-500">GeoDesk</span>
            <ChevronRight size={12} className="text-slate-600" />
            <span className="text-white font-medium">{title}</span>
          </div>

          <h1 className="lg:hidden text-lg font-semibold text-white">{title}</h1>

          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              className="p-2 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white transition-colors relative"
            >
              <Bell size={18} />
              {notificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[9px] font-bold text-white bg-red-500 rounded-full">
                  {notificationCount > 99 ? '99+' : notificationCount}
                </span>
              )}
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-emerald-500/20">
              SA
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
