import { useState } from 'react';
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import { useRental } from '../context/useRental';
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Package,
  Boxes,
  ShoppingCart,
  RotateCcw,
  Truck,
  Wrench,
  Undo2,
  MapPin,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Database,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

const ADMIN_NAV_ITEMS = [
  { label: 'Overview', to: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Analytics', to: '/admin/analytics', icon: BarChart3 },
  { label: 'User Management', to: '/admin/users', icon: Users },
  { label: 'Product Catalog', to: '/admin/products', icon: Package },
  { label: 'Inventory Units', to: '/admin/inventory', icon: Boxes },
  { label: 'Orders', to: '/admin/orders', icon: ShoppingCart },
  { label: 'Rentals', to: '/admin/rentals', icon: RotateCcw },
  { label: 'Deliveries', to: '/admin/deliveries', icon: Truck },
  { label: 'Maintenance', to: '/admin/maintenance', icon: Wrench },
  { label: 'Returns & Claims', to: '/admin/returns', icon: Undo2 },
  { label: 'Service Areas', to: '/admin/service-areas', icon: MapPin },
];

export default function AdminLayout() {
  const { user, logout } = useRental();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  const currentNav = ADMIN_NAV_ITEMS.find((item) =>
    item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to)
  ) || { label: 'Admin Portal' };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-800/80 bg-slate-900/90 backdrop-blur-xl shrink-0">
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/80">
          <Link to="/admin" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-md shadow-blue-500/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-white block">RentEase Admin</span>
              <span className="text-[10px] font-medium tracking-wider text-blue-400 uppercase block">Operations Control</span>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Platform Management
          </div>
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? location.pathname === item.to
              : location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive: active }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    active || isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Database & System Info */}
        <div className="p-3 border-t border-slate-800/80">
          <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800 mb-3 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                PostgreSQL Live
              </div>
              <span className="text-[10px] text-slate-300 font-mono">Neon DB</span>
            </div>
            <p className="text-[11px] text-slate-300">
              903 products catalog & operational persistence active.
            </p>
          </div>

          {/* User & Customer Store Switch */}
          <div className="flex items-center justify-between pt-1">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition px-2 py-1.5 rounded-lg hover:bg-slate-800"
              title="Return to Customer Storefront"
            >
              <ExternalLink className="h-3.5 w-3.5 text-blue-400" />
              <span>Storefront</span>
            </Link>

            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-400 transition px-2 py-1.5 rounded-lg hover:bg-red-500/10"
              title="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative flex flex-col w-72 max-w-full bg-slate-900 border-r border-slate-800 p-4 z-10 text-white">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <span className="font-bold text-sm">RentEase Admin</span>
              </div>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto">
              {ADMIN_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.exact}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                      }`
                    }
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-slate-800 space-y-2">
              <Link
                to="/"
                className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-200"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Customer Storefront
              </Link>
              <button
                onClick={logout}
                className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-red-500/10 text-xs font-semibold text-red-400"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-950">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb Title */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 hidden sm:inline">Admin Portal</span>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400 hidden sm:inline" />
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
                {currentNav.label}
              </h1>
            </div>
          </div>

          {/* Right Header Badges */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
              <Database className="h-3 w-3 text-emerald-400" />
              <span>PostgreSQL Connected</span>
            </div>

            <Link
              to="/"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/60 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition"
            >
              <ExternalLink className="h-3.5 w-3.5 text-blue-400" />
              <span>Customer View</span>
            </Link>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white uppercase">
                {user?.name?.slice(0, 1) || 'A'}
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-xs font-semibold text-white block leading-tight">{user?.name || 'Administrator'}</span>
                <span className="text-[10px] text-blue-400 font-mono block uppercase">{user?.role || 'admin'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
