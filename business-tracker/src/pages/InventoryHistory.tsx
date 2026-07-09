import { useState, useMemo } from 'react'
import { useBusiness } from '../hooks/useBusiness'
import EmptyState from '../components/EmptyState'
import { TableSkeleton } from '../components/Skeleton'

interface MovementDisplay {
  id: string
  dateTime: string
  productName: string
  type: 'restock' | 'sale' | 'adjustment'
  quantity: number
  previousStock: number
  newStock: number
  supplier?: string
  reason?: string
  notes?: string
}

const MOVEMENT_TYPES = ['All', 'Restock', 'Sale', 'Adjustment'] as const

function formatDate(iso: string) {
  try {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return iso
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export default function InventoryHistory() {
  const { inventoryMovements, sales, loading } = useBusiness()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('All')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selected, setSelected] = useState<MovementDisplay | null>(null)

  const movements = useMemo(() => {
    const result: MovementDisplay[] = []

    for (const m of inventoryMovements) {
      if (m.type === 'restock') {
        result.push({
          id: `inv-${m.id}`,
          dateTime: m.createdAt,
          productName: m.productName,
          type: 'restock',
          quantity: m.quantityAdded ?? 0,
          previousStock: m.previousStock,
          newStock: m.newStock,
          supplier: m.supplier,
          notes: m.notes,
        })
      } else if (m.type === 'adjustment') {
        result.push({
          id: `inv-${m.id}`,
          dateTime: m.createdAt,
          productName: m.productName,
          type: 'adjustment',
          quantity: m.adjustmentType === 'increase' ? (m.quantity ?? 0) : -(m.quantity ?? 0),
          previousStock: m.previousStock,
          newStock: m.newStock,
          reason: m.reason,
          notes: m.notes,
        })
      }
    }

    for (const sale of sales) {
      for (const item of sale.items) {
        result.push({
          id: `sale-${sale.id}-${item.productId}`,
          dateTime: sale.date,
          productName: item.productName,
          type: 'sale',
          quantity: -item.quantity,
          previousStock: 0,
          newStock: 0,
          notes: `Sale total: $${sale.total.toFixed(2)}`,
        })
      }
    }

    result.sort((a, b) => b.dateTime.localeCompare(a.dateTime))
    return result
  }, [inventoryMovements, sales])

  const filtered = useMemo(() => {
    let result = movements

    if (search) {
      const q = search.toLowerCase()
      result = result.filter((m) => m.productName.toLowerCase().includes(q))
    }

    if (typeFilter !== 'All') {
      const target = typeFilter.toLowerCase() as MovementDisplay['type']
      result = result.filter((m) => m.type === target)
    }

    if (dateFrom) {
      result = result.filter((m) => m.dateTime >= dateFrom)
    }

    if (dateTo) {
      const end = dateTo + 'T23:59:59'
      result = result.filter((m) => m.dateTime <= end)
    }

    return result
  }, [movements, search, typeFilter, dateFrom, dateTo])

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Inventory History</h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by product name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-white"
        >
          {MOVEMENT_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
          title="From date"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
          title="To date"
        />
        {(search || typeFilter !== 'All' || dateFrom || dateTo) && (
          <button
            onClick={() => { setSearch(''); setTypeFilter('All'); setDateFrom(''); setDateTo('') }}
            className="px-3 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <TableSkeleton rows={5} cols={6} />
        </div>
      ) : movements.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <EmptyState
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            }
            title="No inventory movements found"
            description="Inventory changes such as Restocks, Sales, and Adjustments will appear here."
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <EmptyState
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
            title="No matching records"
            description="Try adjusting your filters."
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-card">
              <thead>
                <tr className="text-left text-gray-500 font-medium border-b border-gray-200 bg-gray-50/50">
                  <th className="px-5 py-4">Date & Time</th>
                  <th className="px-5 py-4">Product Name</th>
                  <th className="px-5 py-4">Movement Type</th>
                  <th className="px-5 py-4 text-right">Quantity</th>
                  <th className="px-5 py-4 text-right">Previous Stock</th>
                  <th className="px-5 py-4 text-right">New Stock</th>
                  <th className="px-5 py-4">Notes / Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((m) => (
                  <tr
                    key={m.id}
                    onClick={() => setSelected(m)}
                    className="transition-colors hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-5 py-4 text-gray-600 whitespace-nowrap" data-label="Date & Time">
                      {formatDate(m.dateTime)}
                    </td>
                    <td className="px-5 py-4 font-medium text-gray-900" data-label="Product Name">
                      {m.productName}
                    </td>
                    <td className="px-5 py-4" data-label="Movement Type">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        m.type === 'restock'
                          ? 'bg-green-50 text-green-700'
                          : m.type === 'sale'
                          ? 'bg-red-50 text-red-700'
                          : m.type === 'adjustment'
                          ? 'bg-orange-50 text-orange-700'
                          : 'bg-gray-50 text-gray-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          m.type === 'restock' ? 'bg-green-500' : m.type === 'sale' ? 'bg-red-500' : m.type === 'adjustment' ? 'bg-orange-500' : 'bg-gray-400'
                        }`} />
                        {m.type === 'restock' ? 'Restock' : m.type === 'sale' ? 'Sale' : m.type === 'adjustment' ? 'Adjustment' : m.type}
                      </span>
                    </td>
                    <td className={`px-5 py-4 text-right font-semibold whitespace-nowrap ${
                      m.quantity > 0 ? 'text-green-600' : m.quantity < 0 ? 'text-red-600' : 'text-gray-500'
                    }`} data-label="Quantity">
                      {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                    </td>
                    <td className="px-5 py-4 text-right text-gray-600" data-label="Previous Stock">
                      {m.type !== 'sale' ? m.previousStock : '—'}
                    </td>
                    <td className="px-5 py-4 text-right text-gray-600 font-medium" data-label="New Stock">
                      {m.type !== 'sale' ? m.newStock : '—'}
                    </td>
                    <td className="px-5 py-4 text-gray-500 max-w-[200px] truncate" data-label="Notes / Reason">
                      {m.reason || m.supplier || m.notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
            {filtered.length} of {movements.length} movement{movements.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setSelected(null)}>
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-scale-in max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-900">Movement Details</h3>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                  selected.type === 'restock'
                    ? 'bg-green-50 text-green-700'
                    : selected.type === 'sale'
                    ? 'bg-red-50 text-red-700'
                    : 'bg-orange-50 text-orange-700'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    selected.type === 'restock' ? 'bg-green-500' : selected.type === 'sale' ? 'bg-red-500' : 'bg-orange-500'
                  }`} />
                  {selected.type === 'restock' ? 'Restock' : selected.type === 'sale' ? 'Sale' : 'Adjustment'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 font-medium">Product Name</p>
                  <p className="text-gray-900 mt-0.5">{selected.productName}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Date & Time</p>
                  <p className="text-gray-900 mt-0.5">{formatDate(selected.dateTime)}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Quantity</p>
                  <p className={`font-semibold mt-0.5 ${
                    selected.quantity > 0 ? 'text-green-600' : selected.quantity < 0 ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {selected.quantity > 0 ? `+${selected.quantity}` : selected.quantity}
                  </p>
                </div>
                {selected.type !== 'sale' && (
                  <>
                    <div>
                      <p className="text-gray-500 font-medium">Previous Stock</p>
                      <p className="text-gray-900 mt-0.5">{selected.previousStock}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">New Stock</p>
                      <p className="text-gray-900 mt-0.5">{selected.newStock}</p>
                    </div>
                  </>
                )}
                {selected.supplier && (
                  <div className="col-span-2">
                    <p className="text-gray-500 font-medium">Supplier</p>
                    <p className="text-gray-900 mt-0.5">{selected.supplier}</p>
                  </div>
                )}
                {selected.reason && (
                  <div className="col-span-2">
                    <p className="text-gray-500 font-medium">Reason</p>
                    <p className="text-gray-900 mt-0.5">{selected.reason}</p>
                  </div>
                )}
                {selected.notes && selected.type !== 'adjustment' && (
                  <div className="col-span-2">
                    <p className="text-gray-500 font-medium">Notes</p>
                    <p className="text-gray-900 mt-0.5">{selected.notes}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
