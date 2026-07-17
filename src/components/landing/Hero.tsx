import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,#000_70%,transparent_100%)] opacity-40" />

      <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] rounded-full bg-emerald-100/60 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] rounded-full bg-teal-50/80 blur-[100px]" />

      <div className="relative mx-auto max-w-6xl w-full px-5 sm:px-8 pt-32 pb-20">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-white/60 backdrop-blur-sm text-xs font-medium text-gray-600 mb-8 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Free 7-day trial &mdash; No credit card required
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-[4.25rem] font-bold tracking-[-0.03em] leading-[1.08] text-gray-900">
            GeoDesk
          </h1>
          <p className="mt-3 text-lg sm:text-xl font-medium text-emerald-600">Business Management Platform</p>
          <p className="mt-1 text-sm text-gray-400">by Georgi</p>

          <p className="mt-7 text-lg sm:text-xl text-gray-500 leading-relaxed max-w-2xl font-normal">
            Manage your sales, inventory, expenses, and business operations from one modern cloud platform.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-[15px] font-semibold text-white bg-gray-900 rounded-xl hover:bg-gray-800 active:scale-[0.98] transition-all shadow-lg shadow-gray-900/10"
            >
              Start Free Trial
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-[15px] font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98] transition-all shadow-sm"
            >
              Sign In
            </Link>
          </div>

          <div className="mt-14 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-gray-400">
            {['No credit card required', 'Cancel anytime', '7-day free trial'].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
