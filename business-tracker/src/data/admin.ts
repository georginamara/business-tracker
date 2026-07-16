import type { Timestamp } from 'firebase/firestore'
import type { BusinessType } from './store'

export type AdminRole = 'admin' | 'superadmin'

export interface Admin {
  role: AdminRole
  permissions: string[]
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface AdminStoreRow {
  uid: string
  storeName: string
  businessType: BusinessType
  plan: string
  subscriptionStatus: string
  accountStatus: string
  trialEndsAt: Timestamp | null
  subscriptionEndsAt: Timestamp | null
  lastLoginAt: Timestamp | null
  createdAt: Timestamp | null
}

export interface AdminDashboardStats {
  platformAccount: number
  registeredStores: number
  trialAccounts: number
  activeSubscriptions: number
  expiredSubscriptions: number
  disabledAccounts: number
}
