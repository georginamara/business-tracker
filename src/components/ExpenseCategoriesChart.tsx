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
      <section className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Expense Categories</h3>
        </div>
        <div className="p-5 flex items-center justify-center h-72 text-sm text-gray-400">
          No expense data available.
        </div>
      </section>
    )
  }

  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="px-5 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Expense Categories</h3>
      </div>
      <div className="p-5">
        <div className="h-72">
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
              <span className="text-gray-600 truncate">{entry.name}</span>
              <span className="text-gray-900 font-medium ml-auto">
                {((entry.value / total) * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
