import type { Timestamp } from 'firebase/firestore'
import type { SaleItem } from './sales'

export interface Credit {
  id: string
  ownerId: string
  customerName: string
  contactNumber?: string
  saleId: string
  items: SaleItem[]
  totalAmount: number
  amountPaid: number
  remainingBalance: number
  status: 'Unpaid' | 'Partial' | 'Paid'
  notes?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface CreditPayment {
  id: string
  ownerId: string
  creditId: string
  amount: number
  date: string
}
