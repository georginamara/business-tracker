import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from './useAuth'
import type { Store } from '../data/store'
import { DEFAULT_STORE } from '../data/store'

interface StoreContextValue {
  store: Store | null
  loading: boolean
  updateStore: (data: Partial<Omit<Store, 'ownerId' | 'createdAt' | 'updatedAt'>>) => Promise<void>
}

const StoreContext = createContext<StoreContextValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth()
  const uid = user?.uid
  const email = user?.email || ''

  const [store, setStore] = useState<Store | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile?.role === 'super_admin') {
      setStore(null)
      setLoading(false)
      return
    }

    if (!uid) {
      setStore(null)
      setLoading(true)
      return
    }

    const storeRef = doc(db, 'stores', uid)

    const unsub = onSnapshot(storeRef, (snap) => {
      if (snap.exists()) {
        setStore({ ...snap.data() } as Store)
        setLoading(false)
      } else {
        setDoc(storeRef, {
          ...DEFAULT_STORE(uid, email),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
        setStore({
          ...DEFAULT_STORE(uid, email),
          createdAt: null as unknown as Store['createdAt'],
          updatedAt: null as unknown as Store['updatedAt'],
        })
        setLoading(false)
      }
    })

    return unsub
  }, [uid, email, profile])

  const updateStore = useCallback(async (data: Partial<Omit<Store, 'ownerId' | 'createdAt' | 'updatedAt'>>) => {
    if (!uid) throw new Error('Not authenticated')
    const storeRef = doc(db, 'stores', uid)
    await setDoc(storeRef, { ...data, updatedAt: serverTimestamp() }, { merge: true })
  }, [uid])

  return (
    <StoreContext.Provider value={{ store, loading, updateStore }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
