import { useState, useRef, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useAdmin, type OwnerUser, toDate, computeDaysRemaining } from '../../hooks/useAdmin'
import {
  Search, Filter, Eye, Pause, Trash2, X, CreditCard,
  CalendarPlus, RefreshCw, Clock, AlertTriangle, MoreVertical,
} from 'lucide-react'

type ModalState =
  | { type: null }
  | { type: 'view'; user: OwnerUser }
  | { type: 'activate'; user: OwnerUser }
  | { type: 'extendTrial'; user: OwnerUser }
  | { type: 'renew'; user: OwnerUser }
  | { type: 'expire'; user: OwnerUser }
  | { type: 'suspend'; user: OwnerUser }
  | { type: 'delete'; user: OwnerUser }

export default function AdminUsers() {
  const {
    owners, loading, suspendUser, deleteUser,
    activateSubscription, extendTrial, renewSubscription, expireSubscription,
  } = useAdmin()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [modal, setModal] = useState<ModalState>({ type: null })
  const [billingCycle, setBillingCycle] = useState('monthly')
  const [trialDays, setTrialDays] = useState(7)
  const [renewDays, setRenewDays] = useState(30)
  const [processing, setProcessing] = useState(false)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [menuPos, setMenuPos] = useState<{ top: number; right: number }>({ top: 0, right: 0 })
  const menuButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  const handleMenuToggle = useCallback((uid: string) => {
    if (openMenu === uid) {
      setOpenMenu(null)
      return
    }
    const btn = menuButtonRefs.current.get(uid)
    if (btn) {
      const rect = btn.getBoundingClientRect()
      setMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right })
    }
    setOpenMenu(uid)
  }, [openMenu])

  const handleMenuAction = useCallback((action: ModalState) => {
    setOpenMenu(null)
    setModal(action)
  }, [])

  useEffect(() => {
    if (!openMenu) return
    const close = () => setOpenMenu(null)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => {
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [openMenu])

  const filtered = owners.filter((o) => {
    if (search && !o.email.toLowerCase().includes(search.toLowerCase()) && !o.businessType?.toLowerCase().includes(search.toLowerCase())) return false
    if (filterStatus) {
      const subStatus = o.subscription?.status || 'trial'
      if (filterStatus !== subStatus) return false
    }
    return true
  })

  const handleConfirm = async () => {
    if (modal.type === null || modal.type === 'view') return
    const u = modal.user
    setProcessing(true)
    try {
      switch (modal.type) {
        case 'activate':
          await activateSubscription(u.uid, billingCycle)
          break
        case 'extendTrial':
          await extendTrial(u.uid, trialDays)
          break
        case 'renew':
          await renewSubscription(u.uid, renewDays)
          break
        case 'expire':
          await expireSubscription(u.uid)
          break
        case 'suspend':
          await suspendUser(u.uid)
          break
        case 'delete':
          await deleteUser(u.uid)
          break
      }
    } finally {
      setProcessing(false)
      setModal({ type: null })
    }
  }

  const formatDate = (val: unknown) => {
    const d = toDate(val)
    return d ? d.toLocaleDateString() : '—'
  }

  const getStatusBadge = (sub: OwnerUser['subscription']) => {
    const s = sub?.status || 'trial'
    if (s === 'active') return <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-500/10 text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />Active</span>
    if (s === 'trial') return <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-yellow-500/10 text-yellow-400"><span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />Trial</span>
    if (s === 'expired') return <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-red-500/10 text-red-400"><span className="w-1.5 h-1.5 rounded-full bg-red-400" />Expired</span>
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-slate-600 text-slate-300"><span className="w-1.5 h-1.5 rounded-full bg-slate-400" />Cancelled</span>
  }

  const getDaysRemaining = (o: OwnerUser) => {
    const days = computeDaysRemaining(o.subscription)
    if (days === 0) return <span className="text-slate-500">—</span>
    if (days <= 3 && o.subscription?.status === 'trial') {
      return <span className="inline-flex items-center gap-1 text-amber-400 font-semibold text-xs"><AlertTriangle size={12} />{days}d</span>
    }
    if (days <= 7 && o.subscription?.status === 'active') {
      return <span className="inline-flex items-center gap-1 text-amber-400 font-semibold text-xs"><AlertTriangle size={12} />{days}d</span>
    }
    return <span className="text-slate-300 text-xs">{days}d</span>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Manage Stores</h1>
        <p className="text-sm text-slate-400 mt-1">View and manage all registered stores and subscriptions</p>
      </div>

      <div className="rounded-xl bg-slate-800 border border-slate-700/50 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by email or business..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-colors"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="trial">Trial</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-slate-800 border border-slate-700/50 overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-slate-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-sm text-slate-400">No stores found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="px-4 py-3">Business</th>
                  <th className="px-4 py-3">Owner Email</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Days Left</th>
                  <th className="px-4 py-3">Start Date</th>
                  <th className="px-4 py-3">End Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filtered.map((o) => {
                  const sub = o.subscription
                  return (
                    <tr key={o.uid} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                            {o.businessType?.charAt(0) || 'B'}
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">{o.businessType}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-white text-xs">{o.email}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                          (sub?.plan || o.plan) === 'Business' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-700 text-slate-300'
                        }`}>{sub?.plan || o.plan}</span>
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(sub)}</td>
                      <td className="px-4 py-3">{getDaysRemaining(o)}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">
                        {sub?.subscriptionStart ? formatDate(sub.subscriptionStart) : (sub?.trialStart ? formatDate(sub.trialStart) : '—')}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">
                        {sub?.subscriptionEnd ? formatDate(sub.subscriptionEnd) : (sub?.trialEnd ? formatDate(sub.trialEnd) : '—')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          ref={(el) => {
                            if (el) { menuButtonRefs.current.set(o.uid, el) } else { menuButtonRefs.current.delete(o.uid) }
                          }}
                          type="button"
                          onClick={() => handleMenuToggle(o.uid)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                        >
                          <MoreVertical size={14} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal.type === 'view' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setModal({ type: null })}>
          <div className="bg-slate-800 rounded-xl border border-slate-700/50 shadow-2xl max-w-md w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Store Details</h3>
              <button type="button" onClick={() => setModal({ type: null })} className="text-slate-400 hover:text-white transition-colors"><X size={18} /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-700/50"><span className="text-slate-400">Business</span><span className="text-white font-medium">{modal.user.businessType}</span></div>
              <div className="flex justify-between py-2 border-b border-slate-700/50"><span className="text-slate-400">Email</span><span className="text-white font-medium">{modal.user.email}</span></div>
              <div className="flex justify-between py-2 border-b border-slate-700/50"><span className="text-slate-400">Plan</span><span className="text-slate-200">{modal.user.subscription?.plan || modal.user.plan}</span></div>
              <div className="flex justify-between py-2 border-b border-slate-700/50"><span className="text-slate-400">Status</span>{getStatusBadge(modal.user.subscription)}</div>
              <div className="flex justify-between py-2 border-b border-slate-700/50"><span className="text-slate-400">Billing Cycle</span><span className="text-slate-200 capitalize">{modal.user.subscription?.billingCycle || '—'}</span></div>
              <div className="flex justify-between py-2 border-b border-slate-700/50"><span className="text-slate-400">Trial Start</span><span className="text-slate-200">{formatDate(modal.user.subscription?.trialStart)}</span></div>
              <div className="flex justify-between py-2 border-b border-slate-700/50"><span className="text-slate-400">Trial End</span><span className="text-slate-200">{formatDate(modal.user.subscription?.trialEnd)}</span></div>
              <div className="flex justify-between py-2 border-b border-slate-700/50"><span className="text-slate-400">Subscription Start</span><span className="text-slate-200">{formatDate(modal.user.subscription?.subscriptionStart)}</span></div>
              <div className="flex justify-between py-2"><span className="text-slate-400">Subscription End</span><span className="text-slate-200">{formatDate(modal.user.subscription?.subscriptionEnd)}</span></div>
            </div>
            <button type="button" onClick={() => setModal({ type: null })} className="w-full py-2.5 text-sm font-medium text-slate-300 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">Close</button>
          </div>
        </div>
      )}

      {modal.type === 'activate' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setModal({ type: null })}>
          <div className="bg-slate-800 rounded-xl border border-slate-700/50 shadow-2xl max-w-sm w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white">Activate Subscription</h3>
            <p className="text-sm text-slate-400">Activate subscription for <span className="text-white font-medium">{modal.user.email}</span></p>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Billing Cycle</label>
              <select value={billingCycle} onChange={(e) => setBillingCycle(e.target.value)} className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
                <option value="monthly">Monthly (30 days)</option>
                <option value="quarterly">Quarterly (90 days)</option>
                <option value="yearly">Yearly (365 days)</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setModal({ type: null })} className="flex-1 py-2.5 text-sm font-medium text-slate-300 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">Cancel</button>
              <button type="button" onClick={handleConfirm} disabled={processing} className="flex-1 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors">Activate</button>
            </div>
          </div>
        </div>
      )}

      {modal.type === 'extendTrial' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setModal({ type: null })}>
          <div className="bg-slate-800 rounded-xl border border-slate-700/50 shadow-2xl max-w-sm w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white">Extend Trial</h3>
            <p className="text-sm text-slate-400">Extend trial for <span className="text-white font-medium">{modal.user.email}</span></p>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Extend by</label>
              <select value={trialDays} onChange={(e) => setTrialDays(Number(e.target.value))} className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setModal({ type: null })} className="flex-1 py-2.5 text-sm font-medium text-slate-300 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">Cancel</button>
              <button type="button" onClick={handleConfirm} disabled={processing} className="flex-1 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">Extend</button>
            </div>
          </div>
        </div>
      )}

      {modal.type === 'renew' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setModal({ type: null })}>
          <div className="bg-slate-800 rounded-xl border border-slate-700/50 shadow-2xl max-w-sm w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white">Renew Subscription</h3>
            <p className="text-sm text-slate-400">Renew subscription for <span className="text-white font-medium">{modal.user.email}</span></p>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Add duration</label>
              <select value={renewDays} onChange={(e) => setRenewDays(Number(e.target.value))} className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
                <option value={30}>30 days (Monthly)</option>
                <option value={90}>90 days (Quarterly)</option>
                <option value={365}>365 days (Yearly)</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setModal({ type: null })} className="flex-1 py-2.5 text-sm font-medium text-slate-300 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">Cancel</button>
              <button type="button" onClick={handleConfirm} disabled={processing} className="flex-1 py-2.5 text-sm font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors">Renew</button>
            </div>
          </div>
        </div>
      )}

      {modal.type === 'expire' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setModal({ type: null })}>
          <div className="bg-slate-800 rounded-xl border border-slate-700/50 shadow-2xl max-w-sm w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white">Expire Subscription</h3>
            <p className="text-sm text-slate-400">Set subscription to expired for <span className="text-white font-medium">{modal.user.email}</span>?</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setModal({ type: null })} className="flex-1 py-2.5 text-sm font-medium text-slate-300 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">Cancel</button>
              <button type="button" onClick={handleConfirm} disabled={processing} className="flex-1 py-2.5 text-sm font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors">Expire</button>
            </div>
          </div>
        </div>
      )}

      {modal.type === 'suspend' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setModal({ type: null })}>
          <div className="bg-slate-800 rounded-xl border border-slate-700/50 shadow-2xl max-w-sm w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white">Suspend Store</h3>
            <p className="text-sm text-slate-400">Suspend <span className="text-white font-medium">{modal.user.email}</span>? They will lose access.</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setModal({ type: null })} className="flex-1 py-2.5 text-sm font-medium text-slate-300 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">Cancel</button>
              <button type="button" onClick={handleConfirm} disabled={processing} className="flex-1 py-2.5 text-sm font-semibold text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors">Suspend</button>
            </div>
          </div>
        </div>
      )}

      {modal.type === 'delete' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setModal({ type: null })}>
          <div className="bg-slate-800 rounded-xl border border-slate-700/50 shadow-2xl max-w-sm w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white">Delete Store</h3>
            <p className="text-sm text-slate-400">Permanently delete <span className="text-white font-medium">{modal.user.email}</span>? This cannot be undone.</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setModal({ type: null })} className="flex-1 py-2.5 text-sm font-medium text-slate-300 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">Cancel</button>
              <button type="button" onClick={handleConfirm} disabled={processing} className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      {openMenu && createPortal(
        <>
          <div className="fixed inset-0 z-[99]" onClick={() => setOpenMenu(null)} />
          <div
            className="fixed z-[100] w-48 bg-slate-700 border border-slate-600 rounded-xl shadow-2xl overflow-hidden py-1"
            style={{ top: menuPos.top, right: menuPos.right }}
          >
            {(() => {
              const o = owners.find((ow) => ow.uid === openMenu)
              if (!o) return null
              return (
                <>
                  <button type="button" onClick={() => handleMenuAction({ type: 'view', user: o })} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-600 transition-colors"><Eye size={14} /> View Details</button>
                  <button type="button" onClick={() => handleMenuAction({ type: 'activate', user: o })} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-emerald-400 hover:bg-slate-600 transition-colors"><CreditCard size={14} /> Activate Subscription</button>
                  <button type="button" onClick={() => handleMenuAction({ type: 'extendTrial', user: o })} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-blue-400 hover:bg-slate-600 transition-colors"><CalendarPlus size={14} /> Extend Trial</button>
                  <button type="button" onClick={() => handleMenuAction({ type: 'renew', user: o })} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-violet-400 hover:bg-slate-600 transition-colors"><RefreshCw size={14} /> Renew Subscription</button>
                  <button type="button" onClick={() => handleMenuAction({ type: 'expire', user: o })} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-amber-400 hover:bg-slate-600 transition-colors"><Clock size={14} /> Expire Subscription</button>
                  <button type="button" onClick={() => handleMenuAction({ type: 'suspend', user: o })} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-orange-400 hover:bg-slate-600 transition-colors"><Pause size={14} /> Suspend Store</button>
                  <button type="button" onClick={() => handleMenuAction({ type: 'delete', user: o })} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-slate-600 transition-colors"><Trash2 size={14} /> Delete Store</button>
                </>
              )
            })()}
          </div>
        </>,
        document.body
      )}
    </div>
  )
}
