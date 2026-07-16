import { useEffect, useState, useMemo } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from './useAuth'
import { useAdmin } from './useAdmin'
import type { Store } from '../data/store'
import type { Subscription } from '../data/subscription'
import type { PlatformAnalytics } from '../data/platformAnalytics'
import { PLAN_PRICES } from '../data/plans'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function getStartOfToday(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function getStartOfMonth(): Date {
  const d = new Date()
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d
}

function getStartOfLastMonth(): Date {
  const d = new Date()
  d.setMonth(d.getMonth() - 1)
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d
}

function daysAgo(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(0, 0, 0, 0)
  return d
}

export function usePlatformAnalytics() {
  const { user } = useAuth()
  const { isSuperAdmin, loading: adminLoading } = useAdmin()
  const uid = user?.uid

  const [stores, setStores] = useState<Store[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isSuperAdmin) return

    let cancelled = false

    const fetch = async () => {
      setLoading(true)
      setError(null)

      try {
        const [storesSnap, subsSnap] = await Promise.all([
          getDocs(collection(db, 'stores')),
          getDocs(collection(db, 'subscriptions')),
        ])

        if (cancelled) return

        const storeList: Store[] = []
        storesSnap.forEach((doc) => {
          if (doc.id === uid) return
          storeList.push({ ...doc.data() } as Store)
        })

        const subList: Subscription[] = []
        subsSnap.forEach((doc) => {
          if (doc.id === uid) return
          subList.push({ ...doc.data() } as Subscription)
        })

        setStores(storeList)
        setSubscriptions(subList)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load analytics data')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetch()

    return () => {
      cancelled = true
    }
  }, [isSuperAdmin, uid])

  const analytics: PlatformAnalytics | null = useMemo(() => {
    if (stores.length === 0 && subscriptions.length === 0) return null

    const todayStart = getStartOfToday()
    const monthStart = getStartOfMonth()
    const lastMonthStart = getStartOfLastMonth()
    const thirtyDaysAgo = daysAgo(30)

    const activeAccounts = subscriptions.filter((s) => s.status === 'active').length
    const trialAccounts = subscriptions.filter((s) => s.status === 'trial').length
    const expiredAccounts = subscriptions.filter((s) => s.status === 'expired').length
    const suspendedAccounts = subscriptions.filter((s) => s.accountStatus === 'suspended').length
    const disabledAccounts = subscriptions.filter((s) => s.accountStatus === 'disabled').length

    const starterPlans = subscriptions.filter((s) => s.plan === 'Starter').length
    const businessPlans = subscriptions.filter((s) => s.plan === 'Business').length
    const proPlans = subscriptions.filter((s) => s.plan === 'Pro').length

    const todaysLogins = subscriptions.filter((s) => {
      if (!s.lastLoginAt) return false
      return s.lastLoginAt.toMillis() >= todayStart.getTime()
    }).length

    const newStoresThisMonth = stores.filter((s) => {
      if (!s.createdAt) return false
      return s.createdAt.toMillis() >= monthStart.getTime()
    }).length

    const lastMonthStores = stores.filter((s) => {
      if (!s.createdAt) return false
      const t = s.createdAt.toMillis()
      return t >= lastMonthStart.getTime() && t < monthStart.getTime()
    }).length

    const monthlyGrowthRate =
      lastMonthStores > 0
        ? Math.round(((newStoresThisMonth - lastMonthStores) / lastMonthStores) * 100)
        : newStoresThisMonth > 0
        ? 100
        : 0

    const nonTrialCount = activeAccounts + expiredAccounts
    const trialConversionRate =
      nonTrialCount > 0
        ? Math.round((activeAccounts / nonTrialCount) * 100)
        : null

    const estimatedMonthlyRevenue =
      businessPlans * PLAN_PRICES.Business + proPlans * PLAN_PRICES.Pro

    const monthlyRegistrations = (() => {
      const counts = new Array(12).fill(0)
      const currentMonth = new Date().getMonth()
      for (const store of stores) {
        if (!store.createdAt) continue
        const d = store.createdAt.toDate()
        const monthIdx = d.getMonth()
        const yearDiff = d.getFullYear() - new Date().getFullYear()
        const idx = monthIdx - currentMonth + 11
        if (idx >= 0 && idx < 12 && (yearDiff === 0 || (yearDiff === -1 && idx >= 0 && idx < currentMonth + 1))) {
          counts[idx % 12]++
        }
      }
      return counts.map((count, i) => ({
        month: MONTHS[(currentMonth - 11 + i + 12) % 12],
        registrations: count,
      }))
    })()

    const plansDistribution = [
      { name: 'Starter', count: starterPlans, fill: '#6366f1' },
      { name: 'Business', count: businessPlans, fill: '#10b981' },
      { name: 'Pro', count: proPlans, fill: '#f59e0b' },
    ]

    const businessTypeColors: Record<string, string> = {
      'Sari-sari Store': '#6366f1',
      'Food & Beverage': '#10b981',
      'Restaurant': '#ef4444',
      'Café / Milk Tea': '#ec4899',
      'Bakery': '#f59e0b',
      'Grocery': '#06b6d4',
      'Pharmacy': '#14b8a6',
      'Hardware': '#8b5cf6',
      'Clothing': '#e879f9',
      'Electronics': '#3b82f6',
      'Services': '#f97316',
      'Others': '#6b7280',
    }
    const businessTypeCounts: Record<string, number> = {}
    for (const store of stores) {
      const bt = store.businessType || 'Sari-sari Store'
      businessTypeCounts[bt] = (businessTypeCounts[bt] || 0) + 1
    }
    const businessTypeDistribution = Object.entries(businessTypeCounts)
      .map(([name, count]) => ({ name, count, fill: businessTypeColors[name] || '#6b7280' }))
      .sort((a, b) => b.count - a.count)

    const accountStatusLabels: Record<string, string> = {
      active: 'Active',
      suspended: 'Suspended',
      disabled: 'Disabled',
    }
    const accountStatusColors: Record<string, string> = {
      active: '#10b981',
      suspended: '#f59e0b',
      disabled: '#ef4444',
    }
    const accountStatusCounts: Record<string, number> = {}
    for (const sub of subscriptions) {
      const key = accountStatusLabels[sub.accountStatus] || sub.accountStatus
      accountStatusCounts[key] = (accountStatusCounts[key] || 0) + 1
    }
    const accountStatusDistribution = Object.entries(accountStatusCounts).map(([name, value]) => ({
      name,
      value,
      color: accountStatusColors[name.toLowerCase()] || '#6b7280',
    }))

    const dailyLogins = (() => {
      const counts: Record<string, number> = {}
      for (let i = 0; i < 30; i++) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        d.setHours(0, 0, 0, 0)
        const key = d.toISOString().slice(0, 10)
        counts[key] = 0
      }
      for (const sub of subscriptions) {
        if (!sub.lastLoginAt) continue
        const t = sub.lastLoginAt.toMillis()
        if (t < thirtyDaysAgo.getTime()) continue
        const key = sub.lastLoginAt.toDate().toISOString().slice(0, 10)
        if (counts[key] !== undefined) counts[key]++
      }
      return Object.entries(counts)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, logins]) => ({
          date: date.slice(5),
          logins,
        }))
    })()

    return {
      totalStores: stores.length,
      activeAccounts,
      trialAccounts,
      expiredAccounts,
      suspendedAccounts,
      disabledAccounts,
      starterPlans,
      businessPlans,
      proPlans,
      todaysLogins,
      newStoresThisMonth,
      monthlyGrowthRate,
      trialConversionRate,
      estimatedMonthlyRevenue,
      monthlyRegistrations,
      plansDistribution,
      accountStatusDistribution,
      businessTypeDistribution,
      dailyLogins,
    }
  }, [stores, subscriptions])

  return { analytics, loading: loading || adminLoading, error }
}
