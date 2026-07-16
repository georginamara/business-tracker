import { useState, useEffect } from 'react'
import { useStore } from '../hooks/useStore'
import { useTheme } from '../hooks/useTheme'
import { useAuth } from '../hooks/useAuth'
import { useBusiness } from '../hooks/useBusiness'
import { BUSINESS_TYPES, type BusinessType } from '../data/store'
import { CardSkeleton } from '../components/Skeleton'
import DemoDataConfirmModal from '../components/DemoDataConfirmModal'
import ClearDemoConfirmModal from '../components/ClearDemoConfirmModal'
import { generateDemoData, clearDemoData } from '../lib/demoDataGenerator'

export default function StoreSettings() {
  const { store, loading, updateStore } = useStore()
  const { theme, toggleTheme } = useTheme()
  const { user } = useAuth()
  const { refreshProducts } = useBusiness()

  const [storeName, setStoreName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [currency, setCurrency] = useState('PHP')
  const [lowStockThreshold, setLowStockThreshold] = useState('5')
  const [businessType, setBusinessType] = useState<BusinessType>('Sari-sari Store')

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [dirty, setDirty] = useState(false)

  const [demoModalOpen, setDemoModalOpen] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)
  const [demoToast, setDemoToast] = useState('')

  const [clearModalOpen, setClearModalOpen] = useState(false)
  const [clearLoading, setClearLoading] = useState(false)

  useEffect(() => {
    if (store) {
      setStoreName(store.storeName)
      setOwnerName(store.ownerName)
      setPhone(store.phone)
      setEmail(store.email)
      setAddress(store.address)
      setCurrency(store.currency)
      setLowStockThreshold(String(store.lowStockThreshold))
      setBusinessType(store.businessType || 'Sari-sari Store')
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
        businessType,
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
      setBusinessType(store.businessType || 'Sari-sari Store')
    }
    setErrors({})
    setSuccess(false)
    setDirty(false)
  }

  const markDirty = () => { if (!dirty) setDirty(true) }

  const handleGenerateDemoData = async () => {
    if (!user) return
    setDemoLoading(true)
    try {
      await generateDemoData(user.uid)
      setDemoToast('Demo data generated successfully.')
      setDemoModalOpen(false)
      setTimeout(() => setDemoToast(''), 4000)
    } catch (err) {
      console.error('[DEMO-UI] generateDemoData threw:', err)
      setDemoToast('Failed to generate demo data. Please try again.')
      setTimeout(() => setDemoToast(''), 4000)
    } finally {
      setDemoLoading(false)
    }
  }

  const handleClearDemoData = async () => {
    if (!user) return
    setClearLoading(true)
    try {
      await clearDemoData(user.uid)
      await refreshProducts()
      setDemoToast('Demo data removed successfully.')
      setClearModalOpen(false)
      setTimeout(() => setDemoToast(''), 4000)
    } catch (err) {
      console.error('[DEMO-UI] clearDemoData threw:', err)
      setDemoToast('Failed to remove demo data.')
      setTimeout(() => setDemoToast(''), 4000)
    } finally {
      setClearLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-8 w-48 rounded-lg bg-gray-200 dark:bg-slate-700 animate-pulse" />
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6 space-y-5">
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Store Settings</h2>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">General Information</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Manage your store profile and preferences.</p>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Store Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => { setStoreName(e.target.value); markDirty(); setErrors((prev) => ({ ...prev, storeName: '' })) }}
              className={`w-full rounded-lg border px-3 py-2.5 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 transition-shadow ${errors.storeName ? 'border-red-400' : 'border-gray-300 dark:border-slate-600'}`}
            />
            {errors.storeName && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.storeName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Business Type</label>
            <select
              value={businessType}
              onChange={(e) => { setBusinessType(e.target.value as BusinessType); markDirty() }}
              className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2.5 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 transition-shadow"
            >
              {BUSINESS_TYPES.map((bt) => (
                <option key={bt} value={bt}>{bt}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Owner Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={ownerName}
              onChange={(e) => { setOwnerName(e.target.value); markDirty(); setErrors((prev) => ({ ...prev, ownerName: '' })) }}
              className={`w-full rounded-lg border px-3 py-2.5 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 transition-shadow ${errors.ownerName ? 'border-red-400' : 'border-gray-300 dark:border-slate-600'}`}
            />
            {errors.ownerName && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.ownerName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); markDirty(); setErrors((prev) => ({ ...prev, phone: '' })) }}
              className={`w-full rounded-lg border px-3 py-2.5 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 transition-shadow ${errors.phone ? 'border-red-400' : 'border-gray-300 dark:border-slate-600'}`}
              placeholder="+63 912 345 6789"
            />
            {errors.phone && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              readOnly
              className="w-full rounded-lg border border-gray-200 dark:border-slate-600 px-3 py-2.5 text-sm bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-slate-400 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Email is managed through Firebase Authentication.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Address</label>
            <textarea
              value={address}
              onChange={(e) => { setAddress(e.target.value); markDirty() }}
              rows={3}
              className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2.5 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 transition-shadow resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => { setCurrency(e.target.value); markDirty() }}
                className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2.5 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 transition-shadow"
              >
                <option value="PHP">PHP (₱)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Low Stock Threshold <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={lowStockThreshold}
                onChange={(e) => { setLowStockThreshold(e.target.value); markDirty(); setErrors((prev) => ({ ...prev, lowStockThreshold: '' })) }}
                className={`w-full rounded-lg border px-3 py-2.5 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 transition-shadow ${errors.lowStockThreshold ? 'border-red-400' : 'border-gray-300 dark:border-slate-600'}`}
              />
              {errors.lowStockThreshold && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.lowStockThreshold}</p>}
            </div>
          </div>

          {errors.general && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-400">{errors.general}</div>
          )}

          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 text-sm text-green-700 dark:text-green-400">Settings saved successfully!</div>
          )}

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-200 dark:border-slate-700">
            <button
              type="button"
              onClick={handleReset}
              disabled={!dirty || saving}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors disabled:opacity-50"
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

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Appearance</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Toggle between light and dark mode.</p>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${theme === 'dark' ? 'bg-indigo-900/30 text-indigo-400' : 'bg-amber-50 text-amber-600'}`}>
                {theme === 'dark' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">{theme === 'dark' ? 'Dark theme is active' : 'Light theme is active'}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${theme === 'dark' ? 'bg-indigo-600' : 'bg-gray-300'}`}
              aria-label="Toggle theme"
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Demo Data</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Populate your store with sample data for demonstration purposes.</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Load Demo Data</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">Creates sample products, sales, expenses, credits, and inventory records.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setDemoModalOpen(true)}
              disabled={demoLoading || clearLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-lg transition-colors disabled:opacity-50"
            >
              {demoLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating…
                </>
              ) : (
                'Load Demo Data'
              )}
            </button>
          </div>

          <div className="border-t border-gray-100 dark:border-slate-700 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Clear Demo Data</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Remove all sample products, sales, expenses, credits, and inventory records.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setClearModalOpen(true)}
                disabled={clearLoading || demoLoading}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors disabled:opacity-50"
              >
                {clearLoading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Clearing…
                  </>
                ) : (
                  'Clear Demo Data'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <DemoDataConfirmModal
        open={demoModalOpen}
        loading={demoLoading}
        onConfirm={handleGenerateDemoData}
        onClose={() => { setDemoModalOpen(false); setDemoLoading(false) }}
      />

      <ClearDemoConfirmModal
        open={clearModalOpen}
        loading={clearLoading}
        onConfirm={handleClearDemoData}
        onClose={() => { setClearModalOpen(false); setClearLoading(false) }}
      />

      {demoToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-fade-in">
          {demoToast}
        </div>
      )}
    </div>
  )
}
