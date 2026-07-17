export default function DashboardPreview() {
  return (
    <section className="py-28 sm:py-32 bg-gray-50">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold text-emerald-600 tracking-wide uppercase mb-3">Dashboard</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.02em] text-gray-900 leading-tight">
            Your business at a glance
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Get instant visibility into every metric that matters.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="absolute -inset-8 bg-gradient-to-b from-emerald-100/40 to-transparent rounded-3xl blur-2xl" />

          <div className="relative bg-white rounded-2xl border border-gray-200 shadow-2xl shadow-gray-200/60 overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-gray-50/50">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-gray-300" />
                <div className="w-3 h-3 rounded-full bg-gray-300" />
                <div className="w-3 h-3 rounded-full bg-gray-300" />
              </div>
              <span className="ml-2 text-xs text-gray-400 font-medium">GeoDesk</span>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Revenue', value: '₱48,520', change: '+12.5%', color: 'emerald' },
                  { label: 'Sales', value: '324', change: '+8.2%', color: 'blue' },
                  { label: 'Products', value: '156', change: 'In stock', color: 'violet' },
                  { label: 'Expenses', value: '₱12,340', change: '-3.1%', color: 'amber' },
                ].map((card) => (
                  <div key={card.label} className="rounded-xl border border-gray-100 p-4">
                    <p className="text-xs text-gray-400 font-medium">{card.label}</p>
                    <p className="mt-2 text-xl font-bold text-gray-900">{card.value}</p>
                    <p className={`mt-1 text-xs font-medium text-${card.color}-600`}>{card.change}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-5">
                  <span className="text-sm font-medium text-gray-700">Revenue vs Expenses</span>
                  <span className="text-xs text-gray-400">Last 7 days</span>
                </div>
                <div className="flex items-end gap-2.5 h-32">
                  {[38, 58, 42, 72, 52, 88, 68].map((h, i) => (
                    <div key={i} className="flex-1 flex gap-1 items-end">
                      <div
                        className="flex-1 bg-emerald-500 rounded-t"
                        style={{ height: `${h}%` }}
                      />
                      <div
                        className="flex-1 bg-gray-200 rounded-t"
                        style={{ height: `${h * 0.55}%` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2.5 text-[11px] text-gray-400">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                    <span key={d}>{d}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
