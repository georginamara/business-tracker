import { useState } from 'react'

const faqs = [
  {
    question: 'How do I subscribe?',
    answer: 'Simply create a free account, choose your preferred plan (Starter, Business, or Pro), and start your 7-day free trial. No credit card is required to get started.',
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes, you can cancel your subscription at any time from your account settings. Your access will continue until the end of your current billing period.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. Business Tracker uses Firebase\'s enterprise-grade security with encrypted data storage, authentication, and Firestore security rules. Your data is backed up and protected at all times.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept various payment methods including GCash, Maya (PayMaya), bank transfers, and other local payment options available in the Philippines.',
  },
  {
    question: 'Can I upgrade or downgrade my plan?',
    answer: 'Yes, you can change your plan at any time. Upgrades take effect immediately with prorated billing, while downgrades apply at the start of your next billing cycle.',
  },
  {
    question: 'Is there a free trial?',
    answer: 'Yes! Every new account comes with a 7-day free trial that gives you full access to your chosen plan\'s features. No credit card required.',
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="py-20 md:py-28 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-emerald-600 tracking-wide uppercase">FAQ</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Everything you need to know about Business Tracker.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-xl overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left bg-white hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-semibold text-gray-900 pr-4">{faq.question}</span>
                <svg
                  className={`w-4 h-4 text-gray-500 shrink-0 transition-transform duration-200 ${
                    openIndex === i ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {openIndex === i && (
                <div className="px-6 pb-4">
                  <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
