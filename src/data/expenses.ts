export interface Expense {
  id: string
  name: string
  category: string
  amount: number
  date: string
}

export const initialExpenses: Expense[] = [
  { id: '1', name: 'Office Rent', category: 'Rent', amount: 3000, date: '2026-06-01' },
  { id: '2', name: 'Electricity Bill', category: 'Utilities', amount: 450, date: '2026-06-05' },
  { id: '3', name: 'Internet Service', category: 'Utilities', amount: 120, date: '2026-06-05' },
  { id: '4', name: 'Office Supplies', category: 'Supplies', amount: 280, date: '2026-06-10' },
  { id: '5', name: 'Marketing Ads', category: 'Marketing', amount: 1500, date: '2026-06-12' },
  { id: '6', name: 'Software Licenses', category: 'Software', amount: 350, date: '2026-06-15' },
  { id: '7', name: 'Freelancer Payment', category: 'Labor', amount: 2000, date: '2026-06-20' },
  { id: '8', name: 'Shipping Costs', category: 'Logistics', amount: 180, date: '2026-06-22' },
]

export const expenseCategories = [
  'Rent',
  'Utilities',
  'Supplies',
  'Marketing',
  'Software',
  'Labor',
  'Logistics',
  'Other',
]
