import { useState } from 'react'
import { useBusiness } from '../hooks/useBusiness'
import { initialProducts } from '../data/products'
import SaleFormModal from '../components/SaleFormModal'
import EmptyState from '../components/EmptyState'
import { TableSkeleton } from '../components/Skeleton'

export default function Sales() {
  const { sales, addSale, removeSale, loading } = useBusiness()
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<typeof sales[number] | null>(null)

  const handleSave = async (data: { date: string; product: string; quantity: number; total: number }) => {
    await addSale(data)
    setModalOpen(false)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await removeSale(deleteTarget.id)
    setDeleteTarget(null)
  }

  const grandTotal = sales.reduce((sum, s) => sum + s.total, 0)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Sales</h2>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg transition-all duration-150 shadow-sm hover:shadow-md"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Sale
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <TableSkeleton rows={5} cols={5} />
        </div>
      ) : sales.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <EmptyState
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            }
            title="No sales yet"
            description="Record your first sale to start tracking revenue."
            action={
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Sale
              </button>
            }
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 font-medium border-b border-gray-200 bg-gray-50/50">
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Product</th>
                  <th className="px-5 py-4">Quantity</th>
                  <th className="px-5 py-4 text-right">Total</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sales.map((sale) => (
                  <tr key={sale.id} className="transition-colors hover:bg-gray-50 group">
                    <td className="px-5 py-4 text-gray-600">{sale.date}</td>
                    <td className="px-5 py-4 font-medium text-gray-900">{sale.product}</td>
                    <td className="px-5 py-4 text-gray-600">{sale.quantity}</td>
                    <td className="px-5 py-4 text-right text-gray-900 font-medium">
                      ${sale.total.toFixed(2)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setDeleteTarget(sale)}
                        className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 active:bg-red-200 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50/80 font-semibold">
                  <td colSpan={3} className="px-5 py-4 text-gray-700">Total</td>
                  <td className="px-5 py-4 text-right text-gray-900">${grandTotal.toFixed(2)}</td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
            {sales.length} sale{sales.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      <SaleFormModal
        open={modalOpen}
        products={initialProducts}
        onSave={handleSave}
        onClose={() => setModalOpen(false)}
      />

      {deleteTarget && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-scale-in">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600 mb-4 mx-auto">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Delete Sale</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Are you sure you want to delete the sale of <strong className="text-gray-700">{deleteTarget.product}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
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
    </div>
  )
}
