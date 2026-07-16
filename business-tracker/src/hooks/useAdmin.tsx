import { createContext, useContext, useEffect, useState, useMemo, type ReactNode } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from './useAuth'
import type { Admin } from '../data/admin'

interface AdminContextValue {
  admin: Admin | null
  isAdmin: boolean
  isSuperAdmin: boolean
  permissions: string[]
  loading: boolean
}

const AdminContext = createContext<AdminContextValue | null>(null)

export function AdminProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const uid = user?.uid

  const [admin, setAdmin] = useState<Admin | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) {
      setAdmin(null)
      setLoading(false)
      return
    }

    const adminRef = doc(db, 'admins', uid)

    const unsub = onSnapshot(adminRef, (snap) => {
      if (snap.exists()) {
        setAdmin({ ...snap.data() } as Admin)
      } else {
        setAdmin(null)
      }
      setLoading(false)
    })

    return unsub
  }, [uid])

  const isAdmin = admin !== null
  const isSuperAdmin = admin?.role === 'superadmin'
  const permissions = useMemo(() => admin?.permissions ?? [], [admin])

  return (
    <AdminContext.Provider value={{ admin, isAdmin, isSuperAdmin, permissions, loading }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider')
  return ctx
}
