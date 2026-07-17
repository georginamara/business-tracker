import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-12">
          <div className="col-span-2 sm:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                G
              </div>
              <span className="text-[15px] font-semibold text-gray-900">GeoDesk</span>
            </Link>
            <p className="mt-4 text-sm text-gray-400 leading-relaxed max-w-[240px]">
              Business Management Platform. Crafted by Georgi.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-2.5">
              {['Features', 'Pricing', 'About'].map((item) => (
                <li key={item}>
                  <a href={`#${item.toLowerCase()}`} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-4">Account</h4>
            <ul className="space-y-2.5">
              <li><Link to="/login" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Login</Link></li>
              <li><Link to="/register" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Register</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-2.5">
              <li><span className="text-sm text-gray-400">Privacy Policy</span></li>
              <li><span className="text-sm text-gray-400">Terms of Service</span></li>
              <li><span className="text-sm text-gray-400">Support</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            &copy; 2026 GeoDesk. All rights reserved.
          </p>
          <p className="text-xs text-gray-300">
            Business Management Platform. Crafted by Georgi.
          </p>
        </div>
      </div>
    </footer>
  )
}
