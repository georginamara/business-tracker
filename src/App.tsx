import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { AdminProvider } from './hooks/useAdmin'
import { BusinessProvider } from './hooks/useBusiness'
import { StoreProvider } from './hooks/useStore'
import MainLayout from './layouts/MainLayout'
import AdminLayout from './layouts/AdminLayout'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Sales from './pages/Sales'
import Expenses from './pages/Expenses'
import Reports from './pages/Reports'
import StoreSettings from './pages/StoreSettings'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminSubscriptions from './pages/admin/AdminSubscriptions'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import AdminAudit from './pages/admin/AdminAudit'

function Spinner() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth()
  console.log('GuestRoute', { loading, user: !!user, role: profile?.role })
  if (loading) return <Spinner />
  if (user) {
    if (profile?.role === 'super_admin') return <Navigate to="/admin" replace />
    return <Navigate to="/dashboard" replace />
  }
  return <>{children}</>
}

function LandingRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  if (user) {
    if (profile?.role === 'super_admin') return <Navigate to="/admin" replace />
    return <Navigate to="/dashboard" replace />
  }
  return <>{children}</>
}

function OwnerRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth()
  console.log('OwnerRoute', profile?.role)
  if (loading) return <Spinner />
  if (!user) return <Navigate to="/login" replace />
  if (profile?.role === 'super_admin') return <Navigate to="/admin" replace />
  return <>{children}</>
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth()
  console.log('AdminRoute', profile?.role)
  if (loading) return <Spinner />
  if (!user) return <Navigate to="/login" replace />
  if (profile?.role !== 'super_admin') return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function AppRoutes() {
    console.log("CURRENT PATH:", window.location.pathname)
  return (
    <Routes>
      <Route index element={<LandingRoute><LandingPage /></LandingRoute>} />

      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
      <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />

      <Route element={<ProtectedRoute><OwnerRoute><MainLayout /></OwnerRoute></ProtectedRoute>}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="sales" element={<Sales />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<StoreSettings />} />
      </Route>

      <Route path="/admin" element={<ProtectedRoute><AdminRoute><AdminProvider><AdminLayout /></AdminProvider></AdminRoute></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="subscriptions" element={<AdminSubscriptions />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="audit" element={<AdminAudit />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <StoreProvider>
          <BusinessProvider>
            <AppRoutes />
          </BusinessProvider>
        </StoreProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
