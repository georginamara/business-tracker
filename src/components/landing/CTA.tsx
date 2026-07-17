import { Link } from 'react-router-dom'

export default function CTA() {
  return (
    <section className="py-28 sm:py-32 bg-gray-50">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="relative rounded-3xl bg-gray-900 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:3rem_3rem]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/20 rounded-full blur-[100px]" />

          <div className="relative px-8 py-16 sm:px-16 sm:py-20 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.02em] text-white leading-tight">
              Ready to grow your business?
            </h2>
            <p className="mt-4 text-lg text-gray-400 max-w-xl mx-auto">
              Join hundreds of business owners already using GeoDesk to manage their operations.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-[15px] font-semibold text-gray-900 bg-white rounded-xl hover:bg-gray-100 active:scale-[0.98] transition-all shadow-lg"
              >
                Start Free Trial
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-[15px] font-semibold text-white border border-white/20 rounded-xl hover:bg-white/10 active:scale-[0.98] transition-all"
              >
                Log in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
