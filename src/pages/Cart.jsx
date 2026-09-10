import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  MapPin,
  Clock,
  ShieldCheck,
  Truck,
  Wrench,
  RotateCcw,
  Home,
  ChevronRight,
  Check,
} from 'lucide-react';
import { useRental } from '../context/useRental';
import ProductImage from '../components/ProductImage';

export default function Cart() {
  const { cart, removeFromCart, updateCartQuantity, clearCart, addToCart } = useRental();
  const navigate = useNavigate();

  const tenureMultipliers = {
    1: 1.25,
    3: 1.1,
    6: 1.0,
    12: 0.9,
  };

  const calculateItemRent = (item) => {
    const base = item.product.monthlyPrice || 999;
    const mult = tenureMultipliers[item.tenure] || 1;
    return Math.round(base * mult) * item.quantity;
  };

  const calculateItemDeposit = (item) => {
    if (item.tenure >= 6) return 0; // 0 deposit promo
    const baseDeposit = item.product.deposit || item.product.securityDeposit || (item.product.monthlyPrice * 2);
    return baseDeposit * item.quantity;
  };

  const monthlySubtotal = cart.reduce((sum, item) => sum + calculateItemRent(item), 0);
  const totalDeposit = cart.reduce((sum, item) => sum + calculateItemDeposit(item), 0);
  const gst = Math.round(monthlySubtotal * 0.18);
  const totalDueToday = monthlySubtotal + totalDeposit + gst;

  const totalUnits = cart.reduce((sum, item) => sum + item.quantity, 0);

  const tenureOptions = [
    { months: 1, label: '1 mo', badge: 'Standard' },
    { months: 3, label: '3 mo', badge: 'Save 10%' },
    { months: 6, label: '6 mo', badge: '0₹ Deposit' },
    { months: 12, label: '12 mo', badge: 'Best Value' },
  ];

  const handleTenureChange = (item, newTenure) => {
    if (item.tenure === newTenure) return;
    removeFromCart(item.product.id, item.tenure);
    addToCart(item.product, newTenure, item.quantity);
  };

  if (cart.length === 0) {
    return (
      <div className="relative py-16 sm:py-24 text-center">
        {/* Subtle Ambient Glow */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="mx-auto max-w-md space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 border border-blue-100/80 text-blue-600 shadow-xs">
            <ShoppingBag className="h-10 w-10 stroke-[1.5]" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
              Your rental cart is empty
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              You haven&apos;t added any furniture, appliances, or electronics yet. Explore our curated catalog of 900+ rentals with flexible tenures and zero deposit options.
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/products"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-500/25 hover:bg-blue-700 active:scale-[0.99] transition-all duration-200"
            >
              <span>Explore Rentals</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Quick Popular Categories */}
          <div className="pt-6 border-t border-slate-200/80">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Popular Rental Categories
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {['Living Room', 'Bedroom', 'Appliances', 'Study & Work'].map((cat) => (
                <Link
                  key={cat}
                  to={`/products?category=${encodeURIComponent(cat)}`}
                  className="rounded-lg border border-slate-200/90 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-blue-600 hover:text-blue-600 transition-colors shadow-2xs"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative space-y-8 pb-12">
      {/* Subtle Ambient Background Gradients */}
      <div className="pointer-events-none absolute -top-10 left-1/4 -z-10 h-72 w-72 rounded-full bg-blue-500/5 blur-3xl" />
      <div className="pointer-events-none absolute top-40 right-10 -z-10 h-72 w-72 rounded-full bg-indigo-500/5 blur-3xl" />

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-medium text-slate-500 overflow-x-auto whitespace-nowrap py-1">
        <Link to="/" className="inline-flex items-center gap-1 hover:text-blue-600 transition-colors">
          <Home className="h-3.5 w-3.5" />
          <span>Home</span>
        </Link>
        <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
        <Link to="/products" className="hover:text-blue-600 transition-colors">
          Explore Rentals
        </Link>
        <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
        <span className="text-slate-900 font-semibold">Your Rental Cart</span>
      </nav>

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-950">
              Your Rental Cart
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-200/60">
              {totalUnits} {totalUnits === 1 ? 'unit' : 'units'} · {cart.length} {cart.length === 1 ? 'item plan' : 'item plans'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1.5">
            Review your items, rental plans and delivery details before checkout.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Continue Browsing</span>
          </Link>
          <span className="text-slate-300">|</span>
          <button
            type="button"
            onClick={clearCart}
            className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear Cart</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Cart Items (Left) + Order Summary (Right) */}
      <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {cart.map((item) => {
            const itemMonthly = calculateItemRent(item);
            const itemDeposit = calculateItemDeposit(item);
            const isZeroDep = item.tenure >= 6;
            const singleUnitMonthly = Math.round(itemMonthly / item.quantity);

            return (
              <div
                key={`${item.product.id}-${item.tenure}`}
                className="group relative rounded-2xl border border-slate-200/85 bg-white p-4 sm:p-5 shadow-xs transition-all duration-200 hover:border-slate-300"
              >
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  {/* Product Image Thumbnail */}
                  <Link
                    to={`/products/${item.product.id}`}
                    className="h-24 w-24 sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-xl border border-slate-200/80 bg-slate-100 group-hover:opacity-95 transition"
                  >
                    <ProductImage
                      src={item.product.image}
                      alt={item.product.name || item.product.title}
                      className="h-full w-full object-cover"
                    />
                  </Link>

                  {/* Product Info & Tenure Configurator */}
                  <div className="flex-1 min-w-0 space-y-3 w-full">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                            {item.product.category}{item.product.subcategory ? ` · ${item.product.subcategory}` : ''}
                          </span>
                          {item.product.city && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                              <MapPin className="h-3 w-3 text-slate-400" />
                              <span>{item.product.city}</span>
                            </span>
                          )}
                        </div>

                        <Link
                          to={`/products/${item.product.id}`}
                          className="mt-1 block text-sm sm:text-base font-bold text-slate-900 hover:text-blue-600 transition-colors line-clamp-1"
                        >
                          {item.product.name || item.product.title}
                        </Link>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product.id, item.tenure)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors shrink-0"
                        aria-label={`Remove ${item.product.name} with ${item.tenure} months tenure from cart`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Rental Tenure Prominence & Selector */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700 flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-blue-600" />
                          <span>Rental Tenure:</span>
                        </span>
                        {isZeroDep ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200/80">
                            <Sparkles className="h-3 w-3" />
                            <span>0₹ Security Deposit</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-500">
                            Deposit: <strong className="text-slate-700 font-bold">₹{itemDeposit.toLocaleString('en-IN')}</strong> (Refundable)
                          </span>
                        )}
                      </div>

                      {/* Tenure Selector Chips */}
                      <div className="grid grid-cols-4 gap-1.5">
                        {tenureOptions.map((opt) => {
                          const isSelected = item.tenure === opt.months;
                          return (
                            <button
                              key={opt.months}
                              type="button"
                              onClick={() => handleTenureChange(item, opt.months)}
                              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-center transition-all duration-150 ${
                                isSelected
                                  ? 'bg-blue-600 text-white font-bold shadow-xs ring-2 ring-blue-500/20'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 font-medium'
                              }`}
                            >
                              <span className="text-xs">{opt.label}</span>
                              <span
                                className={`text-[10px] truncate max-w-full ${
                                  isSelected ? 'text-blue-100 font-semibold' : 'text-slate-500'
                                }`}
                              >
                                {opt.badge}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Quantity Stepper & Price Line */}
                    <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-500">Quantity:</span>
                        <div className="flex h-9 items-center rounded-xl border border-slate-200 bg-white px-1 shadow-2xs">
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.product.id, item.tenure, item.quantity - 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 active:scale-95 transition"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-slate-900">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.product.id, item.tenure, item.quantity + 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 active:scale-95 transition"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-baseline justify-end gap-1">
                          <span className="text-base sm:text-lg font-black text-slate-950">
                            ₹{itemMonthly.toLocaleString('en-IN')}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">/ mo</span>
                        </div>
                        {item.quantity > 1 && (
                          <span className="text-[10px] text-slate-400 font-medium block">
                            (₹{singleUnitMonthly.toLocaleString('en-IN')}/mo per unit)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Compact Trust Reassurance Strip */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 shrink-0">
                  <Clock className="h-4 w-4" />
                </span>
                <div>
                  <h4 className="font-bold text-slate-900">Flexible Plans</h4>
                  <p className="text-[11px] text-slate-500">1 to 12 months</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                  <Truck className="h-4 w-4" />
                </span>
                <div>
                  <h4 className="font-bold text-slate-900">Free 48h Delivery</h4>
                  <p className="text-[11px] text-slate-500">Doorstep setup</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                  <Wrench className="h-4 w-4" />
                </span>
                <div>
                  <h4 className="font-bold text-slate-900">Free Maintenance</h4>
                  <p className="text-[11px] text-slate-500">Zero service fees</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 shrink-0">
                  <RotateCcw className="h-4 w-4" />
                </span>
                <div>
                  <h4 className="font-bold text-slate-900">Easy Returns</h4>
                  <p className="text-[11px] text-slate-500">Zero return hassle</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Premium Sticky Rental Summary Panel */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                <span>Rental Summary</span>
              </h3>
              <span className="text-xs font-semibold text-slate-500">
                {totalUnits} {totalUnits === 1 ? 'Unit' : 'Units'}
              </span>
            </div>

            {/* Financial Breakdown */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span>Monthly Rent Subtotal</span>
                <span className="font-bold text-slate-900">
                  ₹{monthlySubtotal.toLocaleString('en-IN')} / mo
                </span>
              </div>

              {/* Security Deposit Display */}
              {totalDeposit === 0 ? (
                <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/70 p-3">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                      SECURITY DEPOSIT
                    </span>
                    <span className="text-sm font-black text-emerald-700">₹0</span>
                  </div>
                  <p className="mt-1 text-[11px] text-emerald-700 font-medium">
                    Eligible on 6+ month plans
                  </p>
                </div>
              ) : (
                <div className="flex justify-between items-center text-slate-600">
                  <div>
                    <span>Security Deposit</span>
                    <span className="block text-[10px] text-slate-400">100% refundable on return</span>
                  </div>
                  <span className="font-bold text-slate-900">
                    ₹{totalDeposit.toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center text-slate-600">
                <span>Doorstep Delivery & Assembly</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" />
                  <span>FREE</span>
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-600">
                <span>Applicable GST (18%)</span>
                <span className="font-bold text-slate-900">
                  ₹{gst.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Total Due Today */}
              <div className="border-t border-slate-100 pt-3 flex items-baseline justify-between">
                <div>
                  <p className="text-sm font-black text-slate-950">Total Due Today</p>
                  <p className="text-[10px] text-slate-400">1st month rent + deposit + GST</p>
                </div>
                <div className="text-right">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-blue-600">
                    ₹{totalDueToday.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Dominant Primary CTA */}
            <button
              type="button"
              onClick={() => navigate('/checkout')}
              className="w-full inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-md shadow-blue-500/25 hover:bg-blue-700 active:scale-[0.99] transition-all duration-200"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            {/* Trust Footer */}
            <div className="pt-2 text-center text-[11px] text-slate-400 space-y-1">
              <p className="flex items-center justify-center gap-1.5 font-medium text-slate-500">
                <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
                <span>Encrypted 256-bit secure checkout</span>
              </p>
              <p>7-day hassle-free return window · Zero lock-in fee</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

