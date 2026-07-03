import { useMemo } from 'react'
import { useBusiness } from '../hooks/useBusiness'
import { useStore } from '../hooks/useStore'
import DashboardCard from '../components/DashboardCard'
import { CardSkeleton } from '../components/Skeleton'
import SalesOverviewChart from '../components/SalesOverviewChart'
import RevenueExpensesChart from '../components/RevenueExpensesChart'
import ExpenseCategoriesChart from '../components/ExpenseCategoriesChart'

function formatCurrency(amount: number, currency = '$'): string {
  const symbols: Record<string, string> = { PHP: '₱', USD: '$', EUR: '€', GBP: '£', JPY: '¥' }
  const sym = symbols[currency] || '$'
  return `${sym}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function Dashboard() {
  const { products, sales, expenses, dashboardStats, loading } = useBusiness()
  const { store } = useStore()
  const threshold = store?.lowStockThreshold ?? 5
  const currency = store?.currency ?? 'USD'

  const recentSales = useMemo(
    () => [...sales].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5),
    [sales]
  )

  const recentExpenses = useMemo(
    () => [...expenses].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5),
    [expenses]
  )

  const lowStockProducts = useMemo(
    () => products.filter((p) => p.stock <= threshold).sort((a, b) => a.stock - b.stock),
    [products, threshold]
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 rounded-lg bg-gray-200 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <div className="lg:col-span-2 xl:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
            <div className="h-64 sm:h-72 animate-pulse bg-gray-100 rounded-lg" />
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="h-64 sm:h-72 animate-pulse bg-gray-100 rounded-lg" />
          </div>
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
            <div className="h-64 sm:h-72 animate-pulse bg-gray-100 rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-900">{store?.storeName ? `Welcome back, ${store.storeName}` : 'Dashboard'}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <DashboardCard
          title="Total Sales"
          value={dashboardStats.totalSales}
          accent="indigo"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <DashboardCard
          title="Revenue"
          value={formatCurrency(dashboardStats.revenue, currency)}
          accent="green"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <DashboardCard
          title="Expenses"
          value={formatCurrency(dashboardStats.expenses, currency)}
          accent="red"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          }
        />
        <DashboardCard
          title="Net Profit"
          value={formatCurrency(dashboardStats.netProfit, currency)}
          accent="amber"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
        <DashboardCard
          title="Products"
          value={dashboardStats.products}
          accent="blue"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="lg:col-span-2 xl:col-span-2">
          <SalesOverviewChart />
        </div>
        <div className="lg:col-span-2 xl:col-span-1">
          <ExpenseCategoriesChart />
        </div>
        <div className="lg:col-span-2">
          <RevenueExpensesChart />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Expenses</h3>
            <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{recentExpenses.length} entries</span>
          </div>
          <div className="p-5">
            <div className="overflow-x-auto">
              <table className="w-full text-sm table-card">
                <thead>
                  <tr className="text-left text-gray-500 font-medium">
                    <th className="pb-3 pr-4">Description</th>
                    <th className="pb-3 pr-4">Category</th>
                    <th className="pb-3 pr-4">Date</th>
                    <th className="pb-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-400 text-sm">No expenses recorded yet.</td>
                    </tr>
                  ) : (
                    recentExpenses.map((expense) => (
                      <tr key={expense.id} className="transition-colors hover:bg-gray-50">
                        <td className="py-3 pr-4 text-gray-900" data-label="Description">{expense.description}</td>
                        <td className="py-3 pr-4" data-label="Category">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            {expense.category}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-gray-600" data-label="Date">{expense.date}</td>
                        <td className="py-3 text-right text-gray-900 font-medium" data-label="Amount">{formatCurrency(expense.amount, currency)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Sales</h3>
            <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{recentSales.length} entries</span>
          </div>
          <div className="p-5">
            <div className="overflow-x-auto">
              <table className="w-full text-sm table-card">
                <thead>
                  <tr className="text-left text-gray-500 font-medium">
                    <th className="pb-3 pr-4">Product</th>
                    <th className="pb-3 pr-4">Qty</th>
                    <th className="pb-3 pr-4">Date</th>
                    <th className="pb-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentSales.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-400 text-sm">No sales recorded yet.</td>
                    </tr>
                  ) : (
                    recentSales.map((sale) => (
                      <tr key={sale.id} className="transition-colors hover:bg-gray-50">
                        <td className="py-3 pr-4 text-gray-900" data-label="Product">
                          {sale.items.map((i) => i.productName).join(', ')}
                        </td>
                        <td className="py-3 pr-4 text-gray-600" data-label="Qty">
                          {sale.items.reduce((sum, i) => sum + i.quantity, 0)}
                        </td>
                        <td className="py-3 pr-4 text-gray-600" data-label="Date">{sale.date}</td>
                        <td className="py-3 text-right text-gray-900 font-medium" data-label="Amount">{formatCurrency(sale.total, currency)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Low Stock Products</h3>
            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">{lowStockProducts.length} alerts</span>
          </div>
          <div className="p-5">
            <div className="overflow-x-auto">
              <table className="w-full text-sm table-card">
                <thead>
                  <tr className="text-left text-gray-500 font-medium">
                    <th className="pb-3 pr-4">Product</th>
                    <th className="pb-3 pr-4">Stock</th>
                    <th className="pb-3 text-right">Min Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {lowStockProducts.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-gray-400 text-sm">All products are well-stocked.</td>
                    </tr>
                  ) : (
                    lowStockProducts.map((product) => (
                      <tr key={product.id} className="transition-colors hover:bg-gray-50">
                        <td className="py-3 pr-4 text-gray-900" data-label="Product">{product.name}</td>
                        <td className="py-3 pr-4" data-label="Stock">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            {product.stock}
                          </span>
                        </td>
                        <td className="py-3 text-right text-gray-600" data-label="Min Stock">{threshold}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
