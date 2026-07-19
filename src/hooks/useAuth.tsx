import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  type User,
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

export type UserRole = 'owner' | 'super_admin'

export interface Subscription {
  plan: string
  status: string
  trialStart: unknown | null
  trialEnd: unknown | null
  subscriptionStart: unknown | null
  subscriptionEnd: unknown | null
  billingCycle: string
  autoRenew: boolean
}

export interface UserProfile {
  email: string
  role: UserRole
  status: string
  plan?: string
  businessType?: string
  subscription?: Subscription
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, businessType: string, plan: string) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

function createTrialSubscription(plan: string): Subscription {
  const now = new Date()
  const trialEnd = new Date(now)
  trialEnd.setDate(trialEnd.getDate() + 14)
  return {
    plan,
    status: 'trial',
    trialStart: now.toISOString(),
    trialEnd: trialEnd.toISOString(),
    subscriptionStart: null,
    subscriptionEnd: null,
    billingCycle: 'monthly',
    autoRenew: false,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const snap = await getDoc(doc(db, 'users', firebaseUser.uid))
          if (snap.exists()) {
            const data = snap.data() as UserProfile
            console.log('AUTH PROFILE:', { uid: firebaseUser.uid, profile: data, role: data.role })
            setProfile(data)
          } else {
            console.log('AUTH PROFILE: no document for', firebaseUser.uid)
            setProfile(null)
          }
        } catch (err) {
          console.log('AUTH PROFILE: fetch error', err)
          setProfile(null)
        }
        setUser(firebaseUser)
      } else {
        setProfile(null)
        setUser(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const register = async (email: string, password: string, businessType: string, plan: string) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password)
    await setDoc(doc(db, 'users', credential.user.uid), {
      email,
      businessType,
      role: 'owner',
      plan,
      status: 'active',
      createdAt: serverTimestamp(),
      subscription: createTrialSubscription(plan),
    })
  }

  const logout = async () => {
    await signOut(auth)
  }

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, register, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
