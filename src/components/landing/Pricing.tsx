import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const plans = [
  {
    name: 'Starter',
    price: 149,
    description: 'Perfect for small businesses starting their digital journey.',
    features: [
      '14-Day Free Trial',
      'Up to 100 Products',
      'Sales Management',
      'Expense Tracking',
      'Inventory Management',
      'Business Dashboard',
      'Basic Reports (PDF)',
      'Email Support',
    ],
    featured: false,
  },
  {
    name: 'Business',
    price: 299,
    description: 'Best for growing businesses that need AI-powered insights and advanced reporting.',
    features: [
      'Everything in Starter, plus:',
      'Unlimited Products',
      'AI-Powered Sales Analytics',
      'AI Sales Forecasting',
      'Business Insights',
      'Advanced Reports (PDF + Excel)',
      'Inventory Trend Analysis',
      'Priority Support',
      'Future Feature Updates',
    ],
    featured: true,
  },
] as const

function CheckIcon({ featured }: { featured: boolean }) {
  return (
    <svg
      className={`w-[18px] h-[18px] mt-px shrink-0 ${featured ? 'text-green-600' : 'text-green-500'}`}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  )
}

export default function Pricing() {
  const { user, profile } = useAuth()

  const currentPlan =
    user && profile
      ? (profile.subscription?.plan ?? profile.plan ?? null)
      : null

  return (
    <section id="pricing" className="py-28 sm:py-32 bg-gray-50">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold text-green-600 tracking-wide uppercase mb-3">
            Pricing
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 leading-tight">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Start with a free trial. Upgrade when you&apos;re ready. No hidden fees.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => {
            const isCurrentPlan = currentPlan === plan.name
            const isFeatured = plan.featured

            return (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-2xl p-8 transition-all duration-200 ${
                  isFeatured
                    ? 'bg-white border-2 border-green-500 shadow-xl shadow-green-500/5 ring-1 ring-green-500/10 scale-[1.02]'
                    : 'bg-white border border-gray-200 shadow-sm hover:shadow-md'
                }`}
              >
                {/* Badge */}
                {isFeatured ? (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-4 py-1 text-xs font-bold bg-green-600 text-white rounded-full shadow-md shadow-green-600/20">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Most Popular
                  </span>
                ) : isCurrentPlan ? (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-4 py-1 text-xs font-bold bg-gray-800 text-white rounded-full">
                    Current Plan
                  </span>
                ) : null}

                {/* Plan name + description */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                {/* Price */}
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-sm font-medium text-gray-400">₱</span>
                  <span className="text-5xl font-extrabold tracking-tight text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-sm text-gray-400 font-medium">/month</span>
                </div>

                {/* Divider */}
                <div className="mt-8 mb-6 h-px bg-gray-100" />

                {/* Features */}
                <ul className="space-y-3.5 flex-1">
                  {plan.features.map((f) => {
                    const isSectionHeader = f.startsWith('Everything in')
                    return (
                      <li key={f} className="flex items-start gap-3 text-sm">
                        {isSectionHeader ? (
                          <span className="text-green-600 font-semibold mt-px">+</span>
                        ) : (
                          <CheckIcon featured={isFeatured} />
                        )}
                        <span
                          className={
                            isSectionHeader
                              ? 'font-semibold text-gray-900'
                              : 'text-gray-600'
                          }
                        >
                          {f}
                        </span>
                      </li>
                    )
                  })}
                </ul>

                {/* CTA */}
                {isCurrentPlan ? (
                  <div className="mt-8 flex items-center justify-center gap-2 w-full py-3.5 text-sm font-semibold rounded-xl bg-green-50 text-green-700 border border-green-200 cursor-default">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Current Plan
                  </div>
                ) : (
                  <Link
                    to="/register"
                    className={`mt-8 block w-full text-center py-3.5 text-sm font-semibold rounded-xl transition-all duration-150 active:scale-[0.98] ${
                      isFeatured
                        ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-600/20 hover:shadow-green-600/30'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    Choose {plan.name}
                  </Link>
                )}
              </div>
            )
          })}
        </div>

        {/* Trust line */}
        <p className="text-center text-sm text-gray-400 mt-10">
          All plans include a 14-day free trial. No credit card required to start.
        </p>
      </div>
    </section>
  )
}
