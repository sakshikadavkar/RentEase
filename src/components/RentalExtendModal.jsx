import { useState } from 'react';
import { Calendar, CheckCircle, Clock, ShieldCheck, X, AlertCircle } from 'lucide-react';

export default function RentalExtendModal({ rental, isOpen, onClose, onConfirm }) {
  const [selectedMonths, setSelectedMonths] = useState(6);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !rental) return null;

  const currentEndDate = rental.endDate ? new Date(rental.endDate) : new Date();
  const newEndDate = new Date(currentEndDate);
  newEndDate.setMonth(newEndDate.getMonth() + Number(selectedMonths));

  const baseMonthly = Number(rental.monthlyRent || rental.product?.monthlyPrice || 1499);
  
  // Extension tenure discount tier
  let discountPercent = 0;
  if (selectedMonths >= 12) discountPercent = 0.15;
  else if (selectedMonths >= 6) discountPercent = 0.10;
  else if (selectedMonths >= 3) discountPercent = 0.05;

  const effectiveMonthly = Math.round(baseMonthly * (1 - discountPercent));
  const monthlySavings = baseMonthly - effectiveMonthly;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await onConfirm(rental.id, Number(selectedMonths));
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to extend rental. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const durationOptions = [
    { months: 1, label: '1 Month', tag: 'Flexible' },
    { months: 3, label: '3 Months', tag: '5% Off' },
    { months: 6, label: '6 Months', tag: '10% Off Popular' },
    { months: 12, label: '12 Months', tag: '15% Off Best Value' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <button
          onClick={onClose}
          disabled={submitting}
          className="absolute right-4 top-4 rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Extend Rental Tenure</h3>
            <p className="text-xs text-slate-500">
              Subscription ID: <span className="font-semibold text-slate-700">{rental.rentalNumber || rental.id}</span>
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700 border border-rose-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mb-5 rounded-xl bg-slate-50 p-4 border border-slate-100">
          <div className="flex items-center gap-3">
            {rental.product?.image && (
              <img
                src={rental.product.image}
                alt={rental.product.name}
                className="h-14 w-14 rounded-lg object-cover border border-slate-200"
              />
            )}
            <div>
              <p className="font-bold text-slate-900 text-sm">{rental.product?.name || rental.productName}</p>
              <p className="text-xs text-slate-500">
                Current End Date: <span className="font-medium text-slate-700">{currentEndDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">
              Select Additional Duration
            </label>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {durationOptions.map((opt) => (
                <button
                  key={opt.months}
                  type="button"
                  onClick={() => setSelectedMonths(opt.months)}
                  className={`flex flex-col items-center justify-center rounded-xl p-3 text-center border transition ${
                    selectedMonths === opt.months
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-500/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-sm font-bold">{opt.label}</span>
                  <span className="mt-1 text-[10px] font-semibold text-blue-600">
                    {opt.tag}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">New End Date</span>
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-blue-600" />
                {newEndDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-600">Updated Monthly Rent</span>
              <div className="text-right">
                <span className="font-bold text-slate-900">₹{effectiveMonthly.toLocaleString('en-IN')}/mo</span>
                {monthlySavings > 0 && (
                  <span className="ml-2 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    Save ₹{monthlySavings}/mo
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-200">
              <span className="text-slate-600">Security Deposit Status</span>
              <span className="font-semibold text-emerald-700 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                ₹{Number(rental.depositPaid || rental.deposit || 0).toLocaleString('en-IN')} Rollover
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Free maintenance and relocation warranty continue automatically with no break.</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-600 disabled:opacity-50 transition"
            >
              {submitting ? 'Extending...' : `Confirm +${selectedMonths} Months Extension`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
