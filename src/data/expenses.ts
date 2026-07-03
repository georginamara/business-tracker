export interface Expense {
  id: string
  description: string
  category: string
  amount: number
  date: string
  notes?: string
  createdAt: string
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
