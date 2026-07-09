import { useState, useMemo } from 'react'
import { useBusiness } from '../hooks/useBusiness'
import type { Product } from '../data/products'
import type { SaleItem } from '../data/sales'

interface CartItem {
  product: Product
  quantity: number
}

export default function POS() {
  const { products, addSale } = useBusiness()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [discount, setDiscount] = useState('')
  const [paid, setPaid] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category))
    return ['', ...Array.from(cats).sort()]
  }, [products])

  const filtered = useMemo(() => {
    let result = products
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((p) => p.name.toLowerCase().includes(q))
    }
    if (category) {
      result = result.filter((p) => p.category === category)
    }
    return result
  }, [products, search, category])

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cart]
  )

  const discountValue = useMemo(() => {
    const val = parseFloat(discount) || 0
    return Math.min(val, subtotal)
  }, [discount, subtotal])

  const total = subtotal - discountValue
  const paidValue = parseFloat(paid) || 0
  const change = paidValue >= total ? paidValue - total : 0

  function getCartQuantity(productId: string) {
    return cart.find((c) => c.product.id === productId)?.quantity ?? 0
  }

  function addToCart(product: Product) {
    if (product.stock <= 0) return
    setCart((prev) => {
      const existing = prev.find((c) => c.product.id === product.id)
      if (existing) {
        if (existing.quantity >= product.stock) return prev
        return prev.map((c) =>
          c.product.id === product.id ? { ...c, quantity: c.quantity + 1 } : c
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
    setError('')
    setSuccess('')
  }

  function updateQuantity(productId: string, qty: number) {
    const product = products.find((p) => p.id === productId)
    if (!product) return
    const clamped = Math.max(1, Math.min(qty, product.stock))
    setCart((prev) =>
      prev.map((c) =>
        c.product.id === productId ? { ...c, quantity: clamped } : c
      )
    )
    setError('')
  }

  function removeFromCart(productId: string) {
    setCart((prev) => prev.filter((c) => c.product.id !== productId))
  }

  function clearCart() {
    setCart([])
    setDiscount('')
    setPaid('')
    setError('')
    setSuccess('')
  }

  async function handleCheckout() {
    if (cart.length === 0) {
      setError('Cart is empty.')
      return
    }
    if (paidValue < total) {
      setError('Customer paid amount must cover the total.')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    const items: SaleItem[] = cart.map((c) => ({
      productId: c.product.id,
      productName: c.product.name,
      quantity: c.quantity,
      unitPrice: c.product.price,
      subtotal: c.product.price * c.quantity,
    }))

    try {
      await addSale({
        date: new Date().toISOString().slice(0, 10),
        items,
        total,
        discount: discountValue,
        paid: paidValue,
        change,
      })
      setSuccess(`Sale completed! Change: $${change.toFixed(2)}`)
      clearCart()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] -m-6 gap-0 animate-fade-in">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200 bg-white space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
              />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-white"
            >
              <option value="">All Categories</option>
              {categories.filter(Boolean).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <p className="text-xs text-gray-400">
            {filtered.length} product{filtered.length !== 1 ? 's' : ''}
            {category && ` in ${category}`}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-sm font-medium">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {filtered.map((product) => {
                const inCart = getCartQuantity(product.id)
                const outOfStock = product.stock <= 0
                const atMax = inCart >= product.stock

                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => addToCart(product)}
                    disabled={outOfStock || atMax}
                    className={`relative flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-150 ${
                      outOfStock
                        ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                        : atMax
                        ? 'border-amber-200 bg-amber-50 cursor-not-allowed'
                        : inCart > 0
                        ? 'border-indigo-300 bg-indigo-50 shadow-sm hover:shadow-md hover:border-indigo-400 cursor-pointer'
                        : 'border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-gray-300 hover:bg-gray-50 cursor-pointer'
                    }`}
                  >
                    {outOfStock && (
                      <span className="absolute top-1.5 right-1.5 text-[10px] font-semibold text-white bg-red-500 px-1.5 py-0.5 rounded-full">
                        OOS
                      </span>
                    )}
                    {inCart > 0 && (
                      <span className="absolute top-1.5 right-1.5 text-[10px] font-semibold text-white bg-indigo-600 px-1.5 py-0.5 rounded-full">
                        {inCart}
                      </span>
                    )}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center mb-2">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <p className="text-xs font-medium text-gray-900 line-clamp-2 leading-tight mb-1">
                      {product.name}
                    </p>
                    <p className="text-xs font-bold text-indigo-600">
                      ${product.price.toFixed(2)}
                    </p>
                    <p className={`text-[10px] mt-0.5 ${
                      product.stock <= 5 ? 'text-red-500 font-medium' : 'text-gray-400'
                    }`}>
                      {outOfStock ? 'Out of Stock' : `${product.stock} left`}
                    </p>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="w-80 lg:w-96 xl:w-[28rem] bg-white border-l border-gray-200 flex flex-col flex-shrink-0">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">
              Cart ({cart.reduce((s, i) => s + i.quantity, 0)} items)
            </h3>
            {cart.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="text-xs font-medium text-red-600 hover:text-red-700 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6">
              <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              <p className="text-sm font-medium">Cart is empty</p>
              <p className="text-xs mt-1">Click products to add them</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {cart.map((item) => (
                <div key={item.product.id} className="p-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      ${item.product.price.toFixed(2)} each
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="w-7 h-7 rounded-md border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={item.product.stock}
                      value={item.quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10)
                        if (!isNaN(val)) updateQuantity(item.product.id, val)
                      }}
                      className="w-10 text-center text-sm border border-gray-300 rounded-md py-1 px-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock}
                      className="w-7 h-7 rounded-md border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                  <div className="text-right min-w-[4rem]">
                    <p className="text-sm font-semibold text-gray-900">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-1 rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 p-4 space-y-3 bg-gray-50/50">
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-gray-600">Discount</span>
              <div className="flex items-center gap-1">
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  min="0"
                  max={subtotal}
                  step="0.01"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="0.00"
                  className="w-24 text-right text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-900 pt-1.5 border-t border-gray-200">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Customer Paid</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={paid}
                onChange={(e) => setPaid(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
              />
            </div>
            {paidValue > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Change</span>
                <span className={`font-semibold ${paidValue >= total ? 'text-green-600' : 'text-red-600'}`}>
                  {paidValue >= total ? `$${change.toFixed(2)}` : `Short $${(total - paidValue).toFixed(2)}`}
                </span>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 text-xs text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-2.5 text-xs text-green-700 font-medium">
              {success}
            </div>
          )}

          <button
            type="button"
            onClick={handleCheckout}
            disabled={saving || cart.length === 0 || paidValue < total}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <span className="inline-flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing…
              </span>
            ) : (
              `Complete Sale — $${total.toFixed(2)}`
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
