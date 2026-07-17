const testimonials = [
  {
    quote: 'GeoDesk transformed how I manage my store. The POS and inventory tracking are incredibly intuitive — I can see everything in real-time.',
    name: 'Maria Santos',
    role: 'Sari-Sari Store Owner',
    avatar: 'MS',
  },
  {
    quote: 'The expense tracking and report exports saved me hours every week. I finally have clear visibility into my restaurant\'s finances.',
    name: 'Juan Dela Cruz',
    role: 'Restaurant Manager',
    avatar: 'JD',
  },
  {
    quote: 'Switching from spreadsheets to GeoDesk was the best decision. Cloud sync means I can check my bakery data from my phone anywhere.',
    name: 'Ana Reyes',
    role: 'Bakery Owner',
    avatar: 'AR',
  },
]

export default function Testimonials() {
  return (
    <section className="py-28 sm:py-32 bg-gray-50">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="max-w-2xl mb-16">
          <p className="text-sm font-semibold text-emerald-600 tracking-wide uppercase mb-3">Testimonials</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.02em] text-gray-900 leading-tight">
            Trusted by business owners
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            See what our users have to say about GeoDesk.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl border border-gray-200 bg-white p-7 hover:shadow-lg hover:shadow-gray-100 transition-shadow duration-300"
            >
              <div className="flex gap-0.5 mb-5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <p className="text-sm text-gray-600 leading-relaxed">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="mt-6 pt-5 border-t border-gray-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center text-xs font-bold border border-emerald-100">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
