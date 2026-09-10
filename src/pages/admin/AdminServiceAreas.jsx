import { useState, useEffect, useCallback } from 'react';
import { useRental } from '../../context/useRental';
import {
  Search,
  Plus,
  Edit2,
  RefreshCw,
  X,
} from 'lucide-react';

export default function AdminServiceAreas() {
  const { authFetch } = useRental();
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingArea, setEditingArea] = useState(null);
  const [formData, setFormData] = useState({
    city: '',
    state: '',
    postal_code: '',
    is_active: true,
    delivery_fee: 0,
    min_order_value: 0,
    estimated_days: '3–5 days',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchAreas = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/admin/service-areas');
      if (res.success && res.data) {
        setAreas(res.data);
      }
    } catch (err) {
      console.error('Failed to load service areas:', err);
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await authFetch('/api/admin/service-areas');
        if (active && res.success && res.data) {
          setAreas(res.data);
        }
      } catch (err) {
        console.error('Failed to load service areas:', err);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [authFetch]);

  const handleToggleStatus = async (area) => {
    const newStatus = !area.is_active;
    try {
      const res = await authFetch(`/api/admin/service-areas/${area.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...area, is_active: newStatus }),
      });
      if (res.success) {
        setAreas((prev) =>
          prev.map((a) => (a.id === area.id ? { ...a, is_active: newStatus } : a))
        );
      }
    } catch (err) {
      alert(err.message || 'Failed to update service area');
    }
  };

  const handleOpenAdd = () => {
    setEditingArea(null);
    setFormData({
      city: '',
      state: 'Karnataka',
      postal_code: '',
      is_active: true,
      delivery_fee: 0,
      min_order_value: 500,
      estimated_days: '2–4 days',
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (area) => {
    setEditingArea(area);
    setFormData({
      city: area.city,
      state: area.state,
      postal_code: area.postal_code || '',
      is_active: area.is_active,
      delivery_fee: area.delivery_fee || 0,
      min_order_value: area.min_order_value || 0,
      estimated_days: area.estimated_days || '3–5 days',
    });
    setShowAddModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingArea) {
        const res = await authFetch(`/api/admin/service-areas/${editingArea.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
        if (res.success) {
          setShowAddModal(false);
          fetchAreas();
        }
      } else {
        const res = await authFetch('/api/admin/service-areas', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
        if (res.success) {
          setShowAddModal(false);
          fetchAreas();
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to save service area');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAreas = areas.filter((a) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      a.city?.toLowerCase().includes(q) ||
      a.state?.toLowerCase().includes(q) ||
      a.postal_code?.includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">Serviceable Hubs & Postal Zones</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Configure active metro delivery zones, pincode routing, logistics fees, and turnaround estimates.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchAreas}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition border border-slate-700"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Service Area
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="pt-2 border-t border-slate-800">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by city, state, or PIN code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Areas Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-xs">Loading serviceable areas...</p>
        </div>
      ) : filteredAreas.length === 0 ? (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-16 text-center text-xs text-slate-500">
          No service areas found matching the search.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAreas.map((area) => (
            <div
              key={area.id}
              className={`rounded-2xl bg-slate-900 border p-5 transition flex flex-col justify-between ${
                area.is_active
                  ? 'border-slate-800 hover:border-slate-700'
                  : 'border-red-900/30 opacity-70'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-base text-white">{area.city}</h3>
                    <p className="text-xs text-slate-400">{area.state}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                    area.is_active
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {area.is_active ? 'Active Hub' : 'Inactive'}
                  </span>
                </div>

                <div className="space-y-2 text-xs py-3 border-y border-slate-800/80 my-3">
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Pincode Prefix:</span>
                    <span className="font-mono font-medium">{area.postal_code || 'All City PINs'}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Standard Delivery Fee:</span>
                    <span className="font-semibold text-white">
                      {Number(area.delivery_fee) === 0 ? 'FREE' : `₹${area.delivery_fee}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Turnaround SLA:</span>
                    <span className="font-medium text-blue-400">{area.estimated_days || '3–5 days'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => handleToggleStatus(area)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition ${
                    area.is_active
                      ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                  }`}
                >
                  {area.is_active ? 'Disable Zone' : 'Activate Zone'}
                </button>

                <button
                  onClick={() => handleOpenEdit(area)}
                  className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                >
                  <Edit2 className="h-3 w-3 text-blue-400" />
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Area Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-200 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <h3 className="text-base font-bold text-white">
                {editingArea ? `Edit Hub: ${editingArea.city}` : 'Add Service Area'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">City Name</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Pune"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="e.g. Maharashtra"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Postal Code / PIN Prefix</label>
                <input
                  type="text"
                  value={formData.postal_code}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                  placeholder="e.g. 411001 (or leave blank for whole city)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Delivery Fee (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.delivery_fee}
                    onChange={(e) => setFormData({ ...formData, delivery_fee: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Turnaround SLA</label>
                  <input
                    type="text"
                    value={formData.estimated_days}
                    onChange={(e) => setFormData({ ...formData, estimated_days: e.target.value })}
                    placeholder="2–3 days"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isActiveCheck" className="text-slate-300 font-medium">
                  Service Area Active for Orders
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-white disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingArea ? 'Update Area' : 'Create Area'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
