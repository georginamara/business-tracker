import { useEffect, useState } from 'react'
import { where } from 'firebase/firestore'
import { useAuth } from '../hooks/useAuth'
import { useBusiness } from '../hooks/useBusiness'
import { useStore } from '../hooks/useStore'
import type { Product } from '../data/products'
import { fetchAll, createDocument, updateDocument, deleteDocument } from '../lib/firestore'
import { loadDefaultProducts } from '../lib/demoDataGenerator'
import ProductFormModal from '../components/ProductFormModal'
import RestockModal from '../components/RestockModal'
import AdjustmentModal from '../components/AdjustmentModal'
import EmptyState from '../components/EmptyState'
import { TableSkeleton } from '../components/Skeleton'

export default function Products() {
  const { user } = useAuth()
  const { restockProduct, adjustStock } = useBusiness()
  const { store } = useStore()
  const uid = user?.uid
  const threshold = store?.lowStockThreshold ?? 5

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [restockTarget, setRestockTarget] = useState<Product | null>(null)
  const [adjustTarget, setAdjustTarget] = useState<Product | null>(null)
  const [loadConfirmOpen, setLoadConfirmOpen] = useState(false)
  const [loadConfirmLoading, setLoadConfirmLoading] = useState(false)
  const [existingCount, setExistingCount] = useState(0)

  useEffect(() => {
    if (!uid) return
    fetchAll<Product>('products', where('ownerId', '==', uid)).then((data) => {
      setProducts(data)
    }).finally(() => setLoading(false))
  }, [uid])

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleSeed = async () => {
    if (!uid) return
    setLoadConfirmLoading(true)
    try {
      await loadDefaultProducts(uid)
      const data = await fetchAll<Product>('products', where('ownerId', '==', uid))
      setProducts(data)
    } finally {
      setLoadConfirmLoading(false)
      setLoadConfirmOpen(false)
    }
  }

  const openLoadDefaults = () => {
    setExistingCount(products.length)
    setLoadConfirmOpen(true)
  }

  const handleSave = async (data: Omit<Product, 'id'>) => {
    if (!uid) return
    if (editingProduct) {
      await updateDocument('products', editingProduct.id, data as Record<string, unknown>)
      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? { ...p, ...data } : p))
      )
    } else {
      const id = await createDocument('products', { ...data, ownerId: uid } as Record<string, unknown>)
      setProducts((prev) => [...prev, { id, ...data }])
    }
    setModalOpen(false)
    setEditingProduct(null)
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setModalOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await deleteDocument('products', deleteTarget.id)
    setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  const openAdd = () => {
    setEditingProduct(null)
    setModalOpen(true)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h2>
        <div className="flex gap-2">
          <button
            onClick={openLoadDefaults}
            disabled={loadConfirmLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 active:bg-emerald-200 dark:active:bg-emerald-900/40 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-150 shadow-sm"
          >
            {loadConfirmLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Loading…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Load Default Products
              </>
            )}
          </button>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg transition-all duration-150 shadow-sm hover:shadow-md"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </button>
        </div>
      </div>

      <div className="relative w-full sm:max-w-sm">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 text-sm dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 transition-shadow bg-white"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {loading ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-5">
          <TableSkeleton rows={5} cols={5} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
          <EmptyState
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            }
            title={search ? 'No products found' : 'No products yet'}
            description={search ? 'Try a different search term.' : 'Add your first product to get started.'}
            action={
              !search ? (
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={openLoadDefaults}
                    disabled={loadConfirmLoading}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors shadow-sm"
                  >
                    {loadConfirmLoading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Loading…
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Load Default Products
                      </>
                    )}
                  </button>
                  <button
                    onClick={openAdd}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Product
                  </button>
                </div>
              ) : undefined
            }
          />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-card">
              <thead>
                <tr className="text-left text-gray-500 dark:text-slate-400 font-medium border-b border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-700/50">
                  <th className="px-5 py-4">Product Name</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Price</th>
                  <th className="px-5 py-4">Stock</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {filtered.map((product) => (
                  <tr key={product.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-slate-700/50 group">
                    <td className="px-5 py-4 font-medium text-gray-900 dark:text-white" data-label="Product">{product.name}</td>
                    <td className="px-5 py-4" data-label="Category">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-900 dark:text-white font-medium" data-label="Price">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-5 py-4" data-label="Stock">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        product.stock <= threshold
                          ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                          : product.stock <= threshold * 3
                          ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
                          : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                      }`}>
                        {product.stock <= threshold && <span className="w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-red-400 animate-pulse" />}
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right" data-label="">
                      <div className="inline-flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-150">
                        <button
                          onClick={() => setAdjustTarget(product)}
                          className="px-3 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 active:bg-amber-200 dark:active:bg-amber-900/40 rounded-lg transition-colors"
                        >
                          Adjust
                        </button>
                        <button
                          onClick={() => setRestockTarget(product)}
                          className="px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 active:bg-emerald-200 dark:active:bg-emerald-900/40 rounded-lg transition-colors"
                        >
                          Restock
                        </button>
                        <button
                          onClick={() => handleEdit(product)}
                          className="px-3 py-1.5 text-xs font-medium text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 active:bg-indigo-200 dark:active:bg-indigo-900/40 rounded-lg transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget(product)}
                          className="px-3 py-1.5 text-xs font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/30 active:bg-red-200 dark:active:bg-red-900/40 rounded-lg transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-gray-100 dark:border-slate-700 text-xs text-gray-400 dark:text-slate-400 flex items-center justify-between">
            <span>{filtered.length} product{filtered.length !== 1 ? 's' : ''}</span>
            {search && <span>Filtered by: &quot;{search}&quot;</span>}
          </div>
        </div>
      )}

      <ProductFormModal
        open={modalOpen}
        product={editingProduct}
        onSave={handleSave}
        onClose={() => {
          setModalOpen(false)
          setEditingProduct(null)
        }}
      />

      {adjustTarget && (
        <AdjustmentModal
          open={!!adjustTarget}
          product={adjustTarget}
          onAdjust={adjustStock}
          onClose={() => setAdjustTarget(null)}
        />
      )}

      {restockTarget && (
        <RestockModal
          open={!!restockTarget}
          product={restockTarget}
          onRestock={restockProduct}
          onClose={() => setRestockTarget(null)}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-sm p-6 animate-scale-in">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mb-4 mx-auto">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2">Delete Product</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 text-center mb-6">
              Are you sure you want to delete <strong className="text-gray-700 dark:text-slate-300">{deleteTarget.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-lg transition-colors shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {loadConfirmOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => { if (!loadConfirmLoading) setLoadConfirmOpen(false) }}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-sm p-6 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 mb-4 mx-auto">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2">Load Default Products</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 text-center mb-6">
              {existingCount > 0
                ? `You already have ${existingCount} product${existingCount !== 1 ? 's' : ''}. Loading defaults will add new products and may create duplicates.`
                : `This will import default products for your business type into your catalog.`
              }
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setLoadConfirmOpen(false)}
                disabled={loadConfirmLoading}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSeed}
                disabled={loadConfirmLoading}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg transition-colors shadow-sm disabled:opacity-50"
              >
                {loadConfirmLoading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Loading…
                  </>
                ) : (
                  'Load Products'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
