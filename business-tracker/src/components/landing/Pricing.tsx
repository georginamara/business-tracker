import { Link } from 'react-router-dom'
import { PLANS } from '../../data/plans'

const pricingPlans = PLANS.filter((p) => p.id !== 'Platform')

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 md:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-sm font-semibold text-emerald-600 tracking-wide uppercase">Pricing</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Start with a free trial. Upgrade when you&apos;re ready. No hidden fees.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl p-8 shadow-sm border-2 transition-all hover:shadow-lg ${
                plan.recommended
                  ? 'border-emerald-500 shadow-emerald-100'
                  : 'border-gray-100'
              }`}
            >
              {plan.recommended && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full">
                  Most Popular
                </div>
              )}

              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900">{plan.label}</h3>
                <p className="mt-1 text-sm text-gray-500">{plan.description}</p>
                <div className="mt-4 flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-extrabold text-gray-900">{plan.priceLabel}</span>
                  <span className="text-sm text-gray-500">/month</span>
                </div>
              </div>

              <ul className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Link
                  to="/register"
                  className={`block w-full py-3 text-center text-sm font-semibold rounded-xl transition-all ${
                    plan.recommended
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/25'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Subscribe
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
