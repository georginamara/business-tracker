import { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from 'react'
import type { Sale } from '../data/sales'
import type { Expense } from '../data/expenses'
import { initialProducts } from '../data/products'
import { fetchAll, createDocument, deleteDocument } from '../lib/firestore'

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
  loading: boolean
  addSale: (data: Omit<Sale, 'id'>) => Promise<void>
  removeSale: (id: string) => Promise<void>
  addExpense: (data: Omit<Expense, 'id'>) => Promise<void>
  removeExpense: (id: string) => Promise<void>
}

const BusinessContext = createContext<BusinessContextValue | null>(null)

export function BusinessProvider({ children }: { children: ReactNode }) {
  const [sales, setSales] = useState<Sale[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetchAll<Sale>('sales'),
      fetchAll<Expense>('expenses'),
    ]).then(([salesData, expensesData]) => {
      setSales(salesData)
      setExpenses(expensesData)
    }).finally(() => setLoading(false))
  }, [])

  const dashboardStats = useMemo(() => ({
    totalSales: sales.length,
    revenue: sales.reduce((sum, s) => sum + s.total, 0),
    expenses: expenses.reduce((sum, e) => sum + e.amount, 0),
    netProfit: sales.reduce((sum, s) => sum + s.total, 0) - expenses.reduce((sum, e) => sum + e.amount, 0),
    products: initialProducts.length,
  }), [sales, expenses])

  const addSale = useCallback(async (data: Omit<Sale, 'id'>) => {
    const id = await createDocument('sales', data as Record<string, unknown>)
    setSales((prev) => [...prev, { id, ...data }])
  }, [])

  const removeSale = useCallback(async (id: string) => {
    await deleteDocument('sales', id)
    setSales((prev) => prev.filter((s) => s.id !== id))
  }, [])

  const addExpense = useCallback(async (data: Omit<Expense, 'id'>) => {
    const id = await createDocument('expenses', data as Record<string, unknown>)
    setExpenses((prev) => [...prev, { id, ...data }])
  }, [])

  const removeExpense = useCallback(async (id: string) => {
    await deleteDocument('expenses', id)
    setExpenses((prev) => prev.filter((e) => e.id !== id))
  }, [])

  return (
    <BusinessContext.Provider value={{ sales, expenses, dashboardStats, loading, addSale, removeSale, addExpense, removeExpense }}>
      {children}
    </BusinessContext.Provider>
  )
}

export function useBusiness() {
  const ctx = useContext(BusinessContext)
  if (!ctx) throw new Error('useBusiness must be used within BusinessProvider')
  return ctx
}
