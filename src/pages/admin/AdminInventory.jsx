import { useState, useEffect, useCallback } from 'react';
import { useRental } from '../../context/useRental';
import {
  Search,
  Plus,
  Edit2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

const CITIES = [
  'Bengaluru',
  'Mumbai',
  'Delhi NCR',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Jaipur',
  'Ahmedabad',
];

const STATUSES = [
  { value: 'available', label: 'Available in Hub', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { value: 'rented', label: 'Rented to Customer', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { value: 'in_maintenance', label: 'In Maintenance', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  { value: 'in_transit', label: 'In Transit', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { value: 'retired', label: 'Retired', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
];

const CONDITIONS = ['Brand new', 'Grade A', 'Grade B+', 'Needs refurbishment'];

export default function AdminInventory() {
  const { authFetch } = useRental();
  const [units, setUnits] = useState([]);
  const [summary, setSummary] = useState({});
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [productsList, setProductsList] = useState([]);
  const [formData, setFormData] = useState({
    product_id: '',
    serial_number: '',
    city: 'Bengaluru',
    warehouse_location: 'Central Fulfillment Hub #1',
    status: 'available',
    condition_grade: 'Grade A',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchInventory = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 12);
      if (search.trim()) params.append('search', search.trim());
      if (cityFilter) params.append('city', cityFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (conditionFilter) params.append('condition_grade', conditionFilter);

      const res = await authFetch(`/api/admin/inventory?${params.toString()}`);
      if (res.success && res.data) {
        setUnits(res.data.units || []);
        setSummary(res.data.summary || {});
        setPagination(res.data.pagination || { page: 1, limit: 12, total: 0, totalPages: 1 });
      }
    } catch (err) {
      console.error('Failed to load inventory units:', err);
    } finally {
      setLoading(false);
    }
  }, [authFetch, search, cityFilter, statusFilter, conditionFilter]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const params = new URLSearchParams();
        params.append('page', 1);
        params.append('limit', 12);
        if (search.trim()) params.append('search', search.trim());
        if (cityFilter) params.append('city', cityFilter);
        if (statusFilter) params.append('status', statusFilter);
        if (conditionFilter) params.append('condition_grade', conditionFilter);

        const res = await authFetch(`/api/admin/inventory?${params.toString()}`);
        if (active && res.success && res.data) {
          setUnits(res.data.units || []);
          setSummary(res.data.summary || {});
          setPagination(res.data.pagination || { page: 1, limit: 12, total: 0, totalPages: 1 });
        }
      } catch (err) {
        console.error('Failed to load inventory units:', err);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [authFetch, search, cityFilter, statusFilter, conditionFilter]);

  // Load quick products list for dropdown
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await authFetch('/api/admin/products?limit=50');
        if (res.success && res.data?.products) {
          setProductsList(res.data.products);
          if (res.data.products.length > 0) {
            setFormData((prev) => (prev.product_id ? prev : { ...prev, product_id: res.data.products[0].id }));
          }
        }
      } catch (err) {
        console.warn('Could not load products for dropdown:', err);
      }
    };
    loadProducts();
  }, [authFetch]);

  const handleOpenAdd = () => {
    const randomSerial = `SN-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
    setFormData({
      product_id: productsList[0]?.id || 'luxe-cloud-sofa',
      serial_number: randomSerial,
      city: 'Bengaluru',
      warehouse_location: 'Central Fulfillment Hub #1',
      status: 'available',
      condition_grade: 'Grade A',
      notes: '',
    });
    setEditingUnit(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (unit) => {
    setEditingUnit(unit);
    setFormData({
      status: unit.status,
      condition_grade: unit.condition_grade,
      warehouse_location: unit.warehouse_location || '',
      notes: unit.notes || '',
    });
    setShowAddModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingUnit) {
        const res = await authFetch(`/api/admin/inventory/${editingUnit.id}`, {
          method: 'PATCH',
          body: JSON.stringify(formData),
        });
        if (res.success) {
          setShowAddModal(false);
          fetchInventory(pagination.page);
        }
      } else {
        const res = await authFetch('/api/admin/inventory', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
        if (res.success) {
          setShowAddModal(false);
          fetchInventory(1);
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to save inventory unit');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Metric Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 text-center">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Fleet</span>
          <span className="text-xl font-extrabold text-white mt-0.5 block">{summary.total || 0}</span>
        </div>
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 text-center">
          <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block">Available</span>
          <span className="text-xl font-extrabold text-emerald-400 mt-0.5 block">{summary.available || 0}</span>
        </div>
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 text-center">
          <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider block">Rented</span>
          <span className="text-xl font-extrabold text-blue-400 mt-0.5 block">{summary.rented || 0}</span>
        </div>
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 text-center">
          <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider block">Maintenance</span>
          <span className="text-xl font-extrabold text-rose-400 mt-0.5 block">{summary.in_maintenance || 0}</span>
        </div>
        <div className="col-span-2 sm:col-span-1 rounded-2xl bg-slate-900 border border-slate-800 p-4 text-center">
          <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider block">In Transit</span>
          <span className="text-xl font-extrabold text-amber-400 mt-0.5 block">{summary.in_transit || 0}</span>
        </div>
      </div>

      {/* Header & Controls */}
      <div className="flex flex-col gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">Physical Inventory & Serialization</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Track discrete units by serial number, condition grade, warehouse location, and rental status.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchInventory(pagination.page)}
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
              Add Unit
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search serial number, product, or hub..."
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
              <option value="">All Operational Statuses</option>
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">All Cities</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">All Condition Grades</option>
              {CONDITIONS.map((cg) => (
                <option key={cg} value={cg}>{cg}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Units Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
            <p className="text-xs">Loading serialized units...</p>
          </div>
        ) : units.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            No serialized inventory units found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3">Serial & Item</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Condition</th>
                  <th className="px-4 py-3">Location / Hub</th>
                  <th className="px-4 py-3">City</th>
                  <th className="px-4 py-3">Active Subscriber</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {units.map((unit) => {
                  const statusObj = STATUSES.find((s) => s.value === unit.status) || STATUSES[0];

                  return (
                    <tr key={unit.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {unit.product_image && (
                            <img
                              src={unit.product_image}
                              alt={unit.product_name}
                              referrerPolicy="no-referrer"
                              className="h-9 w-9 rounded-lg object-cover bg-slate-800 shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <span className="font-mono font-bold text-white text-xs block">{unit.serial_number}</span>
                            <span className="text-slate-400 text-[11px] truncate block">{unit.product_name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${statusObj.color}`}>
                          {unit.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-slate-200">{unit.condition_grade}</span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-400">
                        {unit.warehouse_location || 'Central Warehouse'}
                      </td>
                      <td className="px-4 py-3.5 text-slate-300">
                        {unit.city}
                      </td>
                      <td className="px-4 py-3.5">
                        {unit.current_user_name ? (
                          <div>
                            <span className="text-white font-medium block">{unit.current_user_name}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{unit.current_rental_number}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">None (In Stock)</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => handleOpenEdit(unit)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
                        >
                          <Edit2 className="h-3 w-3 text-blue-400" />
                          Update
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
            Showing <strong className="text-white">{units.length}</strong> of{' '}
            <strong className="text-white">{pagination.total}</strong> units
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchInventory(pagination.page - 1)}
              disabled={pagination.page <= 1 || loading}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs">
              Page {pagination.page} of {pagination.totalPages || 1}
            </span>
            <button
              onClick={() => fetchInventory(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages || loading}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Inventory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-200 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <h3 className="text-base font-bold text-white">
                {editingUnit ? `Update Unit: ${editingUnit.serial_number}` : 'Register Serialized Inventory Unit'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {!editingUnit && (
                <>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Catalog Product</label>
                    <select
                      value={formData.product_id}
                      onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                    >
                      {productsList.map((p) => (
                        <option key={p.id} value={p.id}>{p.name} ({p.category})</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Serial Number</label>
                      <input
                        type="text"
                        required
                        value={formData.serial_number}
                        onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">City Warehouse</label>
                      <select
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                      >
                        {CITIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Operational Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  >
                    {STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Condition Grade</label>
                  <select
                    value={formData.condition_grade}
                    onChange={(e) => setFormData({ ...formData, condition_grade: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  >
                    {CONDITIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Storage Bay / Hub Location</label>
                <input
                  type="text"
                  value={formData.warehouse_location}
                  onChange={(e) => setFormData({ ...formData, warehouse_location: e.target.value })}
                  placeholder="e.g. Bay 4-B, South Fulfillment Center"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Inspection Notes</label>
                <textarea
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Sanitization complete, no cosmetic scratches..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                />
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
                  {submitting ? 'Saving...' : editingUnit ? 'Update Unit' : 'Register Unit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
