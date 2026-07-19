import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import {
  collection,
  doc,
  getDocs,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from './useAuth'

export interface OwnerSubscription {
  plan: string
  status: string
  trialStart: unknown | null
  trialEnd: unknown | null
  subscriptionStart: unknown | null
  subscriptionEnd: unknown | null
  billingCycle: string
  autoRenew: boolean
}

export interface OwnerUser {
  uid: string
  email: string
  businessType: string
  plan: string
  status: string
  createdAt: unknown
  subscription?: OwnerSubscription
}

export interface AuditLogEntry {
  id: string
  action: string
  targetUserId: string
  targetEmail: string
  adminId: string
  timestamp: unknown
}

function toDate(val: unknown): Date | null {
  if (!val) return null
  if (val instanceof Date) return val
  if (typeof val === 'string') return new Date(val)
  if (typeof val === 'object' && val !== null && 'toDate' in val) {
    return (val as { toDate: () => Date }).toDate()
  }
  return null
}

function evaluateSubscriptionStatus(sub: OwnerSubscription | undefined): OwnerSubscription | undefined {
  if (!sub) return sub
  const now = new Date()
  if (sub.status === 'cancelled') return sub
  if (sub.status === 'trial' && sub.trialEnd) {
    const end = toDate(sub.trialEnd)
    if (end && now > end) return { ...sub, status: 'expired' }
  }
  if (sub.status === 'active' && sub.subscriptionEnd) {
    const end = toDate(sub.subscriptionEnd)
    if (end && now > end) return { ...sub, status: 'expired' }
  }
  return sub
}

function computeDaysRemaining(sub: OwnerSubscription | undefined): number {
  if (!sub) return 0
  const now = new Date()
  if (sub.status === 'active' && sub.subscriptionEnd) {
    const end = toDate(sub.subscriptionEnd)
    if (end) return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86400000))
  }
  if (sub.status === 'trial' && sub.trialEnd) {
    const end = toDate(sub.trialEnd)
    if (end) return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86400000))
  }
  return 0
}

interface AdminContextValue {
  owners: OwnerUser[]
  auditLogs: AuditLogEntry[]
  loading: boolean
  refresh: () => Promise<void>
  suspendUser: (uid: string) => Promise<void>
  activateUser: (uid: string) => Promise<void>
  deleteUser: (uid: string) => Promise<void>
  updatePlan: (uid: string, plan: string) => Promise<void>
  activateSubscription: (uid: string, billingCycle: string) => Promise<void>
  extendTrial: (uid: string, days: number) => Promise<void>
  renewSubscription: (uid: string, days: number) => Promise<void>
  expireSubscription: (uid: string) => Promise<void>
  cancelSubscription: (uid: string) => Promise<void>
  logAudit: (action: string, targetUserId: string, targetEmail: string) => Promise<void>
}

const AdminContext = createContext<AdminContextValue | null>(null)

