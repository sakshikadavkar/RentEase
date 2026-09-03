import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRental } from '../context/useRental';

function generateRentalOrder(cart, monthlySubtotal, totalDeposit, totalDueToday, formData) {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const now = new Date();
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  return {
    id: `RNT-${randomSuffix}`,
    productName: cart.length > 0 ? (cart[0].product.name || cart[0].product.title) : 'Custom Furniture Set',
    category: cart.length > 0 ? cart[0].product.category : 'Home Essentials',
    tenureMonths: cart.length > 0 ? cart[0].tenure : 12,
    monthlyRent: monthlySubtotal,
    deposit: totalDeposit,
    startDate: now.toISOString().split('T')[0],
    nextBillingDate: nextMonth.toISOString().split('T')[0],
    status: 'Active',
    deliveryAddress: `${formData.address}, ${formData.city} - ${formData.pincode}`,
    totalDueToday,
    itemCount: cart.length,
  };
}

export default function Checkout() {
  const { cart, clearCart, user, addRental } = useRental();
  const [placedOrder, setPlacedOrder] = useState(null);
  const [formData, setFormData] = useState({
    fullName: user?.name || 'Alex Morgan',
    phone: '9876543210',
    email: user?.email || 'alex.morgan@example.com',
    address: 'Flat 402, Skyline Heights, 12th Main Rd',
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
    const baseDeposit = item.product.deposit || item.product.securityDeposit || (item.product.monthlyPrice * 2);
    return baseDeposit * item.quantity;
  };

  const monthlySubtotal = cart.reduce((sum, item) => sum + calculateItemRent(item), 0);
  const totalDeposit = cart.reduce((sum, item) => sum + calculateItemDeposit(item), 0);
  const gst = Math.round(monthlySubtotal * 0.18);
  const totalDueToday = monthlySubtotal + totalDeposit + gst;

  const handleSubmit = (e) => {
    e.preventDefault();
    const newRental = generateRentalOrder(
      cart,
      monthlySubtotal,
      totalDeposit,
      totalDueToday,
      formData
    );

    addRental(newRental);
    setPlacedOrder(newRental);
    clearCart();
  };

  if (placedOrder) {
    return (
      <div className="mx-auto max-w-xl py-12 text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
            Order Confirmed · ID: {placedOrder.id}
          </span>
          <h1 className="mt-3 text-2xl sm:text-3xl font-black text-slate-950">Rental Order Placed Successfully!</h1>
          <p className="mt-2 text-xs text-slate-600 sm:text-sm">
            Thank you, {formData.fullName}. Your rental setup is scheduled for delivery in {formData.city} within 48 hours.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-xs space-y-3 text-xs">
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500">Rental Reference</span>
            <span className="font-bold text-slate-900">{placedOrder.id}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500">Delivery Address</span>
            <span className="font-medium text-slate-900 text-right max-w-[240px]">{placedOrder.deliveryAddress}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500">Estimated Delivery</span>
            <span className="font-bold text-blue-600">Within 48 Hours</span>
          </div>
          <div className="flex justify-between pt-1 font-bold text-slate-950">
            <span>First Month Total Paid</span>
            <span>₹{placedOrder.totalDueToday.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex justify-center gap-3">
          <Link
            to="/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-6 text-xs font-bold text-white shadow-xs hover:bg-blue-700"
          >
            Go to My Dashboard
          </Link>
          <Link
            to="/products"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-6 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50"
          >
            Browse More
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-2xl font-black text-slate-950">No items to checkout</h2>
        <p className="text-xs text-slate-600">Please add products to your cart before proceeding to checkout.</p>
        <Link
          to="/products"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-6 text-xs font-bold text-white"
        >
          Explore Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">Checkout & Delivery Setup</h1>
        <p className="text-xs text-slate-500 mt-1">Provide your delivery details and choose your payment method</p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-12">
        {/* Left Column: Delivery Form & Payment */}
        <div className="lg:col-span-8 space-y-6">
          {/* Delivery Address Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">1. Delivery & Contact Details</h3>

            <div className="grid gap-4 sm:grid-cols-2 text-xs">
              <label className="space-y-1 block">
                <span className="font-semibold text-slate-700">Full Name</span>
                <input
                  required
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="space-y-1 block">
                <span className="font-semibold text-slate-700">Phone Number</span>
                <input
                  required
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="space-y-1 block sm:col-span-2">
                <span className="font-semibold text-slate-700">Delivery Street Address</span>
                <input
                  required
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="space-y-1 block">
                <span className="font-semibold text-slate-700">City</span>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
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
              </label>

              <label className="space-y-1 block">
                <span className="font-semibold text-slate-700">Pincode</span>
                <input
                  required
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </label>
            </div>
          </div>

          {/* Payment Method Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">2. Payment Method</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { id: 'UPI', label: 'UPI / QR', desc: 'GPay, PhonePe, Paytm' },
                { id: 'Card', label: 'Credit / Debit Card', desc: 'Visa, MasterCard, Rupay' },
                { id: 'POD', label: 'Pay on Delivery', desc: 'Upon doorstep installation' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMethod: m.id })}
                  className={`flex flex-col items-start p-3 rounded-xl border text-left transition ${
                    formData.paymentMethod === m.id
                      ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-100'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-900">{m.label}</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">{m.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Place Order */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Rental Summary</h3>

            <div className="divide-y divide-slate-100 text-xs">
              {cart.map((item) => (
                <div key={`${item.product.id}-${item.tenure}`} className="py-2.5 flex justify-between">
                  <div>
                    <p className="font-bold text-slate-900 line-clamp-1">{item.product.name || item.product.title}</p>
                    <p className="text-[10px] text-slate-400">{item.tenure} mo tenure · Qty {item.quantity}</p>
                  </div>
                  <span className="font-semibold text-slate-900">₹{calculateItemRent(item).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
              <div className="flex justify-between text-slate-600">
                <span>Monthly Rent Subtotal</span>
                <span className="font-semibold text-slate-900">₹{monthlySubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Security Deposit</span>
                <span className="font-semibold text-slate-900">₹{totalDeposit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery & Setup</span>
                <span className="font-semibold text-emerald-600">FREE</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST (18%)</span>
                <span className="font-semibold text-slate-900">₹{gst.toLocaleString()}</span>
              </div>

              <div className="border-t border-slate-100 pt-3 flex justify-between items-baseline">
                <span className="text-sm font-black text-slate-950">Total First Month</span>
                <span className="text-lg font-black text-blue-600">₹{totalDueToday.toLocaleString()}</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full inline-flex h-11 items-center justify-center rounded-xl bg-slate-950 px-4 text-xs font-bold text-white shadow-xs hover:bg-blue-600 transition"
            >
              Confirm & Place Rental Order
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
