import type { Timestamp } from 'firebase/firestore'

export type AccountStatus = 'active' | 'suspended' | 'disabled'

export interface Subscription {
  ownerId: string
  plan: string
  status: 'trial' | 'active' | 'expired' | 'canceled'
  accountStatus: AccountStatus
  trialEndsAt: Timestamp
  subscriptionStartsAt: Timestamp | null
  subscriptionEndsAt: Timestamp | null
  lastLoginAt: Timestamp
  createdByVersion: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type SubscriptionStatus = Subscription['status']

export function createDefaultSubscription(uid: string) {
  return {
    ownerId: uid,
    plan: 'Starter' as const,
    status: 'trial' as const,
    accountStatus: 'active' as const,
    subscriptionStartsAt: null,
    subscriptionEndsAt: null,
    createdByVersion: '1.0.0',
  }
}
