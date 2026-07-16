import { useState, useMemo } from 'react'
import { useBusiness } from '../hooks/useBusiness'
import EmptyState from '../components/EmptyState'
import { TableSkeleton } from '../components/Skeleton'
import type { Timestamp } from 'firebase/firestore'
import type { InventoryMovement } from '../data/inventory'

function tsToDate(ts: Timestamp | string | undefined): Date {
  if (!ts) return new Date()
  if (typeof ts === 'string') return new Date(ts)
  return ts.toDate()
}

interface RestockDisplay {
  id: string
  dateTime: string
  productName: string
  type: 'restock'
  quantity: number
  previousStock: number
  newStock: number
  supplier?: string
  notes?: string
}

interface AdjustmentDisplay {
  id: string
  dateTime: string
  productName: string
  type: 'adjustment'
  quantity: number
  previousStock: number
  newStock: number
  reason?: string
  notes?: string
}

interface SaleGroupDisplay {
  id: string
  dateTime: string
  type: 'sale'
  saleId: string
  items: { productName: string; quantity: number }[]
  totalQuantity: number
  total: number
}

type DisplayRow = RestockDisplay | AdjustmentDisplay | SaleGroupDisplay

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

const ChevronDown = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
)

const ChevronRight = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)

export default function InventoryHistory() {
  const { inventoryMovements, sales, loading } = useBusiness()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('All')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selected, setSelected] = useState<DisplayRow | null>(null)
  const [expandedSales, setExpandedSales] = useState<Set<string>>(new Set())

  const saleTotalMap = useMemo(() => {
    const map = new Map<string, number>()
    for (const sale of sales) {
      map.set(sale.id, sale.total)
    }
    return map
  }, [sales])

  const rows = useMemo(() => {
    const individual: (RestockDisplay | AdjustmentDisplay)[] = []
    const saleMap = new Map<string, InventoryMovement[]>()

    for (const m of inventoryMovements) {
      if (m.type === 'restock') {
        individual.push({
          id: `inv-${m.id}`,
          dateTime: tsToDate(m.createdAt).toISOString(),
          productName: m.productName,
          type: 'restock',
          quantity: m.quantityAdded ?? 0,
          previousStock: m.previousStock,
          newStock: m.newStock,
          supplier: m.supplier,
          notes: m.notes,
        })
      } else if (m.type === 'adjustment') {
        individual.push({
          id: `inv-${m.id}`,
          dateTime: tsToDate(m.createdAt).toISOString(),
          productName: m.productName,
          type: 'adjustment',
          quantity: m.adjustmentType === 'increase' ? (m.quantity ?? 0) : -(m.quantity ?? 0),
          previousStock: m.previousStock,
          newStock: m.newStock,
          reason: m.reason,
          notes: m.notes,
        })
      } else if (m.type === 'sale' && m.saleId) {
        if (!saleMap.has(m.saleId)) {
          saleMap.set(m.saleId, [])
        }
        saleMap.get(m.saleId)!.push(m)
      }
    }

    const groups: SaleGroupDisplay[] = []
    for (const [saleId, movements] of saleMap) {
      const sorted = [...movements].sort(
        (a, b) => tsToDate(a.createdAt).getTime() - tsToDate(b.createdAt).getTime()
      )
      const first = sorted[0]
      groups.push({
        id: `sale-${saleId}`,
        dateTime: tsToDate(first.createdAt).toISOString(),
        type: 'sale',
        saleId,
        items: sorted.map((m) => ({
          productName: m.productName,
          quantity: m.quantity ?? 0,
        })),
        totalQuantity: sorted.reduce((sum, m) => sum + (m.quantity ?? 0), 0),
        total: saleTotalMap.get(saleId) ?? 0,
      })
    }

    const result: DisplayRow[] = [...individual, ...groups]
    result.sort((a, b) => b.dateTime.localeCompare(a.dateTime))
    return result
  }, [inventoryMovements, saleTotalMap])

  const filtered = useMemo(() => {
    let result = rows

    if (search) {
      const q = search.toLowerCase()
      result = result.filter((r) => {
        if (r.type === 'sale') {
          return r.items.some((item) => item.productName.toLowerCase().includes(q))
        }
        return r.productName.toLowerCase().includes(q)
      })
    }

    if (typeFilter !== 'All') {
      const target = typeFilter.toLowerCase()
      result = result.filter((r) => r.type === target)
    }

    if (dateFrom) {
      result = result.filter((r) => r.dateTime >= dateFrom)
    }

    if (dateTo) {
      const end = dateTo + 'T23:59:59'
      result = result.filter((r) => r.dateTime <= end)
    }

    return result
  }, [rows, search, typeFilter, dateFrom, dateTo])

  const toggleExpand = (saleId: string) => {
    setExpandedSales((prev) => {
      const next = new Set(prev)
      if (next.has(saleId)) next.delete(saleId)
      else next.add(saleId)
      return next
    })
  }

  const renderQuantity = (qty: number) => {
    if (qty > 0) return `+${qty}`
    return String(qty)
  }

  const restockCount = rows.filter((r) => r.type === 'restock').length
  const saleCount = rows.filter((r) => r.type === 'sale').length
  const adjustmentCount = rows.filter((r) => r.type === 'adjustment').length
  const totalDisplay = restockCount + saleCount + adjustmentCount

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory History</h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by product name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:focus:ring-indigo-400"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-white dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:focus:ring-indigo-400"
        >
          {MOVEMENT_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:focus:ring-indigo-400"
          title="From date"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:focus:ring-indigo-400"
          title="To date"
        />
        {(search || typeFilter !== 'All' || dateFrom || dateTo) && (
          <button
            onClick={() => { setSearch(''); setTypeFilter('All'); setDateFrom(''); setDateTo('') }}
            className="px-3 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
          >
            Clear
          </button>
        )}
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 dark:bg-slate-800 dark:border-slate-700">
          <TableSkeleton rows={5} cols={6} />
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm dark:bg-slate-800 dark:border-slate-700">
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
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm dark:bg-slate-800 dark:border-slate-700">
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
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden dark:bg-slate-800 dark:border-slate-700">
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-card">
              <thead>
                <tr className="text-left text-gray-500 font-medium border-b border-gray-200 bg-gray-50/50 dark:text-slate-400 dark:border-slate-700 dark:bg-slate-700/50">
                  <th className="px-5 py-4">Date & Time</th>
                  <th className="px-5 py-4">Product Name</th>
                  <th className="px-5 py-4">Movement Type</th>
                  <th className="px-5 py-4 text-right">Quantity</th>
                  <th className="px-5 py-4 text-right">Previous Stock</th>
                  <th className="px-5 py-4 text-right">New Stock</th>
                  <th className="px-5 py-4">Notes / Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {filtered.map((row) => {
                  if (row.type === 'sale') {
                    const isExpanded = expandedSales.has(row.saleId)
                    return (
                      <tr key={row.id} className="bg-red-50/40 dark:bg-red-900/10">
                        <td className="px-5 py-4 text-gray-600 whitespace-nowrap dark:text-slate-400" data-label="Date & Time">
                          {formatDate(row.dateTime)}
                        </td>
                        <td className="px-5 py-4 font-medium text-gray-900 dark:text-white" data-label="Product Name">
                          {row.items.length} item{row.items.length !== 1 ? 's' : ''}
                        </td>
                        <td className="px-5 py-4" data-label="Movement Type">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 dark:bg-red-900/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            Sale
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right font-semibold whitespace-nowrap text-red-600 dark:text-red-400" data-label="Quantity">
                          -{row.totalQuantity}
                        </td>
                        <td className="px-5 py-4 text-right text-gray-400 dark:text-slate-500" data-label="Previous Stock">—</td>
                        <td className="px-5 py-4 text-right text-gray-400 dark:text-slate-500 font-medium" data-label="New Stock">—</td>
                        <td className="px-5 py-4" data-label="Notes / Reason">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); toggleExpand(row.saleId) }}
                            className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-800 transition-colors"
                          >
                            {isExpanded ? <ChevronDown /> : <ChevronRight />}
                            {isExpanded ? 'Hide details' : 'View details'}
                          </button>
                        </td>
                      </tr>
                    )
                  }

                  return (
                    <tr
                      key={row.id}
                      onClick={() => setSelected(row)}
                      className="transition-colors hover:bg-gray-50 cursor-pointer dark:hover:bg-slate-700/50"
                    >
                      <td className="px-5 py-4 text-gray-600 whitespace-nowrap dark:text-slate-400" data-label="Date & Time">
                        {formatDate(row.dateTime)}
                      </td>
                      <td className="px-5 py-4 font-medium text-gray-900 dark:text-white" data-label="Product Name">
                        {row.productName}
                      </td>
                      <td className="px-5 py-4" data-label="Movement Type">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          row.type === 'restock'
                            ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            row.type === 'restock' ? 'bg-green-500' : 'bg-orange-500'
                          }`} />
                          {row.type === 'restock' ? 'Restock' : 'Adjustment'}
                        </span>
                      </td>
                      <td className={`px-5 py-4 text-right font-semibold whitespace-nowrap ${
                        row.quantity > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`} data-label="Quantity">
                        {renderQuantity(row.quantity)}
                      </td>
                      <td className="px-5 py-4 text-right text-gray-600 dark:text-slate-400" data-label="Previous Stock">
                        {row.previousStock}
                      </td>
                      <td className="px-5 py-4 text-right text-gray-600 dark:text-slate-400 font-medium" data-label="New Stock">
                        {row.newStock}
                      </td>
                      <td className="px-5 py-4 text-gray-500 max-w-[200px] truncate dark:text-slate-400" data-label="Notes / Reason">
                        {('reason' in row ? row.reason : undefined) || ('supplier' in row ? row.supplier : undefined) || row.notes || '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filtered.some((r) => r.type === 'sale' && expandedSales.has(r.saleId)) && (
            <div className="border-t border-gray-200 divide-y divide-gray-100 dark:border-slate-700 dark:divide-slate-700">
              {filtered.map((row) => {
                if (row.type !== 'sale') return null
                if (!expandedSales.has(row.saleId)) return null
                return (
                  <div key={`expanded-${row.id}`} className="px-5 py-4 bg-red-50/20 dark:bg-red-900/5">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {row.items.map((item, idx) => (
                        <div key={idx} className="text-sm">
                          <span className="text-gray-900 font-medium dark:text-white">{item.productName}</span>
                          <span className="text-gray-500 ml-1.5 dark:text-slate-400">x{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-3 border-t border-red-100 text-sm font-semibold text-gray-900 dark:border-red-800 dark:text-white">
                      Sale Total: ${row.total.toFixed(2)}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400 dark:border-slate-700 dark:text-slate-500">
            {filtered.length} of {totalDisplay} movement{totalDisplay !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {selected && selected.type !== 'sale' && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setSelected(null)}>
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-scale-in max-h-[90vh] overflow-y-auto dark:bg-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Movement Details</h3>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors dark:text-slate-400 dark:hover:text-slate-300 dark:hover:bg-slate-700"
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
                    ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    selected.type === 'restock' ? 'bg-green-500' : 'bg-orange-500'
                  }`} />
                  {selected.type === 'restock' ? 'Restock' : 'Adjustment'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 font-medium dark:text-slate-400">Product Name</p>
                  <p className="text-gray-900 mt-0.5 dark:text-white">{selected.productName}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium dark:text-slate-400">Date & Time</p>
                  <p className="text-gray-900 mt-0.5 dark:text-white">{formatDate(selected.dateTime)}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium dark:text-slate-400">Quantity</p>
                  <p className={`font-semibold mt-0.5 ${
                    selected.quantity > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>{renderQuantity(selected.quantity)}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium dark:text-slate-400">Previous Stock</p>
                  <p className="text-gray-900 mt-0.5 dark:text-white">{selected.previousStock}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium dark:text-slate-400">New Stock</p>
                  <p className="text-gray-900 mt-0.5 dark:text-white">{selected.newStock}</p>
                </div>
                {'supplier' in selected && selected.supplier && (
                  <div className="col-span-2">
                    <p className="text-gray-500 font-medium dark:text-slate-400">Supplier</p>
                    <p className="text-gray-900 mt-0.5 dark:text-white">{selected.supplier}</p>
                  </div>
                )}
                {'reason' in selected && selected.reason && (
                  <div className="col-span-2">
                    <p className="text-gray-500 font-medium dark:text-slate-400">Reason</p>
                    <p className="text-gray-900 mt-0.5 dark:text-white">{selected.reason}</p>
                  </div>
                )}
                {selected.notes && (
                  <div className="col-span-2">
                    <p className="text-gray-500 font-medium dark:text-slate-400">Notes</p>
                    <p className="text-gray-900 mt-0.5 dark:text-white">{selected.notes}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {selected && selected.type === 'sale' && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setSelected(null)}>
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-scale-in max-h-[90vh] overflow-y-auto dark:bg-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sale Details</h3>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors dark:text-slate-400 dark:hover:text-slate-300 dark:hover:bg-slate-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 dark:bg-red-900/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  Sale
                </span>
              </div>

              <div className="text-sm">
                <p className="text-gray-500 font-medium mb-1 dark:text-slate-400">Date & Time</p>
                <p className="text-gray-900 dark:text-white">{formatDate(selected.dateTime)}</p>
              </div>

              <div className="text-sm">
                <p className="text-gray-500 font-medium mb-2 dark:text-slate-400">Items</p>
                <div className="space-y-1.5">
                  {selected.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2 dark:bg-slate-700">
                      <span className="text-gray-900 font-medium dark:text-white">{item.productName}</span>
                      <span className="text-gray-600 dark:text-slate-400">x{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200 text-sm dark:border-slate-700">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium dark:text-slate-400">Sale Total</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">${selected.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
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
