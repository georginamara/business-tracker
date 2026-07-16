import type { Timestamp } from 'firebase/firestore'

export interface Expense {
  id: string
  description: string
  category: string
  amount: number
  date: string
  notes?: string
  createdAt: Timestamp
}

export const expenseCategories = [
  'Inventory',
  'Utilities',
  'Transportation',
  'Maintenance',
  'Salary',
  'Rent',
  'Supplies',
  'Miscellaneous',
]
