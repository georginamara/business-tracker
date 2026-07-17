import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white text-sm font-bold">
                B
              </div>
              <span className="text-lg font-bold text-white">Business Tracker</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed max-w-xs">
              The all-in-one cloud platform for managing your business inventory, sales, expenses, and more.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              <li><a href="#features" className="text-sm hover:text-emerald-400 transition-colors">Features</a></li>
              <li><a href="#pricing" className="text-sm hover:text-emerald-400 transition-colors">Pricing</a></li>
              <li><a href="#about" className="text-sm hover:text-emerald-400 transition-colors">About</a></li>
              <li><a href="#faq" className="text-sm hover:text-emerald-400 transition-colors">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Account</h3>
            <ul className="space-y-2.5">
              <li><Link to="/login" className="text-sm hover:text-emerald-400 transition-colors">Login</Link></li>
              <li><Link to="/register" className="text-sm hover:text-emerald-400 transition-colors">Register</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2.5">
              <li><span className="text-sm cursor-default">Privacy Policy</span></li>
              <li><span className="text-sm cursor-default">Terms of Service</span></li>
              <li><span className="text-sm cursor-default">Contact Support</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Business Tracker. All rights reserved.
          </p>
          <p className="text-xs text-gray-600">
            Built with care for small businesses.
          </p>
        </div>
      </div>
    </footer>
  )
}
