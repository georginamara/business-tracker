const steps = [
  {
    step: '01',
    title: 'Create your account',
    description: 'Sign up in seconds with your email. Start with a free trial instantly.',
  },
  {
    step: '02',
    title: 'Set up your store',
    description: 'Add your products, configure categories, and personalize your dashboard.',
  },
  {
    step: '03',
    title: 'Start growing',
    description: 'Track sales, manage inventory, monitor expenses, and make smarter decisions.',
  },
]

export default function HowItWorks() {
  return (
    <section className="py-28 sm:py-32 bg-gray-50">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="max-w-2xl mb-16">
          <p className="text-sm font-semibold text-emerald-600 tracking-wide uppercase mb-3">How It Works</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.02em] text-gray-900 leading-tight">
            Get started in minutes
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            No complex setup. Start managing your business within minutes.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-px bg-gray-200 rounded-2xl overflow-hidden">
          {steps.map((s) => (
            <div key={s.step} className="bg-white p-8 sm:p-10">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                {s.step}
              </span>
              <h3 className="mt-5 text-lg font-semibold text-gray-900">{s.title}</h3>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
