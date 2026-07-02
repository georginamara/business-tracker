import { createContext, useContext, useState, useMemo, type ReactNode } from 'react'
import type { Sale } from '../data/sales'
import { initialSales } from '../data/sales'
import type { Expense } from '../data/expenses'
import { initialExpenses } from '../data/expenses'
import { initialProducts } from '../data/products'

export interface DashboardStats {
  totalSales: number
  revenue: number
  expenses: number
  netProfit: number
  products: number
}

interface BusinessContextValue {
  sales: Sale[]
  expenses: Expense[]
  dashboardStats: DashboardStats
  addSale: (sale: Sale) => void
  removeSale: (id: string) => void
  addExpense: (expense: Expense) => void
  removeExpense: (id: string) => void
}

const BusinessContext = createContext<BusinessContextValue | null>(null)

export function BusinessProvider({ children }: { children: ReactNode }) {
  const [sales, setSales] = useState<Sale[]>(initialSales)
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses)

  const dashboardStats = useMemo(() => ({
    totalSales: sales.length,
    revenue: sales.reduce((sum, s) => sum + s.total, 0),
    expenses: expenses.reduce((sum, e) => sum + e.amount, 0),
    netProfit: sales.reduce((sum, s) => sum + s.total, 0) - expenses.reduce((sum, e) => sum + e.amount, 0),
    products: initialProducts.length,
  }), [sales, expenses])

  const addSale = (sale: Sale) => setSales((prev) => [...prev, sale])
  const removeSale = (id: string) => setSales((prev) => prev.filter((s) => s.id !== id))

  const addExpense = (expense: Expense) => setExpenses((prev) => [...prev, expense])
  const removeExpense = (id: string) => setExpenses((prev) => prev.filter((e) => e.id !== id))

  return (
    <BusinessContext.Provider value={{ sales, expenses, dashboardStats, addSale, removeSale, addExpense, removeExpense }}>
      {children}
    </BusinessContext.Provider>
  )
}

export function useBusiness() {
  const ctx = useContext(BusinessContext)
  if (!ctx) throw new Error('useBusiness must be used within BusinessProvider')
  return ctx
}
