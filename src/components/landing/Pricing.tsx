import { Link } from 'react-router-dom'

const plans = [
  {
    name: 'Starter',
    price: '₱199',
    description: 'Essential tools for small businesses getting started.',
    features: ['Dashboard', 'Point of Sale (POS)', 'Product Management', 'Sales History', 'Expense Tracking'],
    cta: 'Get Started',
    featured: false,
  },
  {
    name: 'Business',
    price: '₱299',
    description: 'Advanced features for growing businesses.',
    features: ['Everything in Starter', 'Credits Management', 'Reports (CSV & PDF)', 'Inventory History', 'Business Analytics'],
    cta: 'Start Free Trial',
    featured: true,
  },
  {
    name: 'Pro',
    price: '₱499',
    description: 'Full power with advanced analytics and priority support.',
    features: ['Everything in Business', 'Advanced Analytics', 'AI Insights', 'Sales Forecasting', 'Priority Support'],
    cta: 'Start Free Trial',
    featured: false,
  },
]

export default function Pricing() {
  return (
    <section id="pricing" className="py-28 sm:py-32 bg-white">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="max-w-2xl mb-16">
          <p className="text-sm font-semibold text-emerald-600 tracking-wide uppercase mb-3">Pricing</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.02em] text-gray-900 leading-tight">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Start with a free trial. Upgrade when you&apos;re ready. No hidden fees.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 flex flex-col ${
                plan.featured
                  ? 'bg-gray-900 text-white ring-1 ring-gray-800 shadow-xl shadow-gray-900/10'
                  : 'bg-white border border-gray-200'
              }`}
            >
              {plan.featured && (
                <span className="absolute -top-3 left-8 px-3 py-1 text-xs font-semibold bg-emerald-500 text-white rounded-full">
                  Most Popular
                </span>
              )}

              <div>
                <h3 className={`text-lg font-semibold ${plan.featured ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <p className={`mt-1 text-sm ${plan.featured ? 'text-gray-400' : 'text-gray-500'}`}>
                  {plan.description}
                </p>
              </div>

              <div className="mt-6 flex items-baseline gap-1">
                <span className={`text-4xl font-bold tracking-tight ${plan.featured ? 'text-white' : 'text-gray-900'}`}>
                  {plan.price}
                </span>
                <span className={`text-sm ${plan.featured ? 'text-gray-400' : 'text-gray-500'}`}>/month</span>
              </div>

              <ul className="mt-8 space-y-3 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <svg
                      className={`w-4 h-4 mt-0.5 shrink-0 ${plan.featured ? 'text-emerald-400' : 'text-emerald-500'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className={plan.featured ? 'text-gray-300' : 'text-gray-600'}>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/register"
                className={`mt-8 block w-full text-center py-3 text-sm font-semibold rounded-xl transition-all active:scale-[0.98] ${
                  plan.featured
                    ? 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-lg shadow-emerald-500/20'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
