import { useEffect, useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';

import { CATEGORIES } from '../constants/theme';
import { useRental } from '../context/useRental';

const CartIcon = () => (
  <svg
    className="h-5 w-5"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M3.75 4.75h2l1.75 10.5h11l1.5-7.5H6.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 20a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Zm8 0a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const HeartIcon = () => (
  <svg
    className="h-5 w-5"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M20.25 8.25c0 5.25-8.25 10-8.25 10s-8.25-4.75-8.25-10A4.5 4.5 0 0 1 12 5.7a4.5 4.5 0 0 1 8.25 2.55Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const UserIcon = () => (
  <svg
    className="h-5 w-5"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M12 12a4.25 4.25 0 1 0 0-8.5 4.25 4.25 0 0 0 0 8.5ZM4.75 20.25a7.25 7.25 0 0 1 14.5 0"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MenuIcon = () => (
  <svg
    className="h-6 w-6"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M4 7h16M4 12h16M4 17h16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const CloseIcon = () => (
  <svg
    className="h-6 w-6"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M6 6l12 12M18 6 6 18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const SearchIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path
      d="m19 19-4.35-4.35M17 9A8 8 0 1 1 1 9a8 8 0 0 1 16 0Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const LogoMark = () => (
  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white shadow-xs">
    <svg
      className="h-5 w-5 text-blue-500"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v6H4a1 1 0 0 1-1-1V9.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>
);

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { cartCount, favoriteProducts, user, logout } = useRental();
  const navigate = useNavigate();
  const location = useLocation();

  const [prevLocationKey, setPrevLocationKey] = useState(location.key);
  if (location.key !== prevLocationKey) {
    setPrevLocationKey(location.key);
    setMobileOpen(false);
    setCategoriesOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const getLinkClassName = ({ isActive }) =>
    [
      'relative rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors duration-150',
      isActive
        ? 'text-blue-600 bg-blue-50/70 font-bold'
        : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/70',
    ].join(' ');

  const isCategoryActive = location.search.includes('category=') || location.search.includes('tab=categories');

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-200 ${
        scrolled
          ? 'border-slate-200/90 bg-white/95 shadow-xs backdrop-blur-md'
          : 'border-slate-200/70 bg-white/90 backdrop-blur-md'
      }`}
    >
      {/* Top Banner Notice */}
      <div className="hidden border-b border-slate-100 bg-slate-950 px-4 py-1.5 text-center text-xs font-medium text-slate-300 md:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            Zero security deposit on 6+ month plans · Free 48-hour delivery & setup
          </span>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Verified 900+ curated items</span>
            <span>•</span>
            <span className="text-white font-semibold">100% Maintenance Covered</span>
          </div>
        </div>
      </div>

      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <NavLink to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-95 focus:outline-none">
          <LogoMark />
          <div className="leading-tight">
            <span className="text-lg font-black tracking-tight text-slate-950">
              Rent<span className="text-blue-600">Ease</span>
            </span>
            <span className="hidden text-[10px] font-semibold uppercase tracking-widest text-slate-400 sm:block">
              Marketplace
            </span>
          </div>
        </NavLink>

        {/* Quick Search Bar (Desktop) */}
        <form onSubmit={handleSearch} className="relative hidden max-w-xs flex-1 lg:max-w-sm xl:block">
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <SearchIcon />
            </span>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 900+ furniture & appliances..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/90 py-1.5 pl-9 pr-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 transition hover:bg-white hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </form>

        {/* Desktop Navigation Links (Clean single Categories dropdown) */}
        <div className="hidden items-center gap-1 md:flex">
          <NavLink to="/" end className={getLinkClassName}>
            Home
          </NavLink>
          <NavLink to="/products" className={getLinkClassName}>
            Explore
          </NavLink>

          {/* Categories Dropdown Popover */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setCategoriesOpen(!categoriesOpen)}
              className={`flex items-center gap-1 rounded-xl px-3.5 py-2 text-sm font-semibold transition focus:outline-none ${
                isCategoryActive
                  ? 'text-blue-600 bg-blue-50/70 font-bold'
                  : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-950'
              }`}
            >
              Categories
              <svg
                className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${categoriesOpen ? 'rotate-180 text-blue-600' : ''}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            {categoriesOpen && (
              <div className="absolute left-0 mt-2 grid w-84 grid-cols-2 gap-1.5 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-200/80 z-50">
                {CATEGORIES.map((category) => {
                  const title = category.title || category.name;
                  return (
                    <Link
                      key={category.slug || title}
                      to={`/products?category=${encodeURIComponent(title)}`}
                      onClick={() => setCategoriesOpen(false)}
                      className="flex flex-col rounded-xl p-2.5 text-xs font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                    >
                      <span>{title}</span>
                      <span className="text-[10px] font-normal text-slate-400">
                        {category.count || 'Explore'}
                      </span>
                    </Link>
                  );
                })}
                <div className="col-span-2 mt-1 border-t border-slate-100 pt-2 text-center">
                  <Link
                    to="/products"
                    onClick={() => setCategoriesOpen(false)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    View all 900+ rentals →
                  </Link>
                </div>
              </div>
            )}
          </div>

          <a
            href="/#how-it-works"
            className="relative rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-600 transition-colors duration-150 hover:text-slate-950 hover:bg-slate-100/70"
          >
            How It Works
          </a>
        </div>

        {/* Right Action Center */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Wishlist Link */}
          <NavLink
            to="/dashboard?tab=wishlist"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-transparent text-slate-600 transition-colors duration-150 hover:border-slate-200 hover:bg-slate-100 hover:text-slate-950 focus:outline-none"
            aria-label="Wishlist"
          >
            <HeartIcon />
            {favoriteProducts.length > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-xs">
                {favoriteProducts.length}
              </span>
            )}
          </NavLink>

          {/* Cart Link */}
          <NavLink
            to="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-transparent text-slate-600 transition-colors duration-150 hover:border-slate-200 hover:bg-slate-100 hover:text-blue-600 focus:outline-none"
            aria-label="View cart"
          >
            <CartIcon />
            {cartCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white shadow-xs">
                {cartCount}
              </span>
            )}
          </NavLink>

          {/* User Account / Auth Buttons */}
          {user ? (
            <div className="hidden items-center gap-2 lg:flex">
              <NavLink
                to="/dashboard"
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:border-blue-300 hover:bg-blue-50"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-950 text-[10px] font-bold text-white">
                  {user.name?.slice(0, 1).toUpperCase() || 'U'}
                </div>
                <span className="max-w-[80px] truncate">{user.name.split(' ')[0]}</span>
              </NavLink>
              <button
                type="button"
                onClick={logout}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 lg:flex">
              <NavLink
                to="/login"
                className="rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
              >
                Sign In
              </NavLink>
              <NavLink
                to="/register"
                className="inline-flex items-center rounded-xl bg-slate-950 px-4 py-2 text-xs font-semibold text-white shadow-sm transition duration-150 hover:bg-blue-600"
              >
                Get Started
              </NavLink>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-colors duration-150 hover:bg-slate-100 md:hidden"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Navigation */}
      {mobileOpen && (
        <div className="border-t border-slate-200/80 bg-white md:hidden">
          <div className="space-y-3 px-4 py-4 sm:px-6">
            {/* Search Input for Mobile */}
            <form onSubmit={handleSearch}>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <SearchIcon />
                </span>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search 900+ rentals..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs font-medium text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
            </form>

            {/* Primary Nav Links */}
            <div className="space-y-1">
              <NavLink
                to="/"
                end
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block rounded-xl px-3.5 py-2.5 text-sm font-semibold ${
                    isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                  }`
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/products"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block rounded-xl px-3.5 py-2.5 text-sm font-semibold ${
                    isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                  }`
                }
              >
                Explore All (900+)
              </NavLink>
              <a
                href="/#how-it-works"
                onClick={() => setMobileOpen(false)}
                className="block rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-950"
              >
                How It Works
              </a>
            </div>

            {/* Category Quick Selector in Mobile */}
            <div className="border-t border-slate-100 pt-3">
              <p className="px-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Browse Categories
              </p>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((category) => {
                  const title = category.title || category.name;
                  return (
                    <Link
                      key={category.slug || title}
                      to={`/products?category=${encodeURIComponent(title)}`}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 transition hover:border-blue-200 hover:bg-blue-50"
                    >
                      {title}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Quick Action Grid */}
            <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-3">
              <NavLink
                to="/products"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center rounded-xl bg-slate-50 py-2.5 text-xs font-semibold text-slate-700"
              >
                Catalog
              </NavLink>
              <NavLink
                to="/dashboard?tab=wishlist"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-1 rounded-xl bg-slate-50 py-2.5 text-xs font-semibold text-slate-700"
              >
                <HeartIcon />
                Saved ({favoriteProducts.length})
              </NavLink>
              <NavLink
                to="/cart"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-1 rounded-xl bg-slate-50 py-2.5 text-xs font-semibold text-slate-700"
              >
                <CartIcon />
                Cart ({cartCount})
              </NavLink>
            </div>

            {/* Auth Action */}
            <div className="flex gap-2 pt-2">
              <NavLink
                to={user ? "/dashboard" : "/login"}
                onClick={() => setMobileOpen(false)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700"
              >
                <UserIcon />
                {user ? 'Dashboard' : 'Sign In'}
              </NavLink>
              <NavLink
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="flex flex-1 items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
              >
                Get Started
              </NavLink>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

