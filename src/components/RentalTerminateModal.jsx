import { useState } from 'react';
import { AlertTriangle, X, AlertCircle } from 'lucide-react';

export default function RentalTerminateModal({ rental, isOpen, onClose, onConfirm }) {
  const [reason, setReason] = useState('Relocation');
  const [pickupDate, setPickupDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [pickupSlot, setPickupSlot] = useState('Morning (9 AM - 1 PM)');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !rental) return null;

  const deposit = Number(rental.depositPaid || rental.deposit || 0);
  const earlyTerminationFee = 499;
  const expectedRefund = Math.max(0, deposit - earlyTerminationFee);

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
        reason,
        pickupDate,
        pickupSlot,
        notes,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit early termination.');
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
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Request Early Termination</h3>
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

        <div className="mb-4 rounded-xl bg-slate-50 p-3.5 border border-slate-100 flex items-center gap-3">
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
              Monthly Rent: <span className="font-semibold text-slate-800">₹{Number(rental.monthlyRent || 0).toLocaleString('en-IN')}/mo</span>
            </p>
          </div>
        </div>

        {/* Transparent Cost Breakdown */}
        <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2 text-xs">
          <h4 className="font-bold text-slate-900">Settlement & Deposit Breakdown</h4>
          <div className="flex justify-between text-slate-600">
            <span>Security Deposit Paid</span>
            <span className="font-semibold text-slate-900">₹{deposit.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-rose-600">
            <span>Early Termination Processing Fee</span>
            <span className="font-semibold">-₹{earlyTerminationFee.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-slate-900">
            <span>Estimated Refundable Amount</span>
            <span className="text-emerald-600">₹{expectedRefund.toLocaleString('en-IN')}</span>
          </div>
          <p className="text-[11px] text-slate-500">
            *Final refund is processed to your original payment method after quality check.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-800 mb-1">Reason for Early Closure</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-medium text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="Relocation">Relocating to another city/country</option>
              <option value="Purchased own items">Purchased own furniture</option>
              <option value="Financial reasons">Financial reasons</option>
              <option value="Other">Other reason</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Pickup Date</label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Pickup Slot</label>
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
            <label className="block font-bold text-slate-800 mb-1">Additional Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any specific instructions for our pickup team"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
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
              className="inline-flex items-center justify-center rounded-xl bg-rose-600 px-5 py-2.5 font-bold text-white shadow-xs hover:bg-rose-700 disabled:opacity-50 transition"
            >
              {submitting ? 'Processing...' : 'Confirm Early Termination'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
