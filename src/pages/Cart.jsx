import { Link, useNavigate } from 'react-router-dom';
import { useRental } from '../context/useRental';
import ProductImage from '../components/ProductImage';

export default function Cart() {
  const { cart, removeFromCart, updateCartQuantity, clearCart } = useRental();
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

  if (cart.length === 0) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h2 className="text-2xl font-black text-slate-950">Your Rental Cart is Empty</h2>
        <p className="max-w-md mx-auto text-xs text-slate-600 sm:text-sm">
          You haven&apos;t added any furniture or appliances yet. Explore our curated catalog of 900+ rentals with flexible tenures.
        </p>
        <div className="pt-2">
          <Link
            to="/products"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-6 text-xs font-bold text-white shadow-xs hover:bg-blue-700"
          >
            Explore 900+ Rentals
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">Rental Cart</h1>
          <p className="text-xs text-slate-500 mt-1">{cart.length} unique rental item(s) selected</p>
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline text-left sm:text-right"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {cart.map((item) => {
            const itemMonthly = calculateItemRent(item);
            const itemDeposit = calculateItemDeposit(item);
            const isZeroDep = item.tenure >= 6;

            return (
              <div
                key={`${item.product.id}-${item.tenure}`}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs"
              >
                <div className="flex items-center gap-4">
                  <div className="h-20 w-24 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-100">
                    <ProductImage
                      src={item.product.image}
                      alt={item.product.name || item.product.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <Link
                      to={`/products/${item.product.id}`}
                      className="text-sm font-bold text-slate-900 hover:text-blue-600 line-clamp-1"
                    >
                      {item.product.name || item.product.title}
                    </Link>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {item.product.category} · {item.tenure} Months Rental Tenure
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      {isZeroDep ? (
                        <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                          0₹ Deposit Promo
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">
                          Deposit: ₹{itemDeposit.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {/* Quantity Stepper */}
                  <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1">
                    <button
                      type="button"
                      onClick={() => updateCartQuantity(item.product.id, item.tenure, item.quantity - 1)}
                      className="flex h-7 w-7 items-center justify-center rounded text-slate-600 hover:bg-slate-100"
                    >
                      -
                    </button>
                    <span className="w-7 text-center text-xs font-bold">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateCartQuantity(item.product.id, item.tenure, item.quantity + 1)}
                      className="flex h-7 w-7 items-center justify-center rounded text-slate-600 hover:bg-slate-100"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-black text-slate-950">₹{itemMonthly.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-400">/ month</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.product.id, item.tenure)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                    aria-label="Remove item"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Financial Order Summary */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Order Summary</h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Monthly Rent Subtotal</span>
                <span className="font-semibold text-slate-900">₹{monthlySubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Refundable Security Deposit</span>
                <span className="font-semibold text-slate-900">₹{totalDeposit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Doorstep Delivery & Assembly</span>
                <span className="font-semibold text-emerald-600">FREE</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Applicable GST (18%)</span>
                <span className="font-semibold text-slate-900">₹{gst.toLocaleString()}</span>
              </div>

              <div className="border-t border-slate-100 pt-3 flex justify-between items-baseline">
                <div>
                  <p className="text-sm font-black text-slate-950">Total First Month Due</p>
                  <p className="text-[10px] text-slate-400">Includes 1st month rent + deposit + GST</p>
                </div>
                <span className="text-lg font-black text-blue-600">₹{totalDueToday.toLocaleString()}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/checkout')}
              className="w-full inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-4 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition"
            >
              Proceed to Secure Checkout
            </button>

            <p className="text-center text-[10px] text-slate-400">
              🔒 Encrypted 256-bit secure checkout · 7-day free return policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
