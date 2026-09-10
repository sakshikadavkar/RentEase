import { useState } from 'react';
import { Wrench, AlertCircle, X, Shield } from 'lucide-react';

export default function MaintenanceRequestModal({ rentals = [], defaultRentalId, isOpen, onClose, onConfirm }) {
  const [selectedRentalId, setSelectedRentalId] = useState(defaultRentalId || (rentals[0]?.id || ''));
  const [issueCategory, setIssueCategory] = useState('Appliance issue');
  const [urgency, setUrgency] = useState('medium');
  const [preferredTimeSlot, setPreferredTimeSlot] = useState('Morning (9 AM - 1 PM)');
  const [customerPhone, setCustomerPhone] = useState('+91 9876543210');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRentalId) {
      setError('Please select an active rental subscription.');
      return;
    }
    if (!description.trim()) {
      setError('Please describe the issue in detail.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await onConfirm({
        rentalId: selectedRentalId,
        issueCategory,
        urgency,
        preferredTimeSlot,
        customerPhone,
        description,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit maintenance request.');
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
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <Wrench className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Request Free Maintenance</h3>
            <p className="text-xs text-slate-500">100% Free Doorstep Support under RentEase Care Warranty</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700 border border-rose-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-800 mb-1">Select Rental Product</label>
            <select
              value={selectedRentalId}
              onChange={(e) => setSelectedRentalId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-semibold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              {rentals.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.product?.name || r.productName || `Rental ${r.rentalNumber || r.id}`} ({r.rentalNumber || `RNT-${r.id}`})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Issue Category</label>
              <select
                value={issueCategory}
                onChange={(e) => setIssueCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-medium text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="Appliance issue">Appliance issue / breakdown</option>
                <option value="Furniture damage">Furniture polish / joint fix</option>
                <option value="Electrical">Electrical / Motor issue</option>
                <option value="Deep cleaning">Deep Cleaning & Sanitization</option>
                <option value="Relocation support">Relocation & Reinstallation</option>
                <option value="Other">Other Maintenance</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Priority / Urgency</label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-medium text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="low">Low (Next 48–72 hours)</option>
                <option value="medium">Medium (Within 24–48 hours)</option>
                <option value="high">High (Same-Day Express)</option>
                <option value="critical">Critical (Immediate Assistance)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Preferred Time Slot</label>
              <select
                value={preferredTimeSlot}
                onChange={(e) => setPreferredTimeSlot(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-medium text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="Morning (9 AM - 1 PM)">Morning (9 AM - 1 PM)</option>
                <option value="Afternoon (1 PM - 5 PM)">Afternoon (1 PM - 5 PM)</option>
                <option value="Evening (5 PM - 8 PM)">Evening (5 PM - 8 PM)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Contact Phone</label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Problem Description</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please describe what needs servicing or repair..."
              className="w-full rounded-xl border border-slate-200 p-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-blue-50/60 p-3 text-[11px] text-blue-800 border border-blue-100">
            <Shield className="h-4 w-4 text-blue-600 shrink-0" />
            <span>All certified technician visits and genuine part replacements are completely ₹0 for active renters.</span>
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
              className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-5 py-2.5 font-bold text-white shadow-xs hover:bg-blue-600 disabled:opacity-50 transition"
            >
              {submitting ? 'Submitting...' : 'Submit Service Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
