import { useState, useEffect, useCallback } from 'react';
import { useRental } from '../../context/useRental';
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Edit2,
  X,
} from 'lucide-react';

const RETURN_STATUSES = [
  { value: 'requested', label: 'Requested by User', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { value: 'scheduled', label: 'Pickup Scheduled', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { value: 'inspected', label: 'Inspected at Hub', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  { value: 'completed', label: 'Completed & Refunded', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { value: 'rejected', label: 'Return Rejected', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
];

export default function AdminReturns() {
  const { authFetch } = useRental();
  const [returns, setReturns] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editingReturn, setEditingReturn] = useState(null);
  const [formData, setFormData] = useState({
    status: 'requested',
    pickup_date: '',
    pickup_slot: '',
    inspection_condition: 'mint',
    damage_deduction: 0,
    refund_amount: 0,
    admin_notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchReturns = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 10);
      if (search.trim()) params.append('search', search.trim());
      if (statusFilter) params.append('status', statusFilter);

      const res = await authFetch(`/api/admin/returns?${params.toString()}`);
      if (res.success && res.data) {
        setReturns(res.data.returns || []);
        setPagination(res.data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
      }
    } catch (err) {
      console.error('Failed to load returns:', err);
    } finally {
      setLoading(false);
    }
  }, [authFetch, search, statusFilter]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const params = new URLSearchParams();
        params.append('page', 1);
        params.append('limit', 10);
        if (search.trim()) params.append('search', search.trim());
        if (statusFilter) params.append('status', statusFilter);

        const res = await authFetch(`/api/admin/returns?${params.toString()}`);
        if (active && res.success && res.data) {
          setReturns(res.data.returns || []);
          setPagination(res.data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
        }
      } catch (err) {
        console.error('Failed to load returns:', err);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [authFetch, search, statusFilter]);

  const handleOpenEdit = (ret) => {
    setEditingReturn(ret);
    const depositPaid = Number(ret.deposit_paid || 0);
    const currentDeduction = Number(ret.damage_deduction || 0);
    const calculatedRefund = Math.max(0, depositPaid - currentDeduction);

    setFormData({
      status: ret.status,
      pickup_date: ret.pickup_date ? new Date(ret.pickup_date).toISOString().split('T')[0] : '',
      pickup_slot: ret.pickup_slot || '',
      inspection_condition: ret.inspection_condition || 'mint',
      damage_deduction: currentDeduction,
      refund_amount: ret.refund_amount !== null ? Number(ret.refund_amount) : calculatedRefund,
      admin_notes: ret.admin_notes || '',
    });
  };

  const handleDeductionChange = (deductionVal) => {
    const deduction = Number(deductionVal);
    const depositPaid = Number(editingReturn?.deposit_paid || 0);
    const newRefund = Math.max(0, depositPaid - deduction);
    setFormData((prev) => ({
      ...prev,
      damage_deduction: deduction,
      refund_amount: newRefund,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await authFetch(`/api/admin/returns/${editingReturn.id}`, {
        method: 'PATCH',
        body: JSON.stringify(formData),
      });
      if (res.success) {
        setEditingReturn(null);
        fetchReturns(pagination.page);
      }
    } catch (err) {
      alert(err.message || 'Failed to process return request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">Reverse Logistics & Returns Processing</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Coordinate return pickups, record on-site QA inspection results, assess damage deductions, and authorize deposit refunds.
            </p>
          </div>
          <button
            onClick={() => fetchReturns(pagination.page)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition border border-slate-700 w-fit"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search return #, rental #, or subscriber..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">All Return Statuses</option>
              {RETURN_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Returns Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
            <p className="text-xs">Loading reverse logistics...</p>
          </div>
        ) : returns.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            No return requests logged.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3">Return # & Item</th>
                  <th className="px-4 py-3">Subscriber</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Deposit Held</th>
                  <th className="px-4 py-3">Deduction</th>
                  <th className="px-4 py-3">Approved Refund</th>
                  <th className="px-4 py-3">Pickup Date</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {returns.map((ret) => {
                  const statusObj = RETURN_STATUSES.find((s) => s.value === ret.status) || RETURN_STATUSES[0];

                  return (
                    <tr key={ret.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-5 py-3.5">
                        <span className="font-mono font-bold text-white text-xs block">{ret.return_number || `RET-${ret.id.slice(0, 6)}`}</span>
                        <span className="text-slate-400 text-[11px] truncate block">{ret.product_name || ret.rental_number}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-white block">{ret.user_name}</span>
                        <span className="text-[11px] text-slate-400 truncate block">{ret.user_email}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${statusObj.color}`}>
                          {ret.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-white">
                        ₹{Number(ret.deposit_paid || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3.5 text-rose-400 font-semibold">
                        ₹{Number(ret.damage_deduction || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-emerald-400">
                        ₹{Number(ret.refund_amount !== null ? ret.refund_amount : ret.deposit_paid || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3.5 text-slate-300 text-[11px]">
                        {ret.pickup_date ? new Date(ret.pickup_date).toLocaleDateString() : 'Pending schedule'}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => handleOpenEdit(ret)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
                        >
                          <Edit2 className="h-3 w-3 text-blue-400" />
                          Process
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 bg-slate-950/60 text-xs text-slate-400">
          <span>
            Showing <strong className="text-white">{returns.length}</strong> of{' '}
            <strong className="text-white">{pagination.total}</strong> return requests
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchReturns(pagination.page - 1)}
              disabled={pagination.page <= 1 || loading}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs">
              Page {pagination.page} of {pagination.totalPages || 1}
            </span>
            <button
              onClick={() => fetchReturns(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages || loading}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Process Return & QA Modal */}
      {editingReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-200 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <div>
                <h3 className="text-base font-bold text-white">
                  Process Return & QA Inspection
                </h3>
                <p className="text-xs text-slate-400">Rental: {editingReturn.rental_number}</p>
              </div>
              <button
                onClick={() => setEditingReturn(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 mb-4 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Customer Stated Reason:</span>
                <span className="text-white font-medium">{editingReturn.reason || 'Normal end of tenure'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Security Deposit Held:</span>
                <span className="text-emerald-400 font-bold">₹{editingReturn.deposit_paid}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Return Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  >
                    {RETURN_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">QA Condition Grade</label>
                  <select
                    value={formData.inspection_condition}
                    onChange={(e) => setFormData({ ...formData, inspection_condition: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="mint">Mint (Zero damage)</option>
                    <option value="minor_wear">Minor normal wear</option>
                    <option value="damaged">Damaged / Stained</option>
                    <option value="heavily_damaged">Heavy damage / Missing parts</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Pickup Date</label>
                  <input
                    type="date"
                    value={formData.pickup_date}
                    onChange={(e) => setFormData({ ...formData, pickup_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Pickup Slot</label>
                  <input
                    type="text"
                    value={formData.pickup_slot}
                    onChange={(e) => setFormData({ ...formData, pickup_slot: e.target.value })}
                    placeholder="2 PM - 6 PM"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Damage Deduction (₹)</label>
                  <input
                    type="number"
                    min="0"
                    max={editingReturn.deposit_paid}
                    value={formData.damage_deduction}
                    onChange={(e) => handleDeductionChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Refund to Customer (₹)</label>
                  <input
                    type="number"
                    readOnly
                    value={formData.refund_amount}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Inspector Notes</label>
                <textarea
                  rows="2"
                  value={formData.admin_notes}
                  onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
                  placeholder="Minor fabric discoloration on armrest, assessed ₹200 dry-cleaning fee..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingReturn(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-white disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Authorize Refund & Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
