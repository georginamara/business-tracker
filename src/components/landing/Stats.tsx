const stats = [
  { value: '99.9%', label: 'Platform uptime guaranteed', icon: '01' },
  { value: 'Real-time', label: 'Data sync across devices', icon: '02' },
  { value: 'Encrypted', label: 'Bank-level data security', icon: '03' },
  { value: 'Cloud-based', label: 'Access from anywhere', icon: '04' },
]

export default function Stats() {
  return (
    <section id="about" className="py-28 sm:py-32 bg-white">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="max-w-2xl mb-16">
          <p className="text-sm font-semibold text-emerald-600 tracking-wide uppercase mb-3">Why GeoDesk</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.02em] text-gray-900 leading-tight">
            Enterprise-grade infrastructure, built for you
          </h2>
          <p className="mt-4 text-lg text-gray-500 leading-relaxed">
            The same reliability trusted by large corporations, now accessible for small businesses.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div
              key={s.value}
              className="group relative rounded-2xl border border-gray-200 p-7 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-50 transition-all duration-300"
            >
              <span className="text-xs font-bold text-emerald-600/60 tracking-widest">{s.icon}</span>
              <div className="mt-4 text-2xl font-bold text-gray-900 tracking-tight">{s.value}</div>
              <p className="mt-1.5 text-sm text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
