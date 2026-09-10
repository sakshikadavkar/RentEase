import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRental } from '../context/useRental';
import {
  CheckCircle2,
  ShieldCheck,
  Truck,
  AlertCircle,
  Clock,
  MapPin,
  CreditCard,
  QrCode,
  Banknote,
  Lock,
  ArrowRight,
  Sparkles,
  RotateCcw,
  Wrench,
  Check,
  Home,
  ChevronRight,
  ShoppingBag,
} from 'lucide-react';
import ProductImage from '../components/ProductImage';

export default function Checkout() {
  const { cart, user, createOrder } = useRental();
  const [placedOrder, setPlacedOrder] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    fullName: user?.name || 'Alex Morgan',
    phone: '+91 9876543210',
    email: user?.email || 'alex.morgan@example.com',
    address: 'Flat 402, Skyline Heights, 12th Main Rd, Indiranagar',
    city: user?.city || 'Bengaluru',
    pincode: '560038',
    deliverySlot: 'Morning (9 AM - 1 PM)',
    paymentMethod: 'UPI',
  });

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
    if (item.tenure >= 6) return 0;
    const baseDeposit = item.product.deposit ?? item.product.securityDeposit ?? (item.product.monthlyPrice * 2);
    return baseDeposit * item.quantity;
  };

  const monthlySubtotal = cart.reduce((sum, item) => sum + calculateItemRent(item), 0);
  const totalDeposit = cart.reduce((sum, item) => sum + calculateItemDeposit(item), 0);
  const gst = Math.round(monthlySubtotal * 0.18);
  const totalDueToday = monthlySubtotal + totalDeposit + gst;
  const totalUnits = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Build order payload for backend
      const orderPayload = {
        items: cart.map((item) => ({
          product: {
            id: item.product.id,
            monthlyPrice: item.product.monthlyPrice || 999,
            deposit: item.product.deposit ?? 0,
          },
          tenure: item.tenure,
          quantity: item.quantity,
        })),
        deliveryAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          pincode: formData.pincode,
        },
        deliverySlot: formData.deliverySlot,
        paymentMethod: formData.paymentMethod,
        totalDueToday,
        monthlySubtotal,
        totalDeposit,
      };

      const result = await createOrder(orderPayload);
      if (result && result.data) {
        setPlacedOrder(result.data);
      } else {
        const orderTimestamp = new Date().getTime();
        setPlacedOrder({
          order: {
            orderNumber: `ORD-${orderTimestamp.toString().slice(-6)}`,
            deliverySlot: formData.deliverySlot,
          },
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (placedOrder) {
    const orderNum = placedOrder.order?.orderNumber || 'ORD-Live';
    return (
      <div className="relative max-w-2xl mx-auto py-12 sm:py-20 text-center space-y-8">
        {/* Ambient Glow */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 border border-emerald-200/80 text-emerald-600 shadow-xs">
          <CheckCircle2 className="h-10 w-10 stroke-[1.75]" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-200/70">
            <Check className="h-3.5 w-3.5" />
            <span>Order Confirmed · Ref: {orderNum}</span>
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-950">
            Rental Order Placed Successfully!
          </h1>
          <p className="max-w-lg mx-auto text-xs sm:text-sm text-slate-600 leading-relaxed">
            Thank you, <strong className="text-slate-900 font-semibold">{formData.fullName}</strong>. Your rental order has been confirmed and scheduled for doorstep delivery & assembly in {formData.city}.
          </p>
        </div>

        {/* Order Receipt Details Card */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 text-left shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="font-semibold text-slate-500">Order Reference</span>
            <span className="font-mono text-sm font-bold text-slate-900">{orderNum}</span>
          </div>

          <div className="flex items-start justify-between border-b border-slate-100 pb-3 gap-4">
            <span className="font-semibold text-slate-500 shrink-0">Delivery Address</span>
            <span className="font-medium text-slate-900 text-right max-w-xs">
              {formData.address}, {formData.city} - {formData.pincode}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="font-semibold text-slate-500">Scheduled Slot</span>
            <span className="font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
              {formData.deliverySlot}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="font-semibold text-slate-500">Payment Option</span>
            <span className="font-bold text-slate-800">
              {formData.paymentMethod === 'UPI' && 'UPI / Instant QR'}
              {formData.paymentMethod === 'Card' && 'Credit / Debit Card'}
              {formData.paymentMethod === 'POD' && 'Pay on Doorstep Delivery'}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div>
              <span className="text-sm font-black text-slate-950 block">First Month Total Paid</span>
              <span className="text-[11px] text-slate-400">1st month rent + deposit + GST</span>
            </div>
            <span className="text-xl font-black text-blue-600">
              ₹{totalDueToday.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/dashboard"
            className="w-full sm:w-auto inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-500/25 hover:bg-blue-700 active:scale-[0.99] transition-all"
          >
            <span>Go to My Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/products"
            className="w-full sm:w-auto inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs"
          >
            Browse More Rentals
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="relative py-16 sm:py-24 text-center max-w-md mx-auto space-y-6">
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 border border-blue-100/80 text-blue-600 shadow-xs">
          <ShoppingBag className="h-10 w-10 stroke-[1.5]" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
            No items to checkout
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Please add products to your rental cart before proceeding to checkout and scheduling delivery.
          </p>
        </div>
        <div className="pt-2">
          <Link
            to="/products"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-500/25 hover:bg-blue-700 transition"
          >
            <span>Explore Catalog</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative space-y-8 max-w-7xl mx-auto py-2 pb-14">
      {/* Ambient Backdrop Gradients */}
      <div className="pointer-events-none absolute -top-10 left-1/4 -z-10 h-72 w-72 rounded-full bg-blue-500/5 blur-3xl" />
      <div className="pointer-events-none absolute top-40 right-10 -z-10 h-72 w-72 rounded-full bg-indigo-500/5 blur-3xl" />

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-medium text-slate-500 overflow-x-auto whitespace-nowrap py-1">
        <Link to="/" className="inline-flex items-center gap-1 hover:text-blue-600 transition-colors">
          <Home className="h-3.5 w-3.5" />
          <span>Home</span>
        </Link>
        <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
        <Link to="/cart" className="hover:text-blue-600 transition-colors">
          Rental Cart
        </Link>
        <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
        <span className="text-slate-900 font-semibold">Checkout & Delivery</span>
      </nav>

      {/* Header & Step Flow Indicator */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-950">
            Checkout & Delivery Setup
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1.5">
            Review your rental plan, enter delivery details, and schedule doorstep installation.
          </p>
        </div>

        {/* Step Progress Tracker */}
        <div className="flex items-center gap-2 text-xs font-bold shrink-0">
          <Link
            to="/cart"
            className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-[10px]">
              ✓
            </span>
            <span>Cart</span>
          </Link>
          <span className="h-0.5 w-6 bg-emerald-400 rounded-full" />
          <div className="flex items-center gap-1.5 text-blue-600">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-[10px]">
              2
            </span>
            <span>Delivery & Details</span>
          </div>
          <span className="h-0.5 w-6 bg-slate-200 rounded-full" />
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-500 text-[10px]">
              3
            </span>
            <span>Confirmation</span>
          </div>
        </div>
      </div>

      {/* Error Alert Banner */}
      {error && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200/80 p-4 text-xs font-semibold text-rose-700 flex items-center gap-3 shadow-xs">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Checkout Form & Summary Grid */}
      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-12 lg:items-start">
        {/* Left Column: Delivery Form & Payment Setup */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Delivery Address & Contact */}
          <div className="rounded-3xl border border-slate-200/85 bg-white p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Truck className="h-4 w-4 text-blue-600" />
                <span>1. Delivery & Contact Details</span>
              </h2>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                Free Delivery & Setup
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 text-xs">
              <label className="space-y-1.5 block">
                <span className="font-semibold text-slate-700">Full Name</span>
                <input
                  required
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Alex Morgan"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </label>

              <label className="space-y-1.5 block">
                <span className="font-semibold text-slate-700">Phone Number (For Delivery Updates)</span>
                <input
                  required
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 9876543210"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </label>

              <label className="space-y-1.5 block sm:col-span-2">
                <span className="font-semibold text-slate-700">Delivery Street Address</span>
                <input
                  required
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="House/Flat No., Building Name, Street, Landmark"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </label>

              <label className="space-y-1.5 block">
                <span className="font-semibold text-slate-700">City / Operational Hub</span>
                <div className="relative">
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
                  >
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Delhi NCR">Delhi NCR</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Pune">Pune</option>
                    <option value="Chennai">Chennai</option>
                    <option value="Kolkata">Kolkata</option>
                    <option value="Jaipur">Jaipur</option>
                    <option value="Ahmedabad">Ahmedabad</option>
                  </select>
                  <MapPin className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                </div>
              </label>

              <label className="space-y-1.5 block">
                <span className="font-semibold text-slate-700">Postal Pincode</span>
                <input
                  required
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  placeholder="e.g. 560038"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </label>
            </div>

            {/* Delivery Slot Selection */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-blue-600" />
                  <span>Preferred Doorstep Delivery Slot</span>
                </span>
                <span className="text-[11px] text-slate-400">Within 48 hours</span>
              </div>

              <div className="grid gap-2.5 sm:grid-cols-3">
                {[
                  {
                    slot: 'Morning (9 AM - 1 PM)',
                    title: 'Morning Slot',
                    time: '9:00 AM – 1:00 PM',
                    badge: 'Early setup',
                  },
                  {
                    slot: 'Afternoon (1 PM - 5 PM)',
                    title: 'Afternoon Slot',
                    time: '1:00 PM – 5:00 PM',
                    badge: 'Popular',
                  },
                  {
                    slot: 'Evening (5 PM - 8 PM)',
                    title: 'Evening Slot',
                    time: '5:00 PM – 8:00 PM',
                    badge: 'Post work',
                  },
                ].map((s) => {
                  const isSelected = formData.deliverySlot === s.slot;
                  return (
                    <button
                      key={s.slot}
                      type="button"
                      onClick={() => setFormData({ ...formData, deliverySlot: s.slot })}
                      className={`flex flex-col p-3 rounded-2xl border text-left transition-all duration-150 ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/70 shadow-2xs ring-2 ring-blue-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={`text-xs font-bold ${isSelected ? 'text-blue-950' : 'text-slate-900'}`}>
                          {s.title}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {s.badge}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 mt-1 font-medium">{s.time}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Card 2: Payment Method */}
          <div className="rounded-3xl border border-slate-200/85 bg-white p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>2. Payment Method</span>
              </h2>
              <span className="text-[11px] text-slate-500 font-medium">
                Encrypted & Verified
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  id: 'UPI',
                  icon: QrCode,
                  label: 'UPI / Instant QR',
                  desc: 'GPay, PhonePe, Paytm',
                  badge: 'Instant',
                },
                {
                  id: 'Card',
                  icon: CreditCard,
                  label: 'Credit / Debit Card',
                  desc: 'Visa, MasterCard, RuPay',
                  badge: 'Secure 3D',
                },
                {
                  id: 'POD',
                  icon: Banknote,
                  label: 'Pay on Delivery',
                  desc: 'Upon doorstep installation',
                  badge: 'Zero Risk',
                },
              ].map((m) => {
                const isSelected = formData.paymentMethod === m.id;
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, paymentMethod: m.id })}
                    className={`flex flex-col p-4 rounded-2xl border text-left transition-all duration-150 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 shadow-2xs ring-2 ring-blue-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          isSelected ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {m.badge}
                      </span>
                    </div>

                    <div className="mt-3">
                      <span className={`text-xs font-bold block ${isSelected ? 'text-blue-950' : 'text-slate-900'}`}>
                        {m.label}
                      </span>
                      <span className="text-[11px] text-slate-500 mt-0.5 block">{m.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reassurance Row */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 shrink-0">
                  <ShieldCheck className="h-4 w-4" />
                </span>
                <div>
                  <h4 className="font-bold text-slate-900">Secure Checkout</h4>
                  <p className="text-[11px] text-slate-500">256-bit SSL encryption</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                  <Truck className="h-4 w-4" />
                </span>
                <div>
                  <h4 className="font-bold text-slate-900">Free 48h Delivery</h4>
                  <p className="text-[11px] text-slate-500">Includes setup & assembly</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                  <Wrench className="h-4 w-4" />
                </span>
                <div>
                  <h4 className="font-bold text-slate-900">Free Maintenance</h4>
                  <p className="text-[11px] text-slate-500">Routine service covered</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 shrink-0">
                  <RotateCcw className="h-4 w-4" />
                </span>
                <div>
                  <h4 className="font-bold text-slate-900">Easy Returns</h4>
                  <p className="text-[11px] text-slate-500">Zero lock-in penalties</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Order Summary & Place Order */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                <span>Order Summary</span>
              </h3>
              <span className="text-xs font-semibold text-slate-500">
                {totalUnits} {totalUnits === 1 ? 'Unit' : 'Units'} ({cart.length} {cart.length === 1 ? 'plan' : 'plans'})
              </span>
            </div>

            {/* Selected Products List */}
            <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto pr-1 text-xs space-y-2">
              {cart.map((item) => {
                const itemRent = calculateItemRent(item);
                const isZeroDep = item.tenure >= 6;
                return (
                  <div key={`${item.product.id}-${item.tenure}`} className="pt-2.5 first:pt-0 flex items-start gap-3">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-slate-200/70 bg-slate-100">
                      <ProductImage
                        src={item.product.image}
                        alt={item.product.name || item.product.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 line-clamp-1">
                        {item.product.name || item.product.title}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                        <span className="font-medium">{item.tenure} mo</span>
                        <span>·</span>
                        <span>Qty {item.quantity}</span>
                        {isZeroDep && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 rounded">
                            0₹ Dep
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-bold text-slate-900">
                        ₹{itemRent.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-slate-400 block">/ mo</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Financial Line Items */}
            <div className="space-y-2.5 text-xs border-t border-slate-100 pt-3">
              <div className="flex justify-between items-center text-slate-600">
                <span>Monthly Rent Subtotal</span>
                <span className="font-bold text-slate-900">
                  ₹{monthlySubtotal.toLocaleString('en-IN')} / mo
                </span>
              </div>

              {/* Security Deposit Line */}
              {totalDeposit === 0 ? (
                <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/70 p-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                      Security Deposit
                    </span>
                    <span className="text-sm font-black text-emerald-700">₹0</span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-emerald-700 font-medium">
                    Eligible on 6+ month rental plans
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
                <span>Delivery & Professional Setup</span>
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

              {/* Total First Month Due */}
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
              type="submit"
              disabled={submitting}
              className="w-full inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-md shadow-blue-500/25 hover:bg-blue-700 active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none transition-all duration-200"
            >
              <Lock className="h-4 w-4" />
              <span>{submitting ? 'Processing Order...' : 'Place Rental Order'}</span>
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
      </form>
    </div>
  );
}