export function AdminProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth()
  const [owners, setOwners] = useState<OwnerUser[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOwners = useCallback(async () => {
    console.log('[AdminDebug] fetchOwners START', {
      collection: 'users',
      filters: "where('role', '==', 'owner')",
      uid: user?.uid ?? 'NONE',
      email: user?.email ?? 'NONE',
      role: profile?.role ?? 'NONE',
    })
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'owner'))
      const snap = await getDocs(q)
      console.log('[AdminDebug] fetchOwners SUCCESS', {
        collection: 'users',
        docCount: snap.docs.length,
      })
      const data = snap.docs.map((d) => {
        const raw = { uid: d.id, ...d.data() } as OwnerUser
        const evaluated = evaluateSubscriptionStatus(raw.subscription)
        if (evaluated && evaluated !== raw.subscription) {
          raw.subscription = evaluated
        }
        return raw
      })
      console.log(
        '[AdminDebug] USERS JSON:\n' +
        JSON.stringify(data, null, 2)
      )
      data.sort((a, b) => {
        const aTime = (a.createdAt as { toDate?: () => Date })?.toDate?.()?.getTime() ?? 0
        const bTime = (b.createdAt as { toDate?: () => Date })?.toDate?.()?.getTime() ?? 0
        return bTime - aTime
      })
      setOwners(data)
    } catch (error) {
      console.error('[AdminDebug] fetchOwners FAILED:', {
        collection: 'users',
        filters: "where('role', '==', 'owner')",
        error,
      })
      throw error
    }
  }, [user?.uid, user?.email, profile?.role])

  const fetchAuditLogs = useCallback(async () => {
    console.log('[AdminDebug] fetchAuditLogs START', {
      collection: 'audit_logs',
      filters: "orderBy('timestamp', 'desc'), limit(50)",
      uid: user?.uid ?? 'NONE',
      email: user?.email ?? 'NONE',
      role: profile?.role ?? 'NONE',
    })
    try {
      const q = query(
        collection(db, 'audit_logs'),
        orderBy('timestamp', 'desc'),
        firestoreLimit(50)
      )
      const snap = await getDocs(q)
      console.log('[AdminDebug] fetchAuditLogs SUCCESS', {
        collection: 'audit_logs',
        docCount: snap.docs.length,
      })
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as AuditLogEntry))
      setAuditLogs(data)
    } catch (error) {
      console.error('[AdminDebug] fetchAuditLogs FAILED:', {
        collection: 'audit_logs',
        filters: "orderBy('timestamp', 'desc'), limit(50)",
        error,
      })
      throw error
    }
  }, [user?.uid, user?.email, profile?.role])

  const refresh = useCallback(async () => {
    console.log('[AdminDebug] refresh START', {
      uid: user?.uid ?? 'NONE',
      email: user?.email ?? 'NONE',
      role: profile?.role ?? 'NONE',
    })
    setLoading(true)
    try {
      await fetchOwners()
    } catch (error) {
      console.error('[AdminDebug] refresh FAILED:', { error })
    } finally {
      setLoading(false)
      console.log('[AdminDebug] refresh END')
    }
  }, [fetchOwners, fetchAuditLogs, user?.uid, user?.email, profile?.role])

  useEffect(() => {
    if (user) {
      refresh()
    }
  }, [user, refresh])

  const logAudit = useCallback(async (action: string, targetUserId: string, targetEmail: string) => {
    try {
      await addDoc(collection(db, 'audit_logs'), {
        action,
        targetUserId,
        targetEmail,
        adminId: user?.uid ?? '',
        timestamp: serverTimestamp(),
      })
      await fetchAuditLogs()
    } catch (error) {
      console.error('[AdminDebug] logAudit FAILED:', { error })
      throw error
    }
  }, [user, fetchAuditLogs])

  const suspendUser = useCallback(async (uid: string) => {
    const owner = owners.find((o) => o.uid === uid)
    if (!owner || owner.email === user?.email) return
    try {
      await updateDoc(doc(db, 'users', uid), { status: 'suspended' })
      await logAudit('Suspend Business', uid, owner.email)
      await fetchOwners()
    } catch (error) {
      console.error('[AdminDebug] suspendUser FAILED:', { error })
      throw error
    }
  }, [owners, user, logAudit, fetchOwners])

  const activateUser = useCallback(async (uid: string) => {
    const owner = owners.find((o) => o.uid === uid)
    if (!owner || owner.email === user?.email) return
    try {
      await updateDoc(doc(db, 'users', uid), { status: 'active' })
      await logAudit('Activate Business', uid, owner.email)
      await fetchOwners()
    } catch (error) {
      console.error('[AdminDebug] activateUser FAILED:', { error })
      throw error
    }
  }, [owners, user, logAudit, fetchOwners])

  const removeUser = useCallback(async (uid: string) => {
    const owner = owners.find((o) => o.uid === uid)
    if (!owner || owner.email === user?.email) return
    try {
      await logAudit('Delete Business', uid, owner.email)
      await deleteDoc(doc(db, 'users', uid))
      await fetchOwners()
    } catch (error) {
      console.error('[AdminDebug] removeUser FAILED:', { error })
      throw error
    }
  }, [owners, user, logAudit, fetchOwners])

  const updatePlan = useCallback(async (uid: string, plan: string) => {
    const owner = owners.find((o) => o.uid === uid)
    if (!owner || owner.email === user?.email) return
    try {
      await updateDoc(doc(db, 'users', uid), { plan, 'subscription.plan': plan })
      await logAudit(`Change Plan to ${plan}`, uid, owner.email)
      await fetchOwners()
    } catch (error) {
      console.error('[AdminDebug] updatePlan FAILED:', { error })
      throw error
    }
  }, [owners, user, logAudit, fetchOwners])

  const activateSubscription = useCallback(async (uid: string, billingCycle: string) => {
    const owner = owners.find((o) => o.uid === uid)
    if (!owner) return
    const now = new Date()
    const durationDays = billingCycle === 'yearly' ? 365 : billingCycle === 'quarterly' ? 90 : 30
    const endDate = new Date(now)
    endDate.setDate(endDate.getDate() + durationDays)
    const plan = owner.subscription?.plan || owner.plan || 'Starter'
    try {
      await updateDoc(doc(db, 'users', uid), {
        status: 'active',
        plan,
        subscription: {
          plan,
          status: 'active',
          trialStart: owner.subscription?.trialStart ?? null,
          trialEnd: owner.subscription?.trialEnd ?? null,
          subscriptionStart: now.toISOString(),
          subscriptionEnd: endDate.toISOString(),
          billingCycle,
          autoRenew: false,
        },
      })
      await logAudit(`Activate Subscription (${billingCycle})`, uid, owner.email)
      await fetchOwners()
    } catch (error) {
      console.error('[AdminDebug] activateSubscription FAILED:', { error })
      throw error
    }
  }, [owners, logAudit, fetchOwners])

  const extendTrial = useCallback(async (uid: string, days: number) => {
    const owner = owners.find((o) => o.uid === uid)
    if (!owner) return
    const currentEnd = toDate(owner.subscription?.trialEnd) || new Date()
    const newEnd = new Date(currentEnd)
    newEnd.setDate(newEnd.getDate() + days)
    try {
      await updateDoc(doc(db, 'users', uid), {
        'subscription.trialEnd': newEnd.toISOString(),
        'subscription.status': 'trial',
      })
      await logAudit(`Extend Trial (${days} days)`, uid, owner.email)
      await fetchOwners()
    } catch (error) {
      console.error('[AdminDebug] extendTrial FAILED:', { error })
      throw error
    }
  }, [owners, logAudit, fetchOwners])

  const renewSubscription = useCallback(async (uid: string, days: number) => {
    const owner = owners.find((o) => o.uid === uid)
    if (!owner) return
    const currentEnd = toDate(owner.subscription?.subscriptionEnd) || new Date()
    const newEnd = new Date(currentEnd)
    newEnd.setDate(newEnd.getDate() + days)
    const plan = owner.subscription?.plan || owner.plan || 'Starter'
    try {
      await updateDoc(doc(db, 'users', uid), {
        status: 'active',
        'subscription.status': 'active',
        'subscription.subscriptionEnd': newEnd.toISOString(),
        'subscription.plan': plan,
      })
      await logAudit(`Renew Subscription (+${days} days)`, uid, owner.email)
      await fetchOwners()
    } catch (error) {
      console.error('[AdminDebug] renewSubscription FAILED:', { error })
      throw error
    }
  }, [owners, logAudit, fetchOwners])

  const expireSubscription = useCallback(async (uid: string) => {
    const owner = owners.find((o) => o.uid === uid)
    if (!owner) return
    try {
      await updateDoc(doc(db, 'users', uid), {
        'subscription.status': 'expired',
      })
      await logAudit('Expire Subscription', uid, owner.email)
      await fetchOwners()
    } catch (error) {
      console.error('[AdminDebug] expireSubscription FAILED:', { error })
      throw error
    }
  }, [owners, logAudit, fetchOwners])

  const cancelSubscription = useCallback(async (uid: string) => {
    const owner = owners.find((o) => o.uid === uid)
    if (!owner) return
    try {
      await updateDoc(doc(db, 'users', uid), {
        'subscription.status': 'cancelled',
      })
      await logAudit('Cancel Subscription', uid, owner.email)
      await fetchOwners()
    } catch (error) {
      console.error('[AdminDebug] cancelSubscription FAILED:', { error })
      throw error
    }
  }, [owners, logAudit, fetchOwners])

  return (
    <AdminContext.Provider
      value={{
        owners,
        auditLogs,
        loading,
        refresh,
        suspendUser,
        activateUser,
        deleteUser: removeUser,
        updatePlan,
        activateSubscription,
        extendTrial,
        renewSubscription,
        expireSubscription,
        cancelSubscription,
        logAudit,
      }}
    >
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider')
  return ctx
}

export { toDate, computeDaysRemaining }
