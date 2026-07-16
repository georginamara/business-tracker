import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useBusiness } from '../hooks/useBusiness'
import EmptyState from '../components/EmptyState'
import { TableSkeleton } from '../components/Skeleton'
import type { Sale } from '../data/sales'

export default function Sales() {
  const { sales, removeSale, loading } = useBusiness()
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Sale | null>(null)

  const filtered = useMemo(() => {
    if (!search) return sales
    const q = search.toLowerCase()
    return sales.filter((sale) => {
      if (sale.date.includes(q)) return true
      return sale.items.some((item) => item.productName.toLowerCase().includes(q))
    })
  }, [sales, search])

  const handleDelete = async () => {
    if (!deleteTarget) return
    await removeSale(deleteTarget.id)
    setDeleteTarget(null)
  }

  const grandTotal = filtered.reduce((sum, s) => sum + s.total, 0)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sales History</h2>
        <div className="relative w-full sm:w-64">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by date or product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-slate-600 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-white dark:bg-slate-700 dark:text-white"
          />
        </div>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-5">
          <TableSkeleton rows={5} cols={5} />
        </div>
      ) : sales.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
          <EmptyState
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            }
            title="No sales yet"
            description="Sales will appear here after your first transaction."
            action={
              <Link
                to="/pos"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
                Open POS
              </Link>
            }
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
          <EmptyState
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
            title="No results"
            description="No sales match your search criteria."
          />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-card">
              <thead>
                <tr className="text-left text-gray-500 dark:text-slate-400 font-medium border-b border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-700/50">
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Items</th>
                  <th className="px-5 py-4 text-right">Total</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {filtered.map((sale) => (
                  <tr key={sale.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-slate-700/50 group">
                    <td className="px-5 py-4 text-gray-600 dark:text-slate-400 align-top" data-label="Date">{sale.date}</td>
                    <td className="px-5 py-4" data-label="Items">
                      <div className="space-y-1">
                        {sale.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-white">{item.productName}</span>
                            <span className="text-gray-400 dark:text-slate-500">x{item.quantity}</span>
                            <span className="text-gray-500 dark:text-slate-400 ml-auto">${item.subtotal.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right text-gray-900 dark:text-white font-medium align-top" data-label="Total">
                      ${sale.total.toFixed(2)}
                    </td>
                    <td className="px-5 py-4 text-right align-top" data-label="">
                      <button
                        onClick={() => setDeleteTarget(sale)}
                        className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 active:bg-red-200 rounded-lg transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50/80 dark:bg-slate-700/50 font-semibold">
                  <td colSpan={2} className="px-5 py-4 text-gray-700 dark:text-slate-300">Total</td>
                  <td className="px-5 py-4 text-right text-gray-900 dark:text-white">${grandTotal.toFixed(2)}</td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-gray-100 dark:border-slate-700 text-xs text-gray-400 dark:text-slate-500">
            {filtered.length} of {sales.length} sale{sales.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-sm p-6 animate-scale-in">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600 mb-4 mx-auto">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2">Delete Sale</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 text-center mb-6">
              Are you sure you want to delete this sale from <strong className="text-gray-700 dark:text-slate-200">{deleteTarget.date}</strong>? This action cannot be undone.
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
    </div>
  )
}
