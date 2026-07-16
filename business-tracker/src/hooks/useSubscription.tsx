import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react'
import { doc, onSnapshot, setDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from './useAuth'
import { useAdmin } from './useAdmin'
import type { Subscription } from '../data/subscription'
import { createDefaultSubscription } from '../data/subscription'

interface SubscriptionContextValue {
  subscription: Subscription | null
  loading: boolean
  updateSubscription: (data: Partial<Omit<Subscription, 'ownerId' | 'createdAt' | 'updatedAt' | 'lastLoginAt' | 'createdByVersion'>>) => Promise<void>
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null)

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const uid = user?.uid
  const { isSuperAdmin, loading: adminLoading } = useAdmin()

  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const lastLoginUpdated = useRef(false)

  useEffect(() => {
    lastLoginUpdated.current = false

    if (!uid || adminLoading) {
      if (!adminLoading && !uid) {
        setSubscription(null)
        setLoading(true)
      }
      return
    }

    if (isSuperAdmin) {
      setSubscription(null)
      setLoading(false)
      return
    }

    const subRef = doc(db, 'subscriptions', uid)

    const unsub = onSnapshot(subRef, (snap) => {
      if (snap.exists()) {
        setSubscription({ ...snap.data() } as Subscription)
        setLoading(false)

        if (!lastLoginUpdated.current) {
          lastLoginUpdated.current = true
          updateDoc(subRef, {
            lastLoginAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }).catch(() => {})
        }
      } else {
        const now = new Date()
        const trialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

        lastLoginUpdated.current = true

        setDoc(subRef, {
          ...createDefaultSubscription(uid),
          trialEndsAt: Timestamp.fromDate(trialEnd),
          lastLoginAt: serverTimestamp(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
        setSubscription({
          ...createDefaultSubscription(uid),
          trialEndsAt: Timestamp.fromDate(trialEnd),
          lastLoginAt: null as unknown as Subscription['lastLoginAt'],
          createdAt: null as unknown as Subscription['createdAt'],
          updatedAt: null as unknown as Subscription['updatedAt'],
        })
        setLoading(false)
      }
    })

    return unsub
  }, [uid, isSuperAdmin, adminLoading])

  const updateSubscription = useCallback(async (
    data: Partial<Omit<Subscription, 'ownerId' | 'createdAt' | 'updatedAt' | 'lastLoginAt' | 'createdByVersion'>>
  ) => {
    if (!uid) throw new Error('Not authenticated')
    if (isSuperAdmin) throw new Error('Super admin accounts do not have subscriptions')
    const subRef = doc(db, 'subscriptions', uid)
    await setDoc(subRef, { ...data, updatedAt: serverTimestamp() }, { merge: true })
  }, [uid, isSuperAdmin])

  return (
    <SubscriptionContext.Provider value={{ subscription, loading, updateSubscription }}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext)
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider')
  return ctx
}
