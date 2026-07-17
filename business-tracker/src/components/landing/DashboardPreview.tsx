const previewCards = [
  {
    title: 'Inventory',
    value: '156 Products',
    change: '8 low stock',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    iconColor: 'bg-emerald-100 text-emerald-600',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
  },
  {
    title: 'Sales',
    value: '₱48,520',
    change: '+12.5% this week',
    color: 'bg-blue-50 text-blue-700 border-blue-100',
    iconColor: 'bg-blue-100 text-blue-600',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
  },
  {
    title: 'Reports',
    value: '12 Generated',
    change: 'This month',
    color: 'bg-purple-50 text-purple-700 border-purple-100',
    iconColor: 'bg-purple-100 text-purple-600',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    title: 'Analytics',
    value: 'Revenue Up',
    change: '+8.2% vs last month',
    color: 'bg-amber-50 text-amber-700 border-amber-100',
    iconColor: 'bg-amber-100 text-amber-600',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
]

export default function DashboardPreview() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-sm font-semibold text-emerald-600 tracking-wide uppercase">Dashboard Preview</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Your Business at a Glance
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Get instant visibility into every metric that matters to your business.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-200/20 to-green-200/20 rounded-3xl blur-2xl" />
            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 md:p-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="ml-2 text-xs text-gray-400 font-medium">Business Tracker Dashboard</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {previewCards.map((card) => (
                  <div
                    key={card.title}
                    className={`rounded-xl p-4 border ${card.color}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium opacity-75">{card.title}</span>
                      <div className={`w-8 h-8 rounded-lg ${card.iconColor} flex items-center justify-center`}>
                        {card.icon}
                      </div>
                    </div>
                    <div className="text-xl font-bold">{card.value}</div>
                    <div className="text-xs mt-1 opacity-75">{card.change}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-700">Revenue vs Expenses</span>
                  <span className="text-xs text-gray-400">Last 6 months</span>
                </div>
                <div className="flex items-end gap-3 h-24">
                  {[35, 55, 40, 70, 50, 85].map((h, i) => (
                    <div key={i} className="flex-1 space-y-1">
                      <div className="bg-emerald-400 rounded-t" style={{ height: `${h}%` }} />
                      <div className="bg-emerald-200 rounded-b" style={{ height: `${h * 0.6}%` }} />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-400">
                  <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
