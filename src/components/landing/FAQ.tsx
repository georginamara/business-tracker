import { useState } from 'react'

const faqs = [
  {
    q: 'How do I subscribe?',
    a: 'Create a free account, choose your plan, and start your 7-day free trial immediately. No credit card required.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Cancel your subscription from account settings at any time. Access continues until the end of your billing period.',
  },
  {
    q: 'Is my data secure?',
    a: 'Absolutely. GeoDesk uses Firebase\'s enterprise-grade security with encrypted storage, authentication, and Firestore security rules.',
  },
  {
    q: 'Can I upgrade or downgrade my plan?',
    a: 'Yes. Upgrades take effect immediately with prorated billing. Downgrades apply at the start of your next billing cycle.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept GCash, Maya (PayMaya), bank transfers, and other local payment methods in the Philippines.',
  },
  {
    q: 'Is there a free trial?',
    a: 'Yes. Every new account includes a 7-day free trial with full access to your chosen plan. No credit card needed.',
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="py-28 sm:py-32 bg-white">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <div className="mb-16">
          <p className="text-sm font-semibold text-emerald-600 tracking-wide uppercase mb-3">FAQ</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.02em] text-gray-900 leading-tight">
            Frequently asked questions
          </h2>
        </div>

        <div className="space-y-px bg-gray-100 rounded-2xl overflow-hidden">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i
            return (
              <div key={i} className="bg-white">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50/50 transition-colors"
                >
                  <span className="text-[15px] font-medium text-gray-900 pr-8">{faq.q}</span>
                  <svg
                    className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                {isOpen && (
                  <div className="px-6 pb-5">
                    <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
