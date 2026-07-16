import type { Timestamp } from 'firebase/firestore'

export type BusinessType =
  | 'Sari-sari Store'
  | 'Food & Beverage'
  | 'Restaurant'
  | 'Café / Milk Tea'
  | 'Bakery'
  | 'Grocery'
  | 'Pharmacy'
  | 'Hardware'
  | 'Clothing'
  | 'Electronics'
  | 'Services'
  | 'Others'

export const BUSINESS_TYPES: BusinessType[] = [
  'Sari-sari Store',
  'Food & Beverage',
  'Restaurant',
  'Café / Milk Tea',
  'Bakery',
  'Grocery',
  'Pharmacy',
  'Hardware',
  'Clothing',
  'Electronics',
  'Services',
  'Others',
]

export interface Store {
  ownerId: string
  storeName: string
  ownerName: string
  phone: string
  email: string
  address: string
  currency: string
  lowStockThreshold: number
  businessType: BusinessType
  createdAt: Timestamp
  updatedAt: Timestamp
}

export const DEFAULT_STORE = (uid: string, email: string, businessType: BusinessType = 'Sari-sari Store'): Omit<Store, 'createdAt' | 'updatedAt'> => ({
  ownerId: uid,
  storeName: 'My Store',
  ownerName: '',
  phone: '',
  email,
  address: '',
  currency: 'PHP',
  lowStockThreshold: 5,
  businessType,
})
