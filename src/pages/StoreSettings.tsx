import { useState, useEffect } from 'react'
import { useStore } from '../hooks/useStore'
import { CardSkeleton } from '../components/Skeleton'

export default function StoreSettings() {
  const { store, loading, updateStore } = useStore()

  const [storeName, setStoreName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [currency, setCurrency] = useState('PHP')
  const [lowStockThreshold, setLowStockThreshold] = useState('5')

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (store) {
      setStoreName(store.storeName)
      setOwnerName(store.ownerName)
      setPhone(store.phone)
      setEmail(store.email)
      setAddress(store.address)
      setCurrency(store.currency)
      setLowStockThreshold(String(store.lowStockThreshold))
      setDirty(false)
    }
  }, [store])

  const validate = (): boolean => {
    const errs: Record<string, string> = {}

    if (!storeName.trim()) errs.storeName = 'Store Name is required.'
    if (!ownerName.trim()) errs.ownerName = 'Owner Name is required.'
    if (phone.trim() && !/^[\d\s\-+()]{6,20}$/.test(phone.trim())) {
      errs.phone = 'Please enter a valid phone number.'
    }
    const threshold = parseInt(lowStockThreshold, 10)
    if (isNaN(threshold) || threshold < 1) {
      errs.lowStockThreshold = 'Low Stock Threshold must be 1 or more.'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    setSuccess(false)
    try {
      await updateStore({
        storeName: storeName.trim(),
        ownerName: ownerName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        currency,
        lowStockThreshold: parseInt(lowStockThreshold, 10),
      })
      setSuccess(true)
      setDirty(false)
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setErrors({ general: 'Failed to save. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (store) {
      setStoreName(store.storeName)
      setOwnerName(store.ownerName)
      setPhone(store.phone)
      setEmail(store.email)
      setAddress(store.address)
      setCurrency(store.currency)
      setLowStockThreshold(String(store.lowStockThreshold))
    }
    setErrors({})
    setSuccess(false)
    setDirty(false)
  }

  const markDirty = () => { if (!dirty) setDirty(true) }

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-8 w-48 rounded-lg bg-gray-200 animate-pulse" />
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Store Settings</h2>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">General Information</h3>
          <p className="text-sm text-gray-500 mt-0.5">Manage your store profile and preferences.</p>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Store Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => { setStoreName(e.target.value); markDirty(); setErrors((prev) => ({ ...prev, storeName: '' })) }}
              className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow ${errors.storeName ? 'border-red-400' : 'border-gray-300'}`}
            />
            {errors.storeName && <p className="text-xs text-red-600 mt-1">{errors.storeName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Owner Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={ownerName}
              onChange={(e) => { setOwnerName(e.target.value); markDirty(); setErrors((prev) => ({ ...prev, ownerName: '' })) }}
              className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow ${errors.ownerName ? 'border-red-400' : 'border-gray-300'}`}
            />
            {errors.ownerName && <p className="text-xs text-red-600 mt-1">{errors.ownerName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); markDirty(); setErrors((prev) => ({ ...prev, phone: '' })) }}
              className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow ${errors.phone ? 'border-red-400' : 'border-gray-300'}`}
              placeholder="+63 912 345 6789"
            />
            {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              readOnly
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">Email is managed through Firebase Authentication.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              value={address}
              onChange={(e) => { setAddress(e.target.value); markDirty() }}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => { setCurrency(e.target.value); markDirty() }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
              >
                <option value="PHP">PHP (₱)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Low Stock Threshold <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={lowStockThreshold}
                onChange={(e) => { setLowStockThreshold(e.target.value); markDirty(); setErrors((prev) => ({ ...prev, lowStockThreshold: '' })) }}
                className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow ${errors.lowStockThreshold ? 'border-red-400' : 'border-gray-300'}`}
              />
              {errors.lowStockThreshold && <p className="text-xs text-red-600 mt-1">{errors.lowStockThreshold}</p>}
            </div>
          </div>

          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{errors.general}</div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">Settings saved successfully!</div>
          )}

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={handleReset}
              disabled={!dirty || saving}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Reset Changes
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg transition-colors shadow-sm disabled:opacity-50"
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
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
