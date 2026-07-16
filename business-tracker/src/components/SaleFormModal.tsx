import { useState } from 'react'
import type { Product } from '../data/products'
import type { SaleItem } from '../data/sales'

interface SaleFormModalProps {
  open: boolean
  products: Product[]
  onSave: (sale: { date: string; items: SaleItem[]; total: number }) => Promise<void>
  onClose: () => void
}

interface LineItem {
  productId: string
  quantity: string
}

export default function SaleFormModal({ open, products, onSave, onClose }: SaleFormModalProps) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [items, setItems] = useState<LineItem[]>([{ productId: '', quantity: '1' }])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  if (!open) return null

  const selectedProducts = items.map((item) => ({
    ...item,
    product: products.find((p) => p.id === item.productId) ?? null,
  }))

  const total = selectedProducts.reduce((sum, { product, quantity }) => {
    if (!product) return sum
    return sum + product.price * parseInt(quantity || '0', 10)
  }, 0)

  const hasStockError = selectedProducts.some(({ product, quantity }) => {
    if (!product) return false
    return parseInt(quantity || '0', 10) > product.stock
  })

  const isComplete = selectedProducts.every(({ product, quantity }) => {
    return product && parseInt(quantity || '0', 10) > 0
  })

  const handleProductChange = (index: number, productId: string) => {
    setItems((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], productId, quantity: '1' }
      return next
    })
    setError('')
  }

  const handleQuantityChange = (index: number, quantity: string) => {
    setItems((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], quantity }
      return next
    })
    setError('')
  }

  const addItem = () => {
    setItems((prev) => [...prev, { productId: '', quantity: '1' }])
  }

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!date || !isComplete) return
    if (hasStockError) {
      setError('One or more items exceed available stock.')
      return
    }

    setSaving(true)
    setError('')

    const saleItems: SaleItem[] = selectedProducts.map(({ product, quantity }) => ({
      productId: product!.id,
      productName: product!.name,
      quantity: parseInt(quantity, 10),
      unitPrice: product!.price,
      subtotal: product!.price * parseInt(quantity, 10),
    }))

    try {
      await onSave({ date, items: saleItems, total })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save sale.')
    } finally {
      setSaving(false)
    }
  }

  const availableProducts = (currentIndex: number) => {
    const selectedIds = items.map((item) => item.productId)
    return products.filter(
      (p) => !selectedIds.includes(p.id) || p.id === items[currentIndex].productId
    )
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg p-6 animate-scale-in max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Sale</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 transition-shadow dark:bg-slate-700 dark:text-white"
              required
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-400">Items</label>
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Item
              </button>
            </div>

            {items.map((item, index) => {
              const product = products.find((p) => p.id === item.productId)
              const qty = parseInt(item.quantity || '0', 10)
              const exceedsStock = product && qty > product.stock

              return (
                <div key={index} className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3 border border-gray-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 space-y-2">
                      <select
                        value={item.productId}
                        onChange={(e) => handleProductChange(index, e.target.value)}
                        className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 transition-shadow dark:bg-slate-700 dark:text-white"
                        required
                      >
                        <option value="">Select a product</option>
                        {availableProducts(index).map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} — ${p.price.toFixed(2)}
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-2 items-start">
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Quantity</label>
                          <input
                            type="number"
                            min="1"
                            max={product?.stock ?? 1}
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(index, e.target.value)}
                            className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 transition-shadow dark:bg-slate-700 dark:text-white ${
                              exceedsStock ? 'border-red-400 bg-red-50 dark:border-red-400 dark:bg-red-900/20' : 'border-gray-300 dark:border-slate-600'
                            }`}
                            required
                          />
                          {exceedsStock && (
                            <p className="text-xs text-red-600 mt-1">
                              Only {product!.stock} in stock
                            </p>
                          )}
                        </div>
                        <div className="text-right min-w-[80px]">
                          <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Subtotal</label>
                          <div className="py-2 text-sm font-semibold text-gray-900 dark:text-white">
                            ${(product && qty ? product.price * qty : 0).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-1.5 mt-1 rounded-md text-gray-400 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/40 dark:to-indigo-800/40 rounded-lg p-4 text-sm border border-indigo-200 dark:border-indigo-700 flex items-center justify-between">
            <span className="text-indigo-700 dark:text-indigo-300 font-medium">Total</span>
            <span className="font-bold text-indigo-900 dark:text-indigo-200 text-lg">${total.toFixed(2)}</span>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || hasStockError || !isComplete || items.some((i) => !i.productId)}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving…
                </>
              ) : (
                'Add Sale'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
