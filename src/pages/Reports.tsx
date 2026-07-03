import { useState, useMemo, useCallback } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { useBusiness } from '../hooks/useBusiness'
import { useStore } from '../hooks/useStore'
import DashboardCard from '../components/DashboardCard'
import { CardSkeleton } from '../components/Skeleton'

type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'custom'

function formatCurrency(amount: number, currency = '$'): string {
  const symbols: Record<string, string> = { PHP: '₱', USD: '$', EUR: '€', GBP: '£', JPY: '¥' }
  const sym = symbols[currency] || '$'
  return `${sym}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function getPeriodRange(period: ReportPeriod, customStart?: string, customEnd?: string): { start: string; end: string } {
  const now = new Date()
  const today = formatDate(now)

  switch (period) {
    case 'daily': {
      return { start: today, end: today }
    }
    case 'weekly': {
      const weekAgo = new Date(now)
      weekAgo.setDate(weekAgo.getDate() - 6)
      return { start: formatDate(weekAgo), end: today }
    }
    case 'monthly': {
      return { start: formatDate(new Date(now.getFullYear(), now.getMonth(), 1)), end: today }
    }
    case 'custom': {
      return {
        start: customStart || today,
        end: customEnd || today,
      }
    }
  }
}

function isInRange(dateStr: string, start: string, end: string): boolean {
  return dateStr >= start && dateStr <= end
}

interface BestSeller {
  productId: string
  productName: string
  quantity: number
  revenue: number
}

export default function Reports() {
  const { products, sales, expenses, loading } = useBusiness()
  const { store } = useStore()
  const threshold = store?.lowStockThreshold ?? 5
  const currency = store?.currency ?? 'USD'

  const [period, setPeriod] = useState<ReportPeriod>('monthly')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  const range = useMemo(() => getPeriodRange(period, customStart, customEnd), [period, customStart, customEnd])

  const periodLabel = useMemo(() => {
    switch (period) {
      case 'daily': return 'Daily Report'
      case 'weekly': return 'Weekly Report'
      case 'monthly': return 'Monthly Report'
      case 'custom': return 'Custom Report'
    }
  }, [period])

  const filteredSales = useMemo(
    () => sales.filter((s) => isInRange(s.date, range.start, range.end)),
    [sales, range]
  )

  const filteredExpenses = useMemo(
    () => expenses.filter((e) => isInRange(e.date, range.start, range.end)),
    [expenses, range]
  )

  const totalRevenue = useMemo(
    () => filteredSales.reduce((sum, s) => sum + s.total, 0),
    [filteredSales]
  )

  const totalExpensesAmt = useMemo(
    () => filteredExpenses.reduce((sum, e) => sum + e.amount, 0),
    [filteredExpenses]
  )

  const netProfit = totalRevenue - totalExpensesAmt

  const totalSalesCount = filteredSales.length

  const totalProductsSold = useMemo(
    () => filteredSales.reduce((sum, s) => sum + s.items.reduce((q, i) => q + i.quantity, 0), 0),
    [filteredSales]
  )

  const bestSellers = useMemo(() => {
    const grouped: Record<string, BestSeller> = {}
    for (const sale of filteredSales) {
      for (const item of sale.items) {
        if (grouped[item.productId]) {
          grouped[item.productId].quantity += item.quantity
          grouped[item.productId].revenue += item.subtotal
        } else {
          grouped[item.productId] = {
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            revenue: item.subtotal,
          }
        }
      }
    }
    return Object.values(grouped).sort((a, b) => b.quantity - a.quantity).slice(0, 10)
  }, [filteredSales])

  const lowStockProducts = useMemo(
    () => products.filter((p) => p.stock <= threshold).sort((a, b) => a.stock - b.stock),
    [products, threshold]
  )

  const chartData = useMemo(() => {
    const days: Record<string, { date: string; revenue: number; expenses: number }> = {}
    const allDates = new Set<string>()
    for (const s of filteredSales) { allDates.add(s.date) }
    for (const e of filteredExpenses) { allDates.add(e.date) }
    const sorted = [...allDates].sort()
    for (const d of sorted) {
      days[d] = { date: d, revenue: 0, expenses: 0 }
    }
    for (const s of filteredSales) { days[s.date].revenue += s.total }
    for (const e of filteredExpenses) { days[e.date].expenses += e.amount }
    return Object.values(days)
  }, [filteredSales, filteredExpenses])

  const generateCSV = useCallback(() => {
    const rows: string[][] = [
      ['Store', store?.storeName || 'My Store'],
      ['Owner', store?.ownerName || ''],
      ['Report', periodLabel],
      ['Period', `${range.start} to ${range.end}`],
      ['Generated', new Date().toLocaleString()],
      [],
      ['Metric', 'Value'],
      ['Total Revenue', `${currency} ${totalRevenue.toFixed(2)}`],
      ['Total Expenses', `${currency} ${totalExpensesAmt.toFixed(2)}`],
      ['Net Profit', `${currency} ${netProfit.toFixed(2)}`],
      ['Number of Sales', String(totalSalesCount)],
      ['Total Products Sold', String(totalProductsSold)],
      [],
      ['Best Selling Products'],
      ['Product', 'Quantity Sold', `Revenue (${currency})`],
      ...bestSellers.map((b) => [b.productName, String(b.quantity), b.revenue.toFixed(2)]),
      [],
      ['Low Stock Products'],
      ['Product', 'Stock'],
      ...lowStockProducts.map((p) => [p.name, String(p.stock)]),
      [],
      ['Daily Breakdown'],
      ['Date', `Revenue (${currency})`, `Expenses (${currency})`],
      ...chartData.map((d) => [d.date, d.revenue.toFixed(2), d.expenses.toFixed(2)]),
    ]
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `report-${range.start}-to-${range.end}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [periodLabel, range, totalRevenue, totalExpensesAmt, netProfit, totalSalesCount, totalProductsSold, bestSellers, lowStockProducts, chartData, store, currency])

  const generatePDF = useCallback(async () => {
    const { default: jsPDF } = await import('jspdf')
    await import('jspdf-autotable')
    const doc = new jsPDF()
    const sym = { PHP: '₱', USD: '$', EUR: '€', GBP: '£', JPY: '¥' }[currency] || '$'

    doc.setFontSize(18)
    doc.text(store?.storeName || 'My Store', 14, 22)
    doc.setFontSize(10)
    doc.text(`${periodLabel} — ${range.start} to ${range.end}`, 14, 30)
    if (store?.ownerName) {
      doc.text(`Owner: ${store.ownerName}`, 14, 36)
    }
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, store?.ownerName ? 42 : 36)

    const startY = store?.ownerName ? 50 : 44
    doc.setFontSize(12)
    doc.text('Summary', 14, startY)
    doc.autoTable({
      startY: startY + 4,
      head: [['Metric', 'Value']],
      body: [
        ['Total Revenue', `${sym}${totalRevenue.toFixed(2)}`],
        ['Total Expenses', `${sym}${totalExpensesAmt.toFixed(2)}`],
        ['Net Profit', `${sym}${netProfit.toFixed(2)}`],
        ['Number of Sales', String(totalSalesCount)],
        ['Total Products Sold', String(totalProductsSold)],
      ],
      theme: 'striped',
      headStyles: { fillColor: [99, 102, 241] },
    })

    if (bestSellers.length > 0) {
      doc.text('Best Selling Products', 14, (doc as any).lastAutoTable.finalY + 12)
      doc.autoTable({
        startY: (doc as any).lastAutoTable.finalY + 16,
        head: [['Product', 'Quantity Sold', `Revenue (${currency})`]],
        body: bestSellers.map((b) => [b.productName, String(b.quantity), `${sym}${b.revenue.toFixed(2)}`]),
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241] },
      })
    }

    if (lowStockProducts.length > 0) {
      doc.text('Low Stock Products', 14, (doc as any).lastAutoTable.finalY + 12)
      doc.autoTable({
        startY: (doc as any).lastAutoTable.finalY + 16,
        head: [['Product', 'Stock']],
        body: lowStockProducts.map((p) => [p.name, String(p.stock)]),
        theme: 'striped',
        headStyles: { fillColor: [239, 68, 68] },
      })
    }

    doc.text('Daily Breakdown', 14, (doc as any).lastAutoTable.finalY + 12)
    doc.autoTable({
      startY: (doc as any).lastAutoTable.finalY + 16,
      head: [['Date', `Revenue (${currency})`, `Expenses (${currency})`]],
      body: chartData.map((d) => [d.date, `${sym}${d.revenue.toFixed(2)}`, `${sym}${d.expenses.toFixed(2)}`]),
      theme: 'striped',
      headStyles: { fillColor: [99, 102, 241] },
    })

    doc.save(`report-${range.start}-to-${range.end}.pdf`)
  }, [periodLabel, range, totalRevenue, totalExpensesAmt, netProfit, totalSalesCount, totalProductsSold, bestSellers, lowStockProducts, chartData, store, currency])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 rounded-lg bg-gray-200 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="h-64 sm:h-72 animate-pulse bg-gray-100 rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
        <div className="flex gap-2">
          <button
            onClick={generateCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 rounded-lg transition-all duration-150 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
          <button
            onClick={generatePDF}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 active:bg-red-200 rounded-lg transition-all duration-150 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Export PDF
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 w-full">
        {(['daily', 'weekly', 'monthly', 'custom'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              period === p
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
        {period === 'custom' && (
          <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-2">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="flex-1 sm:flex-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <span className="text-gray-400 shrink-0">to</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="flex-1 sm:flex-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        )}
      </div>

      <div className="text-sm text-gray-500">
        <span className="font-medium text-gray-700">{periodLabel}</span> &mdash; {range.start} to {range.end}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <DashboardCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue, currency)}
          accent="green"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <DashboardCard
          title="Total Expenses"
          value={formatCurrency(totalExpensesAmt, currency)}
          accent="red"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          }
        />
        <DashboardCard
          title="Net Profit"
          value={formatCurrency(netProfit, currency)}
          accent="amber"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
        <DashboardCard
          title="Number of Sales"
          value={totalSalesCount}
          accent="indigo"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <DashboardCard
          title="Products Sold"
          value={totalProductsSold}
          accent="blue"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Revenue vs Expenses</h3>
          </div>
          <div className="p-5">
            {chartData.length === 0 ? (
              <div className="h-64 sm:h-72 flex items-center justify-center text-sm text-gray-400">No data for this period.</div>
            ) : (
              <div className="h-64 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={{ stroke: '#e5e7eb' }} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={{ stroke: '#e5e7eb' }} tickLine={false} tickFormatter={(v) => `$${v}`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', fontSize: '13px' }}
                      formatter={(value) => [`$${Number(value).toLocaleString('en-US')}`, undefined]}
                      labelStyle={{ fontWeight: 600, color: '#111827' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} iconType="circle" iconSize={8} />
                    <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={32} />
                    <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Best Selling Products</h3>
          </div>
          {bestSellers.length === 0 ? (
            <div className="p-5 h-64 sm:h-72 flex items-center justify-center text-sm text-gray-400">No sales data for this period.</div>
          ) : (
            <div className="p-5">
              <div className="overflow-x-auto">
                <table className="w-full text-sm table-card">
                  <thead>
                    <tr className="text-left text-gray-500 font-medium">
                      <th className="pb-3 pr-4">Product</th>
                      <th className="pb-3 pr-4 text-right">Quantity</th>
                      <th className="pb-3 text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {bestSellers.map((item) => (
                      <tr key={item.productId} className="transition-colors hover:bg-gray-50">
                        <td className="py-3 pr-4 text-gray-900 font-medium" data-label="Product">{item.productName}</td>
                        <td className="py-3 pr-4 text-right text-gray-600" data-label="Qty">{item.quantity}</td>
                        <td className="py-3 text-right text-gray-900 font-medium" data-label="Revenue">{formatCurrency(item.revenue, currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>

      <section className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Low Stock Products</h3>
          <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">{lowStockProducts.length} alerts</span>
        </div>
        {lowStockProducts.length === 0 ? (
          <div className="p-5 text-sm text-gray-400">All products are well-stocked.</div>
        ) : (
          <div className="p-5">
            <div className="overflow-x-auto">
              <table className="w-full text-sm table-card">
                <thead>
                  <tr className="text-left text-gray-500 font-medium">
                    <th className="pb-3 pr-4">Product</th>
                    <th className="pb-3 text-right">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {lowStockProducts.map((p) => (
                    <tr key={p.id} className="transition-colors hover:bg-gray-50">
                      <td className="py-3 pr-4 text-gray-900" data-label="Product">{p.name}</td>
                      <td className="py-3 text-right" data-label="Stock">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                          {p.stock}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
