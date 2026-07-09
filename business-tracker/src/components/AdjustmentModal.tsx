import { useState } from 'react'
import type { Product } from '../data/products'

const REASONS = ['Damaged', 'Expired', 'Lost', 'Inventory Correction', 'Personal Use', 'Other'] as const

interface AdjustmentModalProps {
  open: boolean
  product: Product
  onAdjust: (data: {
    productId: string
    productName: string
    adjustmentType: 'increase' | 'decrease'
    quantity: number
    reason: string
    notes?: string
  }) => Promise<void>
  onClose: () => void
}

export default function AdjustmentModal({ open, product, onAdjust, onClose }: AdjustmentModalProps) {
  const [adjustmentType, setAdjustmentType] = useState<'increase' | 'decrease'>('increase')
  const [quantity, setQuantity] = useState('')
  const [reason, setReason] = useState('')
  const [customReason, setCustomReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  const qty = parseInt(quantity, 10)
  const qtyError =
    quantity.trim() === ''
      ? ''
      : isNaN(qty) || qty <= 0
      ? 'Must be a positive number.'
      : adjustmentType === 'decrease' && qty > product.stock
      ? `Only ${product.stock} in stock. Cannot decrease by ${qty}.`
      : ''

  const isValid = qty > 0 && !qtyError && reason !== ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return

    setSaving(true)
    setError('')

    try {
      await onAdjust({
        productId: product.id,
        productName: product.name,
        adjustmentType,
        quantity: qty,
        reason: reason === 'Other' ? `Other: ${customReason}` : reason,
        notes: customReason.trim() ? customReason.trim() : undefined,
      })
      setQuantity('')
      setAdjustmentType('increase')
      setReason('')
      setCustomReason('')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Adjustment failed.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-scale-in max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-gray-900">Adjust Stock</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input
              type="text"
              value={product.name}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-500 bg-gray-50 cursor-not-allowed"
              readOnly
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Stock</label>
            <input
              type="text"
              value={product.stock}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-500 bg-gray-50 cursor-not-allowed"
              readOnly
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adjustment Type <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3">
              <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium cursor-pointer transition-colors ${
                adjustmentType === 'increase'
                  ? 'border-green-400 bg-green-50 text-green-700'
                  : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
              }`}>
                <input
                  type="radio"
                  name="adjustmentType"
                  value="increase"
                  checked={adjustmentType === 'increase'}
                  onChange={() => setAdjustmentType('increase')}
                  className="sr-only"
                />
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Increase
              </label>
              <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium cursor-pointer transition-colors ${
                adjustmentType === 'decrease'
                  ? 'border-red-400 bg-red-50 text-red-700'
                  : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
              }`}>
                <input
                  type="radio"
                  name="adjustmentType"
                  value="decrease"
                  checked={adjustmentType === 'decrease'}
                  onChange={() => setAdjustmentType('decrease')}
                  className="sr-only"
                />
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
                Decrease
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow ${
                qtyError ? 'border-red-400 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="e.g. 10"
              required
            />
            {qtyError && (
              <p className="text-xs text-red-600 mt-1">{qtyError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason <span className="text-red-500">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-white"
              required
            >
              <option value="">Select a reason</option>
              {REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {reason === 'Other' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Custom Details</label>
              <input
                type="text"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                placeholder="Optional"
              />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !isValid}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Applying…
                </>
              ) : (
                'Apply Adjustment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
