import { useState, useEffect, useCallback } from 'react';
import { useRental } from '../../context/useRental';
import {
  Search,
  Plus,
  Edit2,
  Archive,
  CheckCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
  ExternalLink,
} from 'lucide-react';

const CATEGORIES = [
  'Furniture',
  'Appliances',
  'Electronics',
  'Office',
  'Bedroom',
  'Living Room',
  'Kitchen',
  'Study / Work From Home',
];

const CITIES = [
  'Bengaluru',
  'Mumbai',
  'Delhi NCR',
  'Noida',
  'Gurgaon',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Ahmedabad',
  'Jaipur',
  'Pune',
  'Nagpur',
];

export default function AdminProducts() {
  const { authFetch } = useRental();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Furniture',
    monthlyPrice: 999,
    securityDeposit: 2000,
    city: 'Bengaluru',
    description: '',
    image: '',
    condition: 'Brand new',
    deliveryInfo: '3–5 days',
    warranty: '12 months',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 12);
      if (search.trim()) params.append('search', search.trim());
      if (categoryFilter) params.append('category', categoryFilter);
      if (cityFilter) params.append('city', cityFilter);
      if (statusFilter) params.append('is_active', statusFilter);

      const res = await authFetch(`/api/admin/products?${params.toString()}`);
      if (res.success && res.data) {
        setProducts(res.data.products || []);
        setPagination(res.data.pagination || { page: 1, limit: 12, total: 0, totalPages: 1 });
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  }, [authFetch, search, categoryFilter, cityFilter, statusFilter]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const params = new URLSearchParams();
        params.append('page', 1);
        params.append('limit', 12);
        if (search.trim()) params.append('search', search.trim());
        if (categoryFilter) params.append('category', categoryFilter);
        if (cityFilter) params.append('city', cityFilter);
        if (statusFilter) params.append('is_active', statusFilter);

        const res = await authFetch(`/api/admin/products?${params.toString()}`);
        if (active && res.success && res.data) {
          setProducts(res.data.products || []);
          setPagination(res.data.pagination || { page: 1, limit: 12, total: 0, totalPages: 1 });
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [authFetch, search, categoryFilter, cityFilter, statusFilter]);

  const handleToggleStatus = async (product) => {
    const newStatus = !product.is_active;
    if (!confirm(`Are you sure you want to ${newStatus ? 'activate' : 'archive'} "${product.name}"?`)) {
      return;
    }

    try {
      const res = await authFetch(`/api/admin/products/${product.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: newStatus }),
      });
      if (res.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, is_active: newStatus } : p))
        );
      }
    } catch (err) {
      alert(err.message || 'Failed to update product status');
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      category: 'Furniture',
      monthlyPrice: 999,
      securityDeposit: 2000,
      city: 'Bengaluru',
      description: 'Premium curated piece ready for flexible rental.',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=85',
      condition: 'Like new',
      deliveryInfo: '3–5 days',
      warranty: '12 months',
    });
    setEditingProduct(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      monthlyPrice: product.monthly_price,
      securityDeposit: product.security_deposit,
      city: product.city || 'Bengaluru',
      description: product.description || '',
      image: product.image || '',
      condition: product.condition || 'Like new',
      deliveryInfo: product.delivery_info || '3–5 days',
      warranty: product.warranty || '12 months',
    });
    setShowAddModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingProduct) {
        // Update
        const res = await authFetch(`/api/admin/products/${editingProduct.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
        if (res.success) {
          setShowAddModal(false);
          fetchProducts(pagination.page);
        }
      } else {
        // Create
        const res = await authFetch('/api/admin/products', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
        if (res.success) {
          setShowAddModal(false);
          fetchProducts(1);
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to save product');
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
            <h2 className="text-xl font-bold tracking-tight text-white">Product Catalog Management</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage all 903+ rental products, pricing, inventory stock, and availability.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchProducts(pagination.page)}
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
              Add Product
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search 903 catalog products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500 transition"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500 transition"
            >
              <option value="">All Cities</option>
              {CITIES.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500 transition"
            >
              <option value="">All Catalog Statuses</option>
              <option value="true">Active Only</option>
              <option value="false">Archived Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-xs">Loading catalog products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-16 text-center text-xs text-slate-500">
          No products found matching the criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className={`rounded-2xl bg-slate-900 border transition flex flex-col justify-between overflow-hidden ${
                product.is_active ? 'border-slate-800/90 hover:border-slate-700' : 'border-red-900/40 opacity-75'
              }`}
            >
              <div>
                {/* Product Image Banner */}
                <div className="relative h-44 bg-slate-950 overflow-hidden">
                  <img
                    src={product.image || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc'}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-950/80 text-white backdrop-blur-md border border-slate-800">
                      {product.category}
                    </span>
                  </div>
                  <div className="absolute top-2.5 right-2.5">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      product.is_active
                        ? 'bg-emerald-500/90 text-white'
                        : 'bg-red-500/90 text-white'
                    }`}>
                      {product.is_active ? 'Active' : 'Archived'}
                    </span>
                  </div>
                </div>

                {/* Product Information */}
                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-sm text-white truncate" title={product.name}>
                    {product.name}
                  </h3>
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-base font-extrabold text-white">
                        ₹{Number(product.monthly_price).toLocaleString('en-IN')}
                      </span>
                      <span className="text-[11px] text-slate-400">/mo</span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Dep: ₹{Number(product.security_deposit).toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Stock & City Chips */}
                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800 text-slate-400">
                    <span>📍 {product.city || 'Bengaluru'}</span>
                    <span className="font-mono text-emerald-400 font-semibold">
                      {product.available_units || 0} avail / {product.total_units || 0} units
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="p-3 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <a
                  href={`/products/${product.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                  title="View on Storefront"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(product)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
                  >
                    <Edit2 className="h-3 w-3 text-blue-400" />
                    Edit
                  </button>

                  <button
                    onClick={() => handleToggleStatus(product)}
                    className={`p-1.5 rounded-lg transition ${
                      product.is_active
                        ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                    }`}
                    title={product.is_active ? 'Archive Product' : 'Reactivate Product'}
                  >
                    {product.is_active ? <Archive className="h-3.5 w-3.5" /> : <CheckCircle className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Bar */}
      <div className="flex items-center justify-between px-5 py-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
        <span>
          Showing <strong className="text-white">{products.length}</strong> of{' '}
          <strong className="text-white">{pagination.total}</strong> products
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchProducts(pagination.page - 1)}
            disabled={pagination.page <= 1 || loading}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs">
            Page {pagination.page} of {pagination.totalPages || 1}
          </span>
          <button
            onClick={() => fetchProducts(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages || loading}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <h3 className="text-base font-bold text-white">
                {editingProduct ? 'Edit Catalog Product' : 'Add New Product to Catalog'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ergonomic Executive Office Chair"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Primary City</label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  >
                    {CITIES.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Monthly Rent (₹)</label>
                  <input
                    type="number"
                    required
                    min="100"
                    value={formData.monthlyPrice}
                    onChange={(e) => setFormData({ ...formData, monthlyPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Security Deposit (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.securityDeposit}
                    onChange={(e) => setFormData({ ...formData, securityDeposit: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Image URL</label>
                <input
                  type="url"
                  required
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Description</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed specifications, dimensions, features..."
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
                  {submitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
