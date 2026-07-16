import { useEffect, useState, useCallback } from 'react'
import { collection, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from './useAuth'
import { useAdmin } from './useAdmin'
import type { Store } from '../data/store'
import type { Subscription } from '../data/subscription'
import type { AdminStoreRow, AdminDashboardStats } from '../data/admin'

export function useAdminDashboard() {
  const { user } = useAuth()
  const { isSuperAdmin } = useAdmin()
  const uid = user?.uid

  const [stores, setStores] = useState<AdminStoreRow[]>([])
  const [stats, setStats] = useState<AdminDashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!isSuperAdmin) return

    setLoading(true)
    setError(null)

    try {
      let storesSnap: Awaited<ReturnType<typeof getDocs>>
      let subsSnap: Awaited<ReturnType<typeof getDocs>>

      try {
        storesSnap = await getDocs(collection(db, 'stores'))
      } catch (err) {
        console.error('[useAdminDashboard] getDocs stores failed:', err)
        throw err
      }

      try {
        subsSnap = await getDocs(collection(db, 'subscriptions'))
      } catch (err) {
        console.error('[useAdminDashboard] getDocs subscriptions failed:', err)
        throw err
      }

      const subsMap = new Map<string, Subscription>()
      subsSnap.forEach((doc) => {
        subsMap.set(doc.id, doc.data() as Subscription)
      })

      const rows: AdminStoreRow[] = []
      storesSnap.forEach((doc) => {
        if (doc.id === uid) return
        const store = doc.data() as Store
        const sub = subsMap.get(doc.id)
        rows.push({
          uid: doc.id,
          storeName: store.storeName,
          businessType: store.businessType || 'Sari-sari Store',
          plan: sub?.plan ?? '—',
          subscriptionStatus: sub?.status ?? '—',
          accountStatus: sub?.accountStatus ?? '—',
          trialEndsAt: sub?.trialEndsAt ?? null,
          subscriptionEndsAt: sub?.subscriptionEndsAt ?? null,
          lastLoginAt: sub?.lastLoginAt ?? null,
          createdAt: store.createdAt ?? null,
        })
      })

      const subscriptions = subsSnap.docs
        .filter((d) => d.id !== uid)
        .map((d) => d.data() as Subscription)

      setStores(rows)
      setStats({
        platformAccount: isSuperAdmin ? 1 : 0,
        registeredStores: rows.length,
        trialAccounts: subscriptions.filter((s) => s.status === 'trial').length,
        activeSubscriptions: subscriptions.filter((s) => s.status === 'active').length,
        expiredSubscriptions: subscriptions.filter((s) => s.status === 'expired').length,
        disabledAccounts: subscriptions.filter((s) => s.accountStatus === 'disabled').length,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [isSuperAdmin, uid])

  const updateSubscription = useCallback(
    async (
      ownerUid: string,
      data: Pick<Subscription, 'plan' | 'status' | 'accountStatus' | 'trialEndsAt' | 'subscriptionEndsAt'>
    ) => {
      try {
        await updateDoc(doc(db, 'subscriptions', ownerUid), {
          ...data,
          updatedAt: serverTimestamp(),
        })
      } catch (err) {
        console.error('[useAdminDashboard] updateDoc subscriptions failed:', err)
        throw err
      }
    },
    []
  )

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { stores, stats, loading, error, refetch: fetchData, updateSubscription }
}
