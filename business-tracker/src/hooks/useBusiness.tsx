import { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from 'react'
import { collection, doc, runTransaction, where, increment, serverTimestamp, Timestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Product } from '../data/products'
import type { Sale } from '../data/sales'
import type { Expense } from '../data/expenses'
import type { InventoryMovement } from '../data/inventory'
import type { Credit } from '../data/credits'
import { fetchAll, createDocument, updateDocument, deleteDocument, subscribeToCollection } from '../lib/firestore'
import { useAuth } from './useAuth'

function tsSeconds(ts: Timestamp | string | undefined): number {
  if (!ts) return 0
  if (typeof ts === 'string') return new Date(ts).getTime() / 1000
  return ts.seconds
}

export interface DashboardStats {
  totalSales: number
  revenue: number
  expenses: number
  netProfit: number
  products: number
  outstandingCredits: number
  activeCreditCustomers: number
}

interface RestockData {
  productId: string
  productName: string
  quantityAdded: number
  supplier?: string
  notes?: string
}

interface AdjustmentData {
  productId: string
  productName: string
  adjustmentType: 'increase' | 'decrease'
  quantity: number
  reason: string
  notes?: string
}

interface CreditInfo {
  customerName: string
  contactNumber?: string
  notes?: string
}

interface BusinessContextValue {
  products: Product[]
  sales: Sale[]
  expenses: Expense[]
  inventoryMovements: InventoryMovement[]
  credits: Credit[]
  dashboardStats: DashboardStats
  loading: boolean
  addSale: (data: Omit<Sale, 'id'>, creditInfo?: CreditInfo) => Promise<void>
  removeSale: (id: string) => Promise<void>
  addExpense: (data: Omit<Expense, 'id'>) => Promise<void>
  updateExpense: (id: string, data: Omit<Expense, 'id'>) => Promise<void>
  removeExpense: (id: string) => Promise<void>
  restockProduct: (data: RestockData) => Promise<void>
  adjustStock: (data: AdjustmentData) => Promise<void>
  receiveCreditPayment: (creditId: string, amount: number) => Promise<void>
  refreshProducts: () => Promise<void>
}

const BusinessContext = createContext<BusinessContextValue | null>(null)

export function BusinessProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const uid = user?.uid

  const [products, setProducts] = useState<Product[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [inventoryMovements, setInventoryMovements] = useState<InventoryMovement[]>([])
  const [credits, setCredits] = useState<Credit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) return

    fetchAll<Product>('products', where('ownerId', '==', uid)).then((data) => {
      setProducts(data)
    }).catch(() => {}).finally(() => {
      setLoading(false)
    })
  }, [uid])

  useEffect(() => {
    if (!uid) return

    const unsub = subscribeToCollection<Sale>(
      'sales',
      (data) => {
        const sorted = [...data].sort((a, b) => b.date.localeCompare(a.date))
        setSales(sorted)
        setLoading(false)
      },
      () => { setLoading(false) },
      where('ownerId', '==', uid)
    )
    return unsub
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

  useEffect(() => {
    if (!uid) return

    const unsub = subscribeToCollection<InventoryMovement>(
      'inventory_movements',
      (data) => {
        const sorted = [...data].sort(
          (a, b) => tsSeconds(b.createdAt) - tsSeconds(a.createdAt)
        )
        setInventoryMovements(sorted)
      },
      undefined,
      where('ownerId', '==', uid)
    )
    return unsub
  }, [uid])

  useEffect(() => {
    if (!uid) return

    const unsub = subscribeToCollection<Credit>(
      'credits',
      (data) => {
        setCredits(data)
      },
      undefined,
      where('ownerId', '==', uid)
    )
    return unsub
  }, [uid])

  const dashboardStats = useMemo(() => {
    const activeCredits = credits.filter((c) => c.status !== 'Paid')
    const uniqueCustomers = new Set(activeCredits.map((c) => c.customerName))
    return {
      totalSales: sales.length,
      revenue: sales.reduce((sum, s) => sum + s.total, 0),
      expenses: expenses.reduce((sum, e) => sum + e.amount, 0),
      netProfit: sales.reduce((sum, s) => sum + s.total, 0) - expenses.reduce((sum, e) => sum + e.amount, 0),
      products: products.length,
      outstandingCredits: credits.reduce((sum, c) => sum + c.remainingBalance, 0),
      activeCreditCustomers: uniqueCustomers.size,
    }
  }, [sales, expenses, products, credits])

  const addSale = useCallback(async (data: Omit<Sale, 'id'>, creditInfo?: CreditInfo) => {
    if (!uid) throw new Error('Not authenticated')
    const saleRef = doc(collection(db, 'sales'))
    const creditRef = creditInfo ? doc(collection(db, 'credits')) : null

    await runTransaction(db, async (transaction) => {
      const productRefs = data.items.map((item) => ({
        ref: doc(db, 'products', item.productId),
        item,
        previousStock: 0,
      }))

      const snapPromises = productRefs.map(async (entry) => {
        const snap = await transaction.get(entry.ref)
        if (!snap.exists()) {
          throw new Error(`Product "${entry.item.productName}" not found.`)
        }
        const productData = snap.data()
        if (productData.ownerId !== uid) {
          throw new Error(`Product "${entry.item.productName}" does not belong to you.`)
        }
        const currentStock = productData.stock as number
        if (currentStock < entry.item.quantity) {
          throw new Error(
            `Insufficient stock for "${entry.item.productName}". Available: ${currentStock}, requested: ${entry.item.quantity}.`
          )
        }
        entry.previousStock = currentStock
      })

      for (const promise of snapPromises) {
        await promise
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
        paymentMethod: data.paymentMethod ?? 'cash',
        ownerId: uid,
      })

      for (const { item, previousStock } of productRefs) {
        const movementRef = doc(collection(db, 'inventory_movements'))
        transaction.set(movementRef, {
          ownerId: uid,
          productId: item.productId,
          productName: item.productName,
          type: 'sale',
          quantity: item.quantity,
          previousStock,
          newStock: previousStock - item.quantity,
          saleId: saleRef.id,
          createdAt: serverTimestamp(),
        })
      }

      if (creditRef && creditInfo) {
        transaction.set(creditRef, {
          ownerId: uid,
          customerName: creditInfo.customerName,
          contactNumber: creditInfo.contactNumber ?? null,
          saleId: saleRef.id,
          items: data.items,
          totalAmount: data.total,
          amountPaid: 0,
          remainingBalance: data.total,
          status: 'Unpaid',
          notes: creditInfo.notes ?? null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      }
    })

    if (creditRef && creditInfo) {
      const now = Timestamp.now()
      const newCredit: Credit = {
        id: creditRef.id,
        ownerId: uid,
        customerName: creditInfo.customerName,
        contactNumber: creditInfo.contactNumber,
        saleId: saleRef.id,
        items: data.items,
        totalAmount: data.total,
        amountPaid: 0,
        remainingBalance: data.total,
        status: 'Unpaid',
        notes: creditInfo.notes,
        createdAt: now,
        updatedAt: now,
      }
      setCredits((prev) => [...prev, newCredit])
    }

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

  const restockProduct = useCallback(async (data: RestockData) => {
    if (!uid) throw new Error('Not authenticated')
    const productRef = doc(db, 'products', data.productId)
    const movementRef = doc(collection(db, 'inventory_movements'))

    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(productRef)
      if (!snap.exists()) throw new Error('Product not found.')
      if (snap.data().ownerId !== uid) throw new Error('Product does not belong to you.')

      const previousStock = snap.data().stock as number
      const newStock = previousStock + data.quantityAdded

      transaction.update(productRef, { stock: newStock })
      transaction.set(movementRef, {
        ownerId: uid,
        productId: data.productId,
        productName: data.productName,
        type: 'restock',
        quantityAdded: data.quantityAdded,
        previousStock,
        newStock,
        supplier: data.supplier ?? null,
        notes: data.notes ?? null,
        createdAt: serverTimestamp(),
      })
    })

    setProducts((prev) =>
      prev.map((p) =>
        p.id === data.productId
          ? { ...p, stock: p.stock + data.quantityAdded }
          : p
      )
    )
  }, [uid])

  const adjustStock = useCallback(async (data: AdjustmentData) => {
    if (!uid) throw new Error('Not authenticated')
    const productRef = doc(db, 'products', data.productId)
    const movementRef = doc(collection(db, 'inventory_movements'))

    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(productRef)
      if (!snap.exists()) throw new Error('Product not found.')
      if (snap.data().ownerId !== uid) throw new Error('Product does not belong to you.')

      const previousStock = snap.data().stock as number
      const delta = data.adjustmentType === 'increase' ? data.quantity : -data.quantity
      const newStock = previousStock + delta

      if (newStock < 0) {
        throw new Error(
          `Insufficient stock. Available: ${previousStock}, trying to decrease by ${data.quantity}.`
        )
      }

      transaction.update(productRef, { stock: newStock })
      transaction.set(movementRef, {
        ownerId: uid,
        productId: data.productId,
        productName: data.productName,
        type: 'adjustment',
        adjustmentType: data.adjustmentType,
        quantity: data.quantity,
        reason: data.reason,
        previousStock,
        newStock,
        notes: data.notes ?? null,
        createdAt: serverTimestamp(),
      })
    })

    setProducts((prev) =>
      prev.map((p) =>
        p.id === data.productId
          ? { ...p, stock: data.adjustmentType === 'increase' ? p.stock + data.quantity : p.stock - data.quantity }
          : p
      )
    )
  }, [uid])

  const receiveCreditPayment = useCallback(async (creditId: string, amount: number) => {
    if (!uid) throw new Error('Not authenticated')
    if (amount <= 0) throw new Error('Payment must be greater than zero.')

    const creditRef = doc(db, 'credits', creditId)
    const paymentRef = doc(collection(db, 'credit_payments'))

    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(creditRef)
      if (!snap.exists()) throw new Error('Credit record not found.')
      if (snap.data().ownerId !== uid) throw new Error('Credit does not belong to you.')

      const currentRemaining = snap.data().remainingBalance as number
      if (amount > currentRemaining) {
        throw new Error(`Payment cannot exceed remaining balance of $${currentRemaining.toFixed(2)}.`)
      }

      const newAmountPaid = (snap.data().amountPaid as number) + amount
      const newRemaining = currentRemaining - amount
      const newStatus = newRemaining === 0 ? 'Paid' as const : 'Partial' as const

      transaction.update(creditRef, {
        amountPaid: newAmountPaid,
        remainingBalance: newRemaining,
        status: newStatus,
        updatedAt: serverTimestamp(),
      })

      transaction.set(paymentRef, {
        ownerId: uid,
        creditId,
        amount,
        date: serverTimestamp(),
      })
    })

    const now = Timestamp.now()
    setCredits((prev) =>
      prev.map((c) => {
        if (c.id !== creditId) return c
        const newAmountPaid = c.amountPaid + amount
        const newRemaining = c.remainingBalance - amount
        const newStatus = newRemaining === 0 ? 'Paid' as const : 'Partial' as const
        return {
          ...c,
          amountPaid: newAmountPaid,
          remainingBalance: newRemaining,
          status: newStatus,
          updatedAt: now,
        }
      })
    )
  }, [uid])

  const refreshProducts = useCallback(async () => {
    if (!uid) return
    const data = await fetchAll<Product>('products', where('ownerId', '==', uid))
    setProducts(data)
  }, [uid])

  return (
    <BusinessContext.Provider value={{
      products, sales, expenses, inventoryMovements, credits, dashboardStats, loading,
      addSale, removeSale, addExpense, updateExpense, removeExpense, restockProduct, adjustStock,
      receiveCreditPayment, refreshProducts,
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
