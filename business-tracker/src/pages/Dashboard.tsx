import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useBusiness } from '../hooks/useBusiness'
import { useStore } from '../hooks/useStore'
import DashboardCard from '../components/DashboardCard'
import EmptyState from '../components/EmptyState'
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
        <div className="h-8 w-32 rounded-lg bg-gray-200 dark:bg-slate-700 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <div className="lg:col-span-2 xl:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
            <div className="h-64 sm:h-72 animate-pulse bg-gray-100 dark:bg-slate-700 rounded-lg" />
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
            <div className="h-64 sm:h-72 animate-pulse bg-gray-100 dark:bg-slate-700 rounded-lg" />
          </div>
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
            <div className="h-64 sm:h-72 animate-pulse bg-gray-100 dark:bg-slate-700 rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  const isEmpty = products.length === 0 && sales.length === 0 && expenses.length === 0

  if (isEmpty) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{store?.storeName ? `Welcome back, ${store.storeName}` : 'Dashboard'}</h2>
          {store?.businessType && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400">
              {store.businessType}
            </span>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
          <EmptyState
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
              </svg>
            }
            title="Welcome to Business Tracker"
            description="Start by adding products or recording your first sale."
            action={
              <div className="flex gap-3 justify-center">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Add Product
                </Link>
                <Link
                  to="/pos"
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-lg transition-colors shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                  </svg>
                  Open POS
                </Link>
              </div>
            }
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{store?.storeName ? `Welcome back, ${store.storeName}` : 'Dashboard'}</h2>
        {store?.businessType && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400">
            {store.businessType}
          </span>
        )}
      </div>

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
        <DashboardCard
          title="Outstanding Credits"
          value={formatCurrency(dashboardStats.outstandingCredits, currency)}
          accent="purple"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          }
        />
        <DashboardCard
          title="Active Credit Customers"
          value={dashboardStats.activeCreditCustomers}
          accent="purple"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
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
        <section className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="px-5 py-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Expenses</h3>
            <span className="text-xs font-medium text-gray-400 dark:text-slate-400 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-full">{recentExpenses.length} entries</span>
          </div>
          <div className="p-5">
            <div className="overflow-x-auto">
              <table className="w-full text-sm table-card">
                <thead>
                  <tr className="text-left text-gray-500 dark:text-slate-400 font-medium">
                    <th className="pb-3 pr-4">Description</th>
                    <th className="pb-3 pr-4">Category</th>
                    <th className="pb-3 pr-4">Date</th>
                    <th className="pb-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  {recentExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-0">
                        <EmptyState
                          icon={
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          }
                          title="No expenses yet"
                          description="Track expenses to monitor profitability."
                        />
                      </td>
                    </tr>
                  ) : (
                    recentExpenses.map((expense) => (
                      <tr key={expense.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-slate-700/50">
                        <td className="py-3 pr-4 text-gray-900 dark:text-white" data-label="Description">{expense.description}</td>
                        <td className="py-3 pr-4" data-label="Category">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300">
                            {expense.category}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-gray-600 dark:text-slate-400" data-label="Date">{expense.date}</td>
                        <td className="py-3 text-right text-gray-900 dark:text-white font-medium" data-label="Amount">{formatCurrency(expense.amount, currency)}</td>
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
        <section className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="px-5 py-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Sales</h3>
            <span className="text-xs font-medium text-gray-400 dark:text-slate-400 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-full">{recentSales.length} entries</span>
          </div>
          <div className="p-5">
            <div className="overflow-x-auto">
              <table className="w-full text-sm table-card">
                <thead>
                  <tr className="text-left text-gray-500 dark:text-slate-400 font-medium">
                    <th className="pb-3 pr-4">Product</th>
                    <th className="pb-3 pr-4">Qty</th>
                    <th className="pb-3 pr-4">Date</th>
                    <th className="pb-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  {recentSales.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-0">
                        <EmptyState
                          icon={
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                          }
                          title="No sales yet"
                          description="Sales will appear here after your first transaction."
                        />
                      </td>
                    </tr>
                  ) : (
                    recentSales.map((sale) => (
                      <tr key={sale.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-slate-700/50">
                        <td className="py-3 pr-4 text-gray-900 dark:text-white" data-label="Product">
                          {sale.items.map((i) => i.productName).join(', ')}
                        </td>
                        <td className="py-3 pr-4 text-gray-600 dark:text-slate-400" data-label="Qty">
                          {sale.items.reduce((sum, i) => sum + i.quantity, 0)}
                        </td>
                        <td className="py-3 pr-4 text-gray-600 dark:text-slate-400" data-label="Date">{sale.date}</td>
                        <td className="py-3 text-right text-gray-900 dark:text-white font-medium" data-label="Amount">{formatCurrency(sale.total, currency)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="px-5 py-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Low Stock Products</h3>
            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">{lowStockProducts.length} alerts</span>
          </div>
          <div className="p-5">
            <div className="overflow-x-auto">
              <table className="w-full text-sm table-card">
                <thead>
                  <tr className="text-left text-gray-500 dark:text-slate-400 font-medium">
                    <th className="pb-3 pr-4">Product</th>
                    <th className="pb-3 pr-4">Stock</th>
                    <th className="pb-3 text-right">Min Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  {lowStockProducts.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-0">
                        <EmptyState
                          icon={
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          }
                          title="All products well-stocked"
                          description="No products are below the stock threshold."
                        />
                      </td>
                    </tr>
                  ) : (
                    lowStockProducts.map((product) => (
                      <tr key={product.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-slate-700/50">
                        <td className="py-3 pr-4 text-gray-900 dark:text-white" data-label="Product">{product.name}</td>
                        <td className="py-3 pr-4" data-label="Stock">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            {product.stock}
                          </span>
                        </td>
                        <td className="py-3 text-right text-gray-600 dark:text-slate-400" data-label="Min Stock">{threshold}</td>
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
