import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-green-50" />
      <div className="absolute top-20 right-0 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-green-100/30 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full mb-6">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Free 7-Day Trial
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight">
              Manage Your Business
              <span className="text-emerald-600"> Smarter</span>
            </h1>

            <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-xl">
              Track inventory, monitor sales, manage expenses, generate reports, and grow your business—all in one cloud-based platform.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-6 py-3.5 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 hover:-translate-y-0.5"
              >
                Start Free Trial
                <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-6 py-3.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                Login
              </Link>
            </div>

            <div className="mt-10 flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                No credit card required
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Cancel anytime
              </div>
            </div>
          </div>

          <div className="hidden lg:block animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-200/30 to-green-200/30 rounded-3xl blur-2xl" />
              <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <div className="ml-auto text-xs text-gray-400 font-medium">Business Tracker</div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-emerald-50 rounded-xl p-4">
                    <div className="text-xs text-emerald-600 font-medium">Revenue</div>
                    <div className="text-lg font-bold text-emerald-700 mt-1">₱48,520</div>
                    <div className="text-xs text-emerald-500 mt-0.5">+12.5%</div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="text-xs text-blue-600 font-medium">Sales</div>
                    <div className="text-lg font-bold text-blue-700 mt-1">324</div>
                    <div className="text-xs text-blue-500 mt-0.5">+8.2%</div>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4">
                    <div className="text-xs text-purple-600 font-medium">Products</div>
                    <div className="text-lg font-bold text-purple-700 mt-1">156</div>
                    <div className="text-xs text-purple-500 mt-0.5">In Stock</div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-gray-600">Sales Overview</span>
                    <span className="text-xs text-gray-400">This Week</span>
                  </div>
                  <div className="flex items-end gap-2 h-20">
                    {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                      <div key={i} className="flex-1 bg-emerald-200 rounded-t" style={{ height: `${h}%` }}>
                        <div className="w-full bg-emerald-500 rounded-t" style={{ height: `${h}%` }} />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-400">
                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="text-xs text-gray-500">Low Stock Items</div>
                    <div className="text-base font-bold text-amber-600">5 items</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="text-xs text-gray-500">Pending Credits</div>
                    <div className="text-base font-bold text-rose-600">₱3,200</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
