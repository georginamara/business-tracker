import type { Timestamp } from 'firebase/firestore'
import type { PlanName } from './plans'

export type AccountStatus = 'active' | 'suspended' | 'disabled'
export type AccountType = 'business' | 'superadmin'

export interface Subscription {
  ownerId: string
  plan: PlanName
  status: 'trial' | 'active' | 'expired' | 'canceled'
  accountStatus: AccountStatus
  accountType?: AccountType
  trialEndsAt: Timestamp
  subscriptionStartsAt: Timestamp | null
  subscriptionEndsAt: Timestamp | null
  lastLoginAt: Timestamp
  createdByVersion: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type SubscriptionStatus = Subscription['status']

export function getAccountType(sub: Subscription | null | undefined): AccountType {
  return sub?.accountType ?? 'business'
}

export function createDefaultSubscription(uid: string) {
  return {
    ownerId: uid,
    plan: 'Starter' as const,
    status: 'trial' as const,
    accountStatus: 'active' as const,
    accountType: 'business' as const,
    subscriptionStartsAt: null,
    subscriptionEndsAt: null,
    createdByVersion: '1.0.0',
  }
}
