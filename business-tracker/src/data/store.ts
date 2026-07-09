import type { Timestamp } from 'firebase/firestore'

export interface Store {
  ownerId: string
  storeName: string
  ownerName: string
  phone: string
  email: string
  address: string
  currency: string
  lowStockThreshold: number
  createdAt: Timestamp
  updatedAt: Timestamp
}

export const DEFAULT_STORE = (uid: string, email: string): Omit<Store, 'createdAt' | 'updatedAt'> => ({
  ownerId: uid,
  storeName: 'My Store',
  ownerName: '',
  phone: '',
  email,
  address: '',
  currency: 'PHP',
  lowStockThreshold: 5,
})
