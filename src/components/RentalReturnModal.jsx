import { useState } from 'react';
import { RotateCcw, AlertCircle, ShieldCheck, X, Truck } from 'lucide-react';

export default function RentalReturnModal({ rental, isOpen, onClose, onConfirm }) {
  const [returnReason, setReturnReason] = useState('Tenure completed');
  const [pickupDate, setPickupDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [pickupSlot, setPickupSlot] = useState('Morning (9 AM - 1 PM)');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !rental) return null;

  const depositAmount = Number(rental.depositPaid || rental.deposit || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pickupDate) {
      setError('Please select a pickup date.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await onConfirm(rental.id, {
        returnReason,
        pickupDate,
        pickupSlot,
        notes,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit return request.');
    } finally {
      setSubmitting(false);
    }
  };

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
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
            <RotateCcw className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Schedule Rental Return</h3>
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

        <div className="mb-5 rounded-xl bg-slate-50 p-3.5 border border-slate-100 flex items-center gap-3">
          {rental.product?.image && (
            <img
              src={rental.product.image}
              alt={rental.product.name}
              className="h-12 w-12 rounded-lg object-cover border border-slate-200"
            />
          )}
          <div className="text-xs">
            <p className="font-bold text-slate-900">{rental.product?.name || rental.productName}</p>
            <p className="text-slate-500">
              Security Deposit Held: <span className="font-semibold text-emerald-700">₹{depositAmount.toLocaleString('en-IN')}</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-800 mb-1">Reason for Return</label>
            <select
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-medium text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="Tenure completed">Tenure completed</option>
              <option value="Upgrading to a different product">Upgrading to a different product</option>
              <option value="Relocating to another city">Relocating to another city</option>
              <option value="No longer required">No longer required</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Preferred Pickup Date</label>
              <div className="relative">
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Pickup Time Window</label>
              <select
                value={pickupSlot}
                onChange={(e) => setPickupSlot(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="Morning (9 AM - 1 PM)">Morning (9 AM - 1 PM)</option>
                <option value="Afternoon (1 PM - 5 PM)">Afternoon (1 PM - 5 PM)</option>
                <option value="Evening (5 PM - 8 PM)">Evening (5 PM - 8 PM)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Pickup Notes / Instructions (Optional)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Service elevator available, call before arrival"
              className="w-full rounded-xl border border-slate-200 p-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-800 font-bold">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Deposit Refund Protection</span>
            </div>
            <p className="text-[11px] text-emerald-700">
              Your refundable deposit of <span className="font-bold">₹{depositAmount.toLocaleString('en-IN')}</span> will be initiated to your original payment method within 24–48 hours after our doorstep quality check.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-slate-200 px-4 py-2.5 font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-600 px-5 py-2.5 font-bold text-white shadow-xs hover:bg-amber-700 disabled:opacity-50 transition"
            >
              <Truck className="h-4 w-4" />
              {submitting ? 'Scheduling...' : 'Schedule Pickup & Return'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
