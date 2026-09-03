import { Link } from 'react-router-dom';
import { CATEGORIES } from '../constants/theme';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-400">
      {/* Upper Trust & Benefits Strip */}
      <div className="border-b border-slate-800/80">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-blue-400 font-bold text-sm">
                0₹
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Zero Deposit</h4>
                <p className="mt-0.5 text-xs text-slate-400">On all rental plans 6 months & above</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-blue-400 font-bold text-sm">
                48h
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Free Delivery & Setup</h4>
                <p className="mt-0.5 text-xs text-slate-400">Professional doorstep installation</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-blue-400 font-bold text-sm">
                100%
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Maintenance Covered</h4>
                <p className="mt-0.5 text-xs text-slate-400">Free periodic service & repairs</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-blue-400 font-bold text-sm">
                12
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Cities Covered</h4>
                <p className="mt-0.5 text-xs text-slate-400">Fast local warehouse delivery hubs</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Info */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-black text-sm">
                R
              </span>
              <span className="text-xl font-black tracking-tight text-white">
                Rent<span className="text-blue-500">Ease</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-xs leading-relaxed text-slate-400">
              RentEase is India&apos;s leading flexible rental marketplace for curated furniture, home appliances, and workspace tech. Live comfortably without the commitment of buying.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 border border-slate-800 px-3 py-1 text-[11px] font-medium text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                900+ Curated Products Available
              </span>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Categories</h4>
            <ul className="mt-4 space-y-2 text-xs">
              {CATEGORIES.slice(0, 6).map((cat) => {
                const title = cat.title || cat.name;
                return (
                  <li key={cat.slug || title}>
                    <Link
                      to={`/products?category=${encodeURIComponent(title)}`}
                      className="transition-colors hover:text-white"
                    >
                      {title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">RentEase</h4>
            <ul className="mt-4 space-y-2 text-xs">
              <li>
                <Link to="/products" className="transition-colors hover:text-white">
                  Explore Catalog
                </Link>
              </li>
              <li>
                <a href="/#how-it-works" className="transition-colors hover:text-white">
                  How It Works
                </a>
              </li>
              <li>
                <Link to="/cart" className="transition-colors hover:text-white">
                  My Cart
                </Link>
              </li>
              <li>
                <Link to="/dashboard?tab=wishlist" className="transition-colors hover:text-white">
                  Saved Wishlist
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="transition-colors hover:text-white">
                  My Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Cities */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Active Cities</h4>
            <p className="mt-4 text-xs leading-relaxed text-slate-400">
              Bengaluru, Mumbai, Delhi NCR, Hyderabad, Pune, Chennai, Kolkata, Jaipur, Ahmedabad, Chandigarh, Kochi, Surat.
            </p>
            <div className="mt-4 rounded-xl bg-slate-900 p-3 border border-slate-800">
              <p className="text-[11px] font-semibold text-slate-300">Customer Support</p>
              <p className="text-xs text-blue-400 font-bold mt-0.5">support@rentease.in</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Mon–Sun · 9 AM to 8 PM IST</p>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} RentEase Technologies Private Limited. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
