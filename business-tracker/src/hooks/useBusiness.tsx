import { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from 'react'
import { collection, doc, runTransaction, where, increment } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Product } from '../data/products'
import type { Sale } from '../data/sales'
import type { Expense } from '../data/expenses'
import { fetchAll, createDocument, updateDocument, deleteDocument, subscribeToCollection } from '../lib/firestore'
import { useAuth } from './useAuth'

export interface DashboardStats {
  totalSales: number
  revenue: number
  expenses: number
  netProfit: number
  products: number
}

interface BusinessContextValue {
  products: Product[]
  sales: Sale[]
  expenses: Expense[]
  dashboardStats: DashboardStats
  loading: boolean
  addSale: (data: Omit<Sale, 'id'>) => Promise<void>
  removeSale: (id: string) => Promise<void>
  addExpense: (data: Omit<Expense, 'id'>) => Promise<void>
  updateExpense: (id: string, data: Omit<Expense, 'id'>) => Promise<void>
  removeExpense: (id: string) => Promise<void>
}

const BusinessContext = createContext<BusinessContextValue | null>(null)

export function BusinessProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const uid = user?.uid

  const [products, setProducts] = useState<Product[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) return

    Promise.all([
      fetchAll<Product>('products', where('ownerId', '==', uid)),
      fetchAll<Sale>('sales', where('ownerId', '==', uid)),
    ]).then(([productsData, salesData]) => {
      setProducts(productsData)
      setSales(salesData)
    }).catch(() => {}).finally(() => {
      setLoading(false)
    })
  }, [uid])

  useEffect(() => {
    if (!uid) return

    const unsub = subscribeToCollection<Expense>(
      'expenses',
      (data) => {
        setExpenses(data)
        setLoading(false)
      },
      () => { setLoading(false) },
      where('ownerId', '==', uid)
    )
    return unsub
  }, [uid])

  const dashboardStats = useMemo(() => ({
    totalSales: sales.length,
    revenue: sales.reduce((sum, s) => sum + s.total, 0),
    expenses: expenses.reduce((sum, e) => sum + e.amount, 0),
    netProfit: sales.reduce((sum, s) => sum + s.total, 0) - expenses.reduce((sum, e) => sum + e.amount, 0),
    products: products.length,
  }), [sales, expenses, products])

  const addSale = useCallback(async (data: Omit<Sale, 'id'>) => {
    if (!uid) throw new Error('Not authenticated')
    const saleRef = doc(collection(db, 'sales'))

    await runTransaction(db, async (transaction) => {
      const productRefs = data.items.map((item) => ({
        ref: doc(db, 'products', item.productId),
        item,
      }))

      const snapshots = productRefs.map(({ ref, item }) => {
        const snap = transaction.get(ref)
        return { snap, item }
      })

      for (const { snap, item } of snapshots) {
        const productSnap = await snap
        if (!productSnap.exists()) {
          throw new Error(`Product "${item.productName}" not found.`)
        }
        const productData = productSnap.data()
        if (productData.ownerId !== uid) {
          throw new Error(`Product "${item.productName}" does not belong to you.`)
        }
        const currentStock = productData.stock as number
        if (currentStock < item.quantity) {
          throw new Error(
            `Insufficient stock for "${item.productName}". Available: ${currentStock}, requested: ${item.quantity}.`
          )
        }
      }

      for (const { ref, item } of productRefs) {
        transaction.update(ref, { stock: increment(-item.quantity) })
      }

      transaction.set(saleRef, {
        date: data.date,
        items: data.items,
        total: data.total,
        discount: data.discount ?? null,
        paid: data.paid ?? null,
        change: data.change ?? null,
        ownerId: uid,
      })
    })

    const newSale: Sale = { id: saleRef.id, ...data }
    setSales((prev) => [...prev, newSale])

    for (const item of data.items) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === item.productId
            ? { ...p, stock: p.stock - item.quantity }
            : p
        )
      )
    }
  }, [uid])

  const removeSale = useCallback(async (id: string) => {
    await deleteDocument('sales', id)
    setSales((prev) => prev.filter((s) => s.id !== id))
  }, [])

  const addExpense = useCallback(async (data: Omit<Expense, 'id'>) => {
    if (!uid) throw new Error('Not authenticated')
    await createDocument('expenses', { ...data, ownerId: uid } as Record<string, unknown>)
  }, [uid])

  const updateExpense = useCallback(async (id: string, data: Omit<Expense, 'id'>) => {
    await updateDocument('expenses', id, data as Record<string, unknown>)
  }, [])

  const removeExpense = useCallback(async (id: string) => {
    await deleteDocument('expenses', id)
  }, [])

  return (
    <BusinessContext.Provider value={{
      products, sales, expenses, dashboardStats, loading,
      addSale, removeSale, addExpense, updateExpense, removeExpense,
    }}>
      {children}
    </BusinessContext.Provider>
  )
}

export function useBusiness() {
  const ctx = useContext(BusinessContext)
  if (!ctx) throw new Error('useBusiness must be used within BusinessProvider')
  return ctx
}
