import { useState, useMemo } from 'react'
import { useAdmin, type OwnerUser, toDate, computeDaysRemaining } from '../../hooks/useAdmin'
import {
  Search, Filter, ArrowUpDown, CreditCard, CalendarPlus,
  RefreshCw, Clock, Ban, AlertTriangle, CheckSquare,
} from 'lucide-react'

export default function AdminSubscriptions() {
  const { owners, loading, activateSubscription, extendTrial, renewSubscription, expireSubscription, cancelSubscription } = useAdmin()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [sortExpiry, setSortExpiry] = useState<'asc' | 'desc' | ''>('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkAction, setBulkAction] = useState('')
  const [processing, setProcessing] = useState<string | null>(null)
  const [inlineAction, setInlineAction] = useState<{ uid: string; action: string } | null>(null)
  const [billingCycle, setBillingCycle] = useState('monthly')
  const [trialDays, setTrialDays] = useState(7)
  const [renewDays, setRenewDays] = useState(30)

  const filtered = useMemo(() => {
    let result = owners.filter((o) => {
      if (search && !o.email.toLowerCase().includes(search.toLowerCase()) && !o.businessType?.toLowerCase().includes(search.toLowerCase())) return false
      if (filterStatus) {
        const subStatus = o.subscription?.status || 'trial'
        if (filterStatus !== subStatus) return false
      }
      return true
    })
    if (sortExpiry) {
      result.sort((a, b) => {
        const aEnd = toDate(a.subscription?.subscriptionEnd || a.subscription?.trialEnd)
        const bEnd = toDate(b.subscription?.subscriptionEnd || b.subscription?.trialEnd)
        const aTime = aEnd?.getTime() ?? 0
        const bTime = bEnd?.getTime() ?? 0
        return sortExpiry === 'asc' ? aTime - bTime : bTime - aTime
      })
    }
    return result
  }, [owners, search, filterStatus, sortExpiry])

  const toggleSelect = (uid: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(uid)) next.delete(uid)
      else next.add(uid)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selected.size === filtered.length) setSelected(new Set())
    else setSelected(new Set(filtered.map((o) => o.uid)))
  }

  const handleBulk = async () => {
    if (!bulkAction || selected.size === 0) return
    setProcessing('bulk')
    try {
      for (const uid of selected) {
        if (bulkAction === 'expire') await expireSubscription(uid)
        else if (bulkAction === 'cancel') await cancelSubscription(uid)
      }
    } finally {
      setProcessing(null)
      setSelected(new Set())
      setBulkAction('')
    }
  }

  const handleInline = async () => {
    if (!inlineAction) return
    setProcessing(inlineAction.uid)
    try {
      const { uid, action } = inlineAction
      if (action === 'activate') await activateSubscription(uid, billingCycle)
      else if (action === 'extendTrial') await extendTrial(uid, trialDays)
      else if (action === 'renew') await renewSubscription(uid, renewDays)
      else if (action === 'expire') await expireSubscription(uid)
      else if (action === 'cancel') await cancelSubscription(uid)
    } finally {
      setProcessing(null)
      setInlineAction(null)
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

  const counts = useMemo(() => ({
    active: owners.filter((o) => o.subscription?.status === 'active').length,
    trial: owners.filter((o) => (o.subscription?.status || 'trial') === 'trial').length,
    expired: owners.filter((o) => o.subscription?.status === 'expired').length,
    cancelled: owners.filter((o) => o.subscription?.status === 'cancelled').length,
  }), [owners])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Subscriptions</h1>
        <p className="text-sm text-slate-400 mt-1">Manage all store subscriptions and billing</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Active', value: counts.active, color: 'text-emerald-400 bg-emerald-500/10' },
          { label: 'Trial', value: counts.trial, color: 'text-yellow-400 bg-yellow-500/10' },
          { label: 'Expired', value: counts.expired, color: 'text-red-400 bg-red-500/10' },
          { label: 'Cancelled', value: counts.cancelled, color: 'text-slate-400 bg-slate-700' },
        ].map((c) => (
          <div key={c.label} className="rounded-xl bg-slate-800 border border-slate-700/50 p-3 text-center">
            <p className={`text-xl font-bold ${c.color.split(' ')[0]}`}>{c.value}</p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-slate-800 border border-slate-700/50 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input type="text" placeholder="Search by email or business..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-colors" />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-500" />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-colors">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="trial">Trial</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button type="button" onClick={() => setSortExpiry(sortExpiry === 'asc' ? 'desc' : sortExpiry === 'desc' ? '' : 'asc')} className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-sm text-slate-300 hover:bg-slate-700 transition-colors">
              <ArrowUpDown size={14} />
              <span className="hidden sm:inline">{sortExpiry === 'asc' ? 'Expiry ↑' : sortExpiry === 'desc' ? 'Expiry ↓' : 'Sort'}</span>
            </button>
          </div>
        </div>
        {selected.size > 0 && (
          <div className="mt-3 flex items-center gap-3 pt-3 border-t border-slate-700/50">
            <span className="text-xs text-slate-400">{selected.size} selected</span>
            <select value={bulkAction} onChange={(e) => setBulkAction(e.target.value)} className="px-3 py-1.5 bg-slate-700/50 border border-slate-600/50 rounded-lg text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
              <option value="">Bulk action...</option>
              <option value="expire">Expire All</option>
              <option value="cancel">Cancel All</option>
            </select>
            <button type="button" onClick={handleBulk} disabled={!bulkAction || processing === 'bulk'} className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors">
              {processing === 'bulk' ? 'Processing...' : 'Apply'}
            </button>
          </div>
        )}
      </div>

      <div className="rounded-xl bg-slate-800 border border-slate-700/50 overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-slate-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-sm text-slate-400">No subscriptions found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="px-4 py-3 w-8"><input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleSelectAll} className="rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500/50" /></th>
                  <th className="px-4 py-3">Store</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Days Left</th>
                  <th className="px-4 py-3">Billing</th>
                  <th className="px-4 py-3">Start</th>
                  <th className="px-4 py-3">End</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filtered.map((o) => {
                  const sub = o.subscription
                  const days = computeDaysRemaining(sub)
                  const isExpiringSoon = days > 0 && days <= 3
                  return (
                    <tr key={o.uid} className={`hover:bg-slate-700/30 transition-colors ${selected.has(o.uid) ? 'bg-slate-700/20' : ''}`}>
                      <td className="px-4 py-3"><input type="checkbox" checked={selected.has(o.uid)} onChange={() => toggleSelect(o.uid)} className="rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500/50" /></td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-xs font-medium text-white">{o.email}</p>
                          <p className="text-[10px] text-slate-400">{o.businessType}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3"><span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full ${(sub?.plan || o.plan) === 'Business' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-700 text-slate-300'}`}>{sub?.plan || o.plan}</span></td>
                      <td className="px-4 py-3">{getStatusBadge(sub)}</td>
                      <td className="px-4 py-3">
                        {isExpiringSoon ? (
                          <span className="inline-flex items-center gap-1 text-amber-400 font-semibold text-xs"><AlertTriangle size={12} />{days}d</span>
                        ) : days > 0 ? (
                          <span className="text-slate-300 text-xs">{days}d</span>
                        ) : <span className="text-slate-500">—</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400 capitalize">{sub?.billingCycle || '—'}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">{sub?.subscriptionStart ? formatDate(sub.subscriptionStart) : formatDate(sub?.trialStart)}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">{sub?.subscriptionEnd ? formatDate(sub.subscriptionEnd) : formatDate(sub?.trialEnd)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {(sub?.status === 'trial' || sub?.status === 'expired') && (
                            <button type="button" disabled={processing === o.uid} onClick={() => setInlineAction({ uid: o.uid, action: 'activate' })} className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-50 transition-colors" title="Activate"><CreditCard size={14} /></button>
                          )}
                          {sub?.status === 'trial' && (
                            <button type="button" disabled={processing === o.uid} onClick={() => setInlineAction({ uid: o.uid, action: 'extendTrial' })} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 disabled:opacity-50 transition-colors" title="Extend Trial"><CalendarPlus size={14} /></button>
                          )}
                          {sub?.status === 'active' && (
                            <button type="button" disabled={processing === o.uid} onClick={() => setInlineAction({ uid: o.uid, action: 'renew' })} className="p-1.5 rounded-lg text-slate-400 hover:text-violet-400 hover:bg-violet-500/10 disabled:opacity-50 transition-colors" title="Renew"><RefreshCw size={14} /></button>
                          )}
                          {(sub?.status === 'active' || sub?.status === 'trial') && (
                            <button type="button" disabled={processing === o.uid} onClick={() => setInlineAction({ uid: o.uid, action: 'expire' })} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 disabled:opacity-50 transition-colors" title="Expire"><Clock size={14} /></button>
                          )}
                          {sub?.status !== 'cancelled' && (
                            <button type="button" disabled={processing === o.uid} onClick={() => setInlineAction({ uid: o.uid, action: 'cancel' })} className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition-colors" title="Cancel"><Ban size={14} /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {inlineAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setInlineAction(null)}>
          <div className="bg-slate-800 rounded-xl border border-slate-700/50 shadow-2xl max-w-sm w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white capitalize">
              {inlineAction.action === 'extendTrial' ? 'Extend Trial' : inlineAction.action}
            </h3>
            <p className="text-sm text-slate-400">
              {inlineAction.action === 'activate' && <>Activate subscription for <span className="text-white font-medium">{owners.find((o) => o.uid === inlineAction.uid)?.email}</span></>}
              {inlineAction.action === 'extendTrial' && <>Extend trial for <span className="text-white font-medium">{owners.find((o) => o.uid === inlineAction.uid)?.email}</span></>}
              {inlineAction.action === 'renew' && <>Renew subscription for <span className="text-white font-medium">{owners.find((o) => o.uid === inlineAction.uid)?.email}</span></>}
              {inlineAction.action === 'expire' && <>Set subscription to expired?</>}
              {inlineAction.action === 'cancel' && <>Cancel subscription for <span className="text-white font-medium">{owners.find((o) => o.uid === inlineAction.uid)?.email}</span>?</>}
            </p>
            {inlineAction.action === 'activate' && (
              <select value={billingCycle} onChange={(e) => setBillingCycle(e.target.value)} className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
                <option value="monthly">Monthly (30 days)</option>
                <option value="quarterly">Quarterly (90 days)</option>
                <option value="yearly">Yearly (365 days)</option>
              </select>
            )}
            {inlineAction.action === 'extendTrial' && (
              <select value={trialDays} onChange={(e) => setTrialDays(Number(e.target.value))} className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
              </select>
            )}
            {inlineAction.action === 'renew' && (
              <select value={renewDays} onChange={(e) => setRenewDays(Number(e.target.value))} className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
                <option value={30}>30 days</option>
                <option value={90}>90 days</option>
                <option value={365}>365 days</option>
              </select>
            )}
            <div className="flex gap-3">
              <button type="button" onClick={() => setInlineAction(null)} className="flex-1 py-2.5 text-sm font-medium text-slate-300 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">Cancel</button>
              <button type="button" onClick={handleInline} disabled={processing === inlineAction.uid} className="flex-1 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                {processing === inlineAction.uid ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
