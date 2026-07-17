const stats = [
  {
    value: '99.9%',
    label: 'Platform Availability',
    description: 'Reliable uptime for your business',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    value: 'Cloud-Based',
    label: 'Secure Storage',
    description: 'Access from anywhere, anytime',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
      </svg>
    ),
  },
  {
    value: 'Real-Time',
    label: 'Live Data Sync',
    description: 'Instant updates across all devices',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
  {
    value: 'Encrypted',
    label: 'Bank-Level Security',
    description: 'Your data is always protected',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
  },
]

export default function Stats() {
  return (
    <section id="about" className="py-20 md:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-sm font-semibold text-emerald-600 tracking-wide uppercase">Why Business Tracker</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Built for Modern Businesses
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Enterprise-grade infrastructure made accessible for small businesses.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow border border-gray-100"
            >
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto">
                {stat.icon}
              </div>
              <div className="mt-4 text-xl font-extrabold text-emerald-600">{stat.value}</div>
              <div className="mt-1 text-sm font-semibold text-gray-900">{stat.label}</div>
              <div className="mt-1 text-xs text-gray-500">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
