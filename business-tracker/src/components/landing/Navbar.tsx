import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white text-sm font-bold">
              B
            </div>
            <span className="text-lg font-bold text-gray-900">Business Tracker</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">Pricing</a>
            <a href="#about" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">About</a>
            <a href="#faq" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">FAQ</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-emerald-600 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
            >
              Start Free Trial
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-4 space-y-3">
            <a href="#features" onClick={() => setMobileOpen(false)} className="block text-sm text-gray-600 hover:text-emerald-600 py-2">Features</a>
            <a href="#pricing" onClick={() => setMobileOpen(false)} className="block text-sm text-gray-600 hover:text-emerald-600 py-2">Pricing</a>
            <a href="#about" onClick={() => setMobileOpen(false)} className="block text-sm text-gray-600 hover:text-emerald-600 py-2">About</a>
            <a href="#faq" onClick={() => setMobileOpen(false)} className="block text-sm text-gray-600 hover:text-emerald-600 py-2">FAQ</a>
            <div className="pt-3 border-t border-gray-100 space-y-2">
              <Link to="/login" className="block text-center px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                Login
              </Link>
              <Link to="/register" className="block text-center px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors">
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
