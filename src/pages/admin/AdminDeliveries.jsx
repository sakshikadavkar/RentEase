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

const DELIVERY_STATUSES = [
  { value: 'scheduled', label: 'Scheduled', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { value: 'out_for_delivery', label: 'Out for Delivery', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { value: 'delivered', label: 'Delivered Successfully', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { value: 'failed', label: 'Delivery Failed / Reschedule', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
];

export default function AdminDeliveries() {
  const { authFetch } = useRental();
  const [deliveries, setDeliveries] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editingDelivery, setEditingDelivery] = useState(null);
  const [formData, setFormData] = useState({
    status: 'scheduled',
    driver_name: '',
    driver_phone: '',
    tracking_number: '',
    scheduled_slot: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchDeliveries = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 10);
      if (search.trim()) params.append('search', search.trim());
      if (statusFilter) params.append('status', statusFilter);

      const res = await authFetch(`/api/admin/deliveries?${params.toString()}`);
      if (res.success && res.data) {
        setDeliveries(res.data.deliveries || []);
        setPagination(res.data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
      }
    } catch (err) {
      console.error('Failed to load deliveries:', err);
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

        const res = await authFetch(`/api/admin/deliveries?${params.toString()}`);
        if (active && res.success && res.data) {
          setDeliveries(res.data.deliveries || []);
          setPagination(res.data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
        }
      } catch (err) {
        console.error('Failed to load deliveries:', err);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [authFetch, search, statusFilter]);

  const handleOpenEdit = (delivery) => {
    setEditingDelivery(delivery);
    setFormData({
      status: delivery.status,
      driver_name: delivery.driver_name || '',
      driver_phone: delivery.driver_phone || '',
      tracking_number: delivery.tracking_number || '',
      scheduled_slot: delivery.scheduled_slot || '',
      notes: delivery.notes || '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await authFetch(`/api/admin/deliveries/${editingDelivery.id}`, {
        method: 'PATCH',
        body: JSON.stringify(formData),
      });
      if (res.success) {
        setEditingDelivery(null);
        fetchDeliveries(pagination.page);
      }
    } catch (err) {
      alert(err.message || 'Failed to update delivery');
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
            <h2 className="text-xl font-bold tracking-tight text-white">Logistics & Delivery Dispatch</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Assign field drivers, track active transit manifests, manage delivery slots, and confirm doorstep handovers.
            </p>
          </div>
          <button
            onClick={() => fetchDeliveries(pagination.page)}
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
              placeholder="Search tracking #, driver, or recipient..."
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
              <option value="">All Logistics Statuses</option>
              {DELIVERY_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Deliveries Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
            <p className="text-xs">Loading logistics manifests...</p>
          </div>
        ) : deliveries.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            No delivery manifests found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3">Tracking & Order</th>
                  <th className="px-4 py-3">Recipient</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Assigned Driver</th>
                  <th className="px-4 py-3">Scheduled Date & Slot</th>
                  <th className="px-4 py-3">City</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {deliveries.map((del) => {
                  const statusObj = DELIVERY_STATUSES.find((s) => s.value === del.status) || DELIVERY_STATUSES[0];

                  return (
                    <tr key={del.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-5 py-3.5">
                        <span className="font-mono font-bold text-white text-xs block">{del.tracking_number || 'TRK-PENDING'}</span>
                        <span className="text-[11px] text-slate-400 font-mono block">{del.order_number}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-white block">{del.user_name}</span>
                        <span className="text-[11px] text-slate-400 truncate block">{del.city || 'Bengaluru'}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${statusObj.color}`}>
                          {del.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        {del.driver_name ? (
                          <div>
                            <span className="text-white font-medium block">{del.driver_name}</span>
                            <span className="text-[10px] text-slate-400">{del.driver_phone || '—'}</span>
                          </div>
                        ) : (
                          <span className="text-amber-400 text-[11px] font-medium">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-slate-300 text-[11px]">
                        <span className="block font-medium">{new Date(del.scheduled_date).toLocaleDateString()}</span>
                        <span className="text-[10px] text-slate-500">{del.scheduled_slot}</span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-300">
                        {del.city || 'Bengaluru'}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => handleOpenEdit(del)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
                        >
                          <Edit2 className="h-3 w-3 text-blue-400" />
                          Dispatch
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
            Showing <strong className="text-white">{deliveries.length}</strong> of{' '}
            <strong className="text-white">{pagination.total}</strong> delivery manifests
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchDeliveries(pagination.page - 1)}
              disabled={pagination.page <= 1 || loading}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs">
              Page {pagination.page} of {pagination.totalPages || 1}
            </span>
            <button
              onClick={() => fetchDeliveries(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages || loading}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Edit / Assign Delivery Modal */}
      {editingDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-200 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <h3 className="text-base font-bold text-white">
                Dispatch Manifest: {editingDelivery.tracking_number}
              </h3>
              <button
                onClick={() => setEditingDelivery(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Delivery Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                >
                  {DELIVERY_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Driver Name</label>
                  <input
                    type="text"
                    value={formData.driver_name}
                    onChange={(e) => setFormData({ ...formData, driver_name: e.target.value })}
                    placeholder="Ramesh Kumar"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Driver Phone</label>
                  <input
                    type="text"
                    value={formData.driver_phone}
                    onChange={(e) => setFormData({ ...formData, driver_phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Scheduled Time Window</label>
                <input
                  type="text"
                  value={formData.scheduled_slot}
                  onChange={(e) => setFormData({ ...formData, scheduled_slot: e.target.value })}
                  placeholder="Morning (9 AM - 1 PM)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Logistics Notes</label>
                <textarea
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Elevator available, service gate entry on north side..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingDelivery(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-white disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Update Manifest'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
