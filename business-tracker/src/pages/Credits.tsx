import { useState, useMemo } from 'react'
import type { Timestamp } from 'firebase/firestore'
import { useBusiness } from '../hooks/useBusiness'
import { useStore } from '../hooks/useStore'
import type { Credit } from '../data/credits'
import EmptyState from '../components/EmptyState'
import { TableSkeleton } from '../components/Skeleton'

const STATUS_FILTERS = ['All', 'Unpaid', 'Partial', 'Paid'] as const

function formatCurrency(amount: number, currency = '$'): string {
  const symbols: Record<string, string> = { PHP: '₱', USD: '$', EUR: '€', GBP: '£', JPY: '¥' }
  const sym = symbols[currency] || '$'
  return `${sym}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function toDate(ts: Timestamp | string | undefined): Date {
  if (!ts) return new Date()
  if (typeof ts === 'string') return new Date(ts)
  return ts.toDate()
}

function formatDate(ts: Timestamp | string | undefined) {
  try {
    const d = toDate(ts)
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return String(ts)
  }
}

function statusBadge(status: Credit['status']) {
  const map: Record<Credit['status'], { bg: string; text: string }> = {
    Unpaid: { bg: 'bg-red-50', text: 'text-red-700' },
    Partial: { bg: 'bg-amber-50', text: 'text-amber-700' },
    Paid: { bg: 'bg-green-50', text: 'text-green-700' },
  }
  const { bg, text } = map[status]
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
      {status}
    </span>
  )
}

export default function Credits() {
  const { credits, receiveCreditPayment, loading } = useBusiness()
  const { store } = useStore()
  const currency = store?.currency ?? 'USD'

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [selected, setSelected] = useState<Credit | null>(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paySaving, setPaySaving] = useState(false)
  const [payError, setPayError] = useState('')
  const [paySuccess, setPaySuccess] = useState('')

  const filtered = useMemo(() => {
    let result = credits

    if (search) {
      const q = search.toLowerCase()
      result = result.filter((c) => c.customerName.toLowerCase().includes(q))
    }

    if (statusFilter !== 'All') {
      result = result.filter((c) => c.status === statusFilter)
    }

    return result.sort((a, b) => {
      const aSec = typeof a.createdAt === 'string' ? new Date(a.createdAt).getTime() / 1000 : (a.createdAt?.seconds ?? 0)
      const bSec = typeof b.createdAt === 'string' ? new Date(b.createdAt).getTime() / 1000 : (b.createdAt?.seconds ?? 0)
      return bSec - aSec
    })
  }, [credits, search, statusFilter])

  const handleView = (credit: Credit) => {
    setSelected(credit)
    setPaymentAmount('')
    setPayError('')
    setPaySuccess('')
  }

  const handleReceivePayment = async () => {
    if (!selected) return

    const amount = parseFloat(paymentAmount)
    if (isNaN(amount) || amount <= 0) {
      setPayError('Payment must be greater than zero.')
      return
    }

    if (amount > selected.remainingBalance) {
      setPayError(`Payment cannot exceed remaining balance of ${formatCurrency(selected.remainingBalance, currency)}.`)
      return
    }

    setPaySaving(true)
    setPayError('')
    setPaySuccess('')

    try {
      await receiveCreditPayment(selected.id, amount)
      setPaySuccess(`Payment of ${formatCurrency(amount, currency)} received!`)
      setPaymentAmount('')
      setSelected((prev) => prev ? {
        ...prev,
        amountPaid: prev.amountPaid + amount,
        remainingBalance: prev.remainingBalance - amount,
        status: prev.remainingBalance - amount === 0 ? 'Paid' : 'Partial',
      } : null)
    } catch (err) {
      setPayError(err instanceof Error ? err.message : 'Payment failed.')
    } finally {
      setPaySaving(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Credits</h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-slate-600 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-white dark:bg-slate-700 dark:text-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-white dark:bg-slate-700 dark:text-white"
        >
          {STATUS_FILTERS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-5">
          <TableSkeleton rows={5} cols={5} />
        </div>
      ) : credits.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
          <EmptyState
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            }
            title="No customer credits"
            description="Credits given to customers will appear here."
            action={
              <p className="text-xs text-gray-400 dark:text-slate-500">
                Credits are created through the POS when using credit payment.
              </p>
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
            title="No matching records"
            description="Try adjusting your filters."
          />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-card">
              <thead>
                <tr className="text-left text-gray-500 dark:text-slate-400 font-medium border-b border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-700/50">
                  <th className="px-5 py-4">Customer Name</th>
                  <th className="px-5 py-4 text-right">Outstanding Balance</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Date Created</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {filtered.map((credit) => (
                  <tr key={credit.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-slate-700/50 group">
                    <td className="px-5 py-4 font-medium text-gray-900 dark:text-white" data-label="Customer">
                      {credit.customerName}
                      {credit.contactNumber && (
                        <span className="block text-xs text-gray-400 dark:text-slate-500 font-normal mt-0.5">{credit.contactNumber}</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right font-semibold text-gray-900 dark:text-white" data-label="Balance">
                      {formatCurrency(credit.remainingBalance, currency)}
                    </td>
                    <td className="px-5 py-4" data-label="Status">
                      {statusBadge(credit.status)}
                    </td>
                    <td className="px-5 py-4 text-gray-600 dark:text-slate-400" data-label="Date">
                      {formatDate(credit.createdAt)}
                    </td>
                    <td className="px-5 py-4 text-right" data-label="">
                      <button
                        onClick={() => handleView(credit)}
                        className="px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 rounded-lg transition-colors"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-gray-100 dark:border-slate-700 text-xs text-gray-400 dark:text-slate-500">
            {filtered.length} of {credits.length} credit{credits.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in" onClick={() => { setSelected(null); setPayError(''); setPaySuccess('') }}>
          <div
            className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg p-6 animate-scale-in max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Credit Details</h3>
              <button
                type="button"
                onClick={() => { setSelected(null); setPayError(''); setPaySuccess('') }}
                className="p-1 rounded-md text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3">
                {statusBadge(selected.status)}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-slate-400 font-medium">Customer Name</p>
                  <p className="text-gray-900 dark:text-white mt-0.5">{selected.customerName}</p>
                </div>
                {selected.contactNumber && (
                  <div>
                    <p className="text-gray-500 dark:text-slate-400 font-medium">Contact Number</p>
                    <p className="text-gray-900 dark:text-white mt-0.5">{selected.contactNumber}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-500 dark:text-slate-400 font-medium">Total Amount</p>
                  <p className="text-gray-900 dark:text-white mt-0.5 font-semibold">{formatCurrency(selected.totalAmount, currency)}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-slate-400 font-medium">Amount Paid</p>
                  <p className="text-green-600 mt-0.5 font-semibold">{formatCurrency(selected.amountPaid, currency)}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-slate-400 font-medium">Remaining Balance</p>
                  <p className={`mt-0.5 font-semibold ${selected.remainingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(selected.remainingBalance, currency)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-slate-400 font-medium">Created Date</p>
                  <p className="text-gray-900 dark:text-white mt-0.5">{formatDate(selected.createdAt)}</p>
                </div>
              </div>

              {selected.notes && (
                <div className="text-sm">
                  <p className="text-gray-500 dark:text-slate-400 font-medium">Notes</p>
                  <p className="text-gray-900 dark:text-white mt-0.5">{selected.notes}</p>
                </div>
              )}

              {selected.items.length > 0 && (
                <div className="text-sm">
                  <p className="text-gray-500 dark:text-slate-400 font-medium mb-2">Items Purchased</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs table-card">
                      <thead>
                        <tr className="text-left text-gray-400 dark:text-slate-500 font-medium border-b border-gray-100 dark:border-slate-700">
                          <th className="pb-2 pr-3">Product</th>
                          <th className="pb-2 pr-3 text-right">Qty</th>
                          <th className="pb-2 pr-3 text-right">Price</th>
                          <th className="pb-2 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 dark:divide-slate-700">
                        {selected.items.map((item, i) => (
                          <tr key={i}>
                            <td className="py-1.5 pr-3 text-gray-900 dark:text-white">{item.productName}</td>
                            <td className="py-1.5 pr-3 text-right text-gray-600 dark:text-slate-400">{item.quantity}</td>
                            <td className="py-1.5 pr-3 text-right text-gray-600 dark:text-slate-400">{formatCurrency(item.unitPrice, currency)}</td>
                            <td className="py-1.5 text-right text-gray-900 dark:text-white font-medium">{formatCurrency(item.subtotal, currency)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {selected.status !== 'Paid' && (
              <div className="border-t border-gray-200 dark:border-slate-700 pt-4 space-y-3">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Receive Payment</h4>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={paymentAmount}
                      onChange={(e) => { setPaymentAmount(e.target.value); setPayError(''); setPaySuccess('') }}
                      placeholder={`0.00 (max ${formatCurrency(selected.remainingBalance, currency)})`}
                      className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-white dark:bg-slate-700 dark:text-white"
                    />
                    {payError && <p className="text-xs text-red-600 mt-1">{payError}</p>}
                    {paySuccess && <p className="text-xs text-green-600 mt-1">{paySuccess}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={handleReceivePayment}
                    disabled={paySaving || !paymentAmount}
                    className="shrink-0 px-5 py-2.5 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 active:bg-purple-800 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {paySaving ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      'Pay'
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => { setSelected(null); setPayError(''); setPaySuccess('') }}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
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
