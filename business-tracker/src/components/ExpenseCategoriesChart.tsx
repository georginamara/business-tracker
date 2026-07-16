import { useState, useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { useBusiness } from '../hooks/useBusiness'
import { expenseCategoryColors } from '../data/charts'

export default function ExpenseCategoriesChart() {
  const { expenses } = useBusiness()
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const data = useMemo(() => {
    const grouped: Record<string, number> = {}
    expenses.forEach((e) => {
      grouped[e.category] = (grouped[e.category] || 0) + e.amount
    })
    return Object.entries(grouped).map(([name, value]) => ({
      name,
      value,
      color: expenseCategoryColors[name] || '#6b7280',
    }))
  }, [expenses])

  const total = data.reduce((sum, d) => sum + d.value, 0)

  if (data.length === 0) {
    return (
      <section className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Expense Categories</h3>
        </div>
        <div className="flex flex-col items-center justify-center h-64 sm:h-72 px-4">
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-400 dark:text-slate-500 mb-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-0.5">No expense data</p>
          <p className="text-xs text-gray-400 dark:text-slate-500 text-center">Expense breakdown will appear here once expenses are recorded.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="px-5 py-4 border-b border-gray-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Expense Categories</h3>
      </div>
      <div className="p-5">
        <div className="h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={entry.color}
                    opacity={activeIndex === null || activeIndex === index ? 1 : 0.6}
                    stroke={activeIndex === index ? '#fff' : 'transparent'}
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  fontSize: '13px',
                }}
                formatter={(value) => [
                  `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                  undefined,
                ]}
                labelStyle={{ fontWeight: 600, color: '#111827' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {data.map((entry) => (
            <div key={entry.name} className="flex items-center gap-2 text-xs">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600 dark:text-slate-400 truncate">{entry.name}</span>
              <span className="text-gray-900 dark:text-white font-medium ml-auto">
                {((entry.value / total) * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
