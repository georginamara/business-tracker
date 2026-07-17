import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AdminProvider, useAdmin } from './hooks/useAdmin'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { BusinessProvider } from './hooks/useBusiness'
import { StoreProvider } from './hooks/useStore'
import { SubscriptionProvider } from './hooks/useSubscription'
import { ThemeProvider } from './hooks/useTheme'
import { usePlanAccess, type PermissionKey } from './hooks/usePlanAccess'
import MainLayout from './layouts/MainLayout'
import AdminLayout from './layouts/AdminLayout'
import AdminHome from './pages/AdminHome'
import AdminDashboard from './pages/AdminDashboard'
import AdminAuditLogs from './pages/AdminAuditLogs'
import AdminAnalytics from './pages/AdminAnalytics'
import AdminSubscriptions from './pages/AdminSubscriptions'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import POS from './pages/POS'
import Sales from './pages/Sales'
import InventoryHistory from './pages/InventoryHistory'
import Expenses from './pages/Expenses'
import Credits from './pages/Credits'
import Reports from './pages/Reports'
import StoreSettings from './pages/StoreSettings'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import SubscriptionExpired from './pages/SubscriptionExpired'
import AccountSuspended from './pages/AccountSuspended'
import AccountDisabled from './pages/AccountDisabled'
import AboutPage from './pages/AboutPage'
import Subscription from './pages/Subscription'
import UpgradePlan from './pages/UpgradePlan'
import LandingPage from './pages/LandingPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const { isSuperAdmin, loading: adminLoading } = useAdmin()

  if (loading || adminLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (user) return <Navigate to={isSuperAdmin ? '/admin' : '/dashboard'} replace />
  return <>{children}</>
}

function SuperAdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const { isSuperAdmin, loading: adminLoading } = useAdmin()

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (!isSuperAdmin) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function BusinessOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const { isSuperAdmin, loading: adminLoading } = useAdmin()

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (isSuperAdmin) return <Navigate to="/admin" replace />
  return <>{children}</>
}

function PlanGuardRoute({ feature, children }: { feature: PermissionKey; children: React.ReactNode }) {
  const { hasAccess } = usePlanAccess()

  if (!hasAccess(feature)) {
    return <Navigate to="/upgrade" replace />
  }

  return <>{children}</>
}

function LandingRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const { isSuperAdmin, loading: adminLoading } = useAdmin()

  if (loading || adminLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (user) return <Navigate to={isSuperAdmin ? '/admin' : '/dashboard'} replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
      <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
      <Route path="/subscription-expired" element={<ProtectedRoute><SubscriptionExpired /></ProtectedRoute>} />
      <Route path="/account-suspended" element={<ProtectedRoute><AccountSuspended /></ProtectedRoute>} />
      <Route path="/account-disabled" element={<ProtectedRoute><AccountDisabled /></ProtectedRoute>} />

      <Route index element={<LandingRoute><LandingPage /></LandingRoute>} />

      <Route element={<ProtectedRoute><BusinessOnlyRoute><MainLayout /></BusinessOnlyRoute></ProtectedRoute>}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="upgrade" element={<UpgradePlan />} />
        <Route path="pos" element={<POS />} />
        <Route path="products" element={<Products />} />
        <Route path="sales" element={<Sales />} />
        <Route path="inventory" element={<PlanGuardRoute feature="inventory"><InventoryHistory /></PlanGuardRoute>} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="credits" element={<PlanGuardRoute feature="credits"><Credits /></PlanGuardRoute>} />
        <Route path="reports" element={<PlanGuardRoute feature="reports"><Reports /></PlanGuardRoute>} />
        <Route path="settings" element={<StoreSettings />} />
        <Route path="subscription" element={<Subscription />} />
        <Route path="about" element={<AboutPage />} />
      </Route>

      <Route path="/admin" element={<ProtectedRoute><SuperAdminRoute><AdminLayout /></SuperAdminRoute></ProtectedRoute>}>
        <Route index element={<AdminHome />} />
        <Route path="stores" element={<AdminDashboard />} />
        <Route path="subscriptions" element={<AdminSubscriptions />} />
        <Route path="audit-logs" element={<AdminAuditLogs />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="about" element={<AboutPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AdminProvider>
            <SubscriptionProvider>
              <StoreProvider>
                <BusinessProvider>
                  <AppRoutes />
                </BusinessProvider>
              </StoreProvider>
            </SubscriptionProvider>
          </AdminProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
