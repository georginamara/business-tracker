const testimonials = [
  {
    name: 'Maria Santos',
    role: 'Sari-Sari Store Owner',
    content: 'Business Tracker transformed how I manage my store. I can now track inventory and sales in real-time. The POS feature is incredibly easy to use!',
    avatar: 'MS',
  },
  {
    name: 'Juan Dela Cruz',
    role: 'Restaurant Manager',
    content: 'The expense tracking and reporting features saved me hours every week. I finally have clear visibility into my business finances.',
    avatar: 'JD',
  },
  {
    name: 'Ana Reyes',
    role: 'Bakery Owner',
    content: 'Switching from spreadsheets to Business Tracker was the best decision. The cloud sync means I can check my business data from anywhere.',
    avatar: 'AR',
  },
]

export default function Testimonials() {
  return (
    <section className="py-20 md:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-sm font-semibold text-emerald-600 tracking-wide uppercase">Testimonials</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Loved by Business Owners
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            See what our users have to say about Business Tracker.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <p className="text-sm text-gray-600 leading-relaxed">&ldquo;{testimonial.content}&rdquo;</p>

              <div className="mt-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-xs text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
