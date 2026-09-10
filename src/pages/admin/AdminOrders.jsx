import { useState, useEffect, useCallback } from 'react';
import { useRental } from '../../context/useRental';
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
} from 'lucide-react';

const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending Payment', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { value: 'confirmed', label: 'Order Confirmed', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { value: 'processing', label: 'Processing in Hub', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  { value: 'out_for_delivery', label: 'Out for Delivery', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  { value: 'delivered', label: 'Delivered to Customer', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
];

export default function AdminOrders() {
  const { authFetch } = useRental();
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchOrders = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 10);
      if (search.trim()) params.append('search', search.trim());
      if (statusFilter) params.append('status', statusFilter);

      const res = await authFetch(`/api/admin/orders?${params.toString()}`);
      if (res.success && res.data) {
        setOrders(res.data.orders || []);
        setPagination(res.data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
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

        const res = await authFetch(`/api/admin/orders?${params.toString()}`);
        if (active && res.success && res.data) {
          setOrders(res.data.orders || []);
          setPagination(res.data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
        }
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [authFetch, search, statusFilter]);

  const handleViewDetail = async (orderId) => {
    try {
      const res = await authFetch(`/api/admin/orders/${orderId}`);
      if (res.success && res.data) {
        setSelectedOrder(res.data);
      }
    } catch (err) {
      alert(err.message || 'Failed to load order details');
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingStatus(true);
    try {
      const res = await authFetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
        if (selectedOrder?.order?.id === orderId) {
          setSelectedOrder((prev) => ({
            ...prev,
            order: { ...prev.order, status: newStatus },
          }));
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">Customer Order Registry</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Review placed orders, fulfill delivery assignments, inspect payment items, and manage lifecycle.
            </p>
          </div>
          <button
            onClick={() => fetchOrders(pagination.page)}
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
              placeholder="Search order #, customer name, email, or city..."
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
              <option value="">All Order Statuses</option>
              {ORDER_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
            <p className="text-xs">Loading customer orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            No orders found matching the criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3">Order Number</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">City</th>
                  <th className="px-4 py-3">Total Amount</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Placed On</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {orders.map((order) => {
                  const statusObj = ORDER_STATUSES.find((s) => s.value === order.status) || ORDER_STATUSES[0];

                  return (
                    <tr key={order.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-5 py-3.5 font-mono font-bold text-white">
                        {order.order_number}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-white block">{order.user_name}</span>
                        <span className="text-[11px] text-slate-400 truncate block">{order.user_email}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <select
                          value={order.status}
                          disabled={updatingStatus}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                          className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase border bg-slate-950 ${statusObj.color} focus:outline-none cursor-pointer`}
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3.5 text-slate-300">
                        {order.city || 'Bengaluru'}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-white">
                        ₹{Number(order.total_amount_due).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3.5 text-slate-400">
                        {order.payment_method || 'Online'}
                      </td>
                      <td className="px-4 py-3.5 text-slate-400 text-[11px]">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => handleViewDetail(order.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                          title="View Order Details"
                        >
                          <Eye className="h-3.5 w-3.5" />
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
            Showing <strong className="text-white">{orders.length}</strong> of{' '}
            <strong className="text-white">{pagination.total}</strong> orders
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchOrders(pagination.page - 1)}
              disabled={pagination.page <= 1 || loading}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs">
              Page {pagination.page} of {pagination.totalPages || 1}
            </span>
            <button
              onClick={() => fetchOrders(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages || loading}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-slate-800 mb-5">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Order {selectedOrder.order?.order_number}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {selectedOrder.order?.status}
                  </span>
                </h3>
                <p className="text-xs text-slate-400">Placed on {new Date(selectedOrder.order?.created_at).toLocaleString()}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 text-xs">
              {/* Customer & Address */}
              <div className="grid grid-cols-2 gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[11px] mb-1">Customer Info</span>
                  <span className="font-semibold text-white block">{selectedOrder.order?.user_name}</span>
                  <span className="text-slate-400 block">{selectedOrder.order?.user_email}</span>
                  <span className="text-slate-400 block">{selectedOrder.order?.user_phone || 'No phone'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] mb-1">Delivery Destination</span>
                  <p className="text-slate-300">{selectedOrder.order?.delivery_address || 'Customer Primary Address'}</p>
                  <p className="text-blue-400 font-medium mt-1">Slot: {selectedOrder.order?.delivery_slot}</p>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 className="font-semibold text-white mb-2">Order Line Items ({selectedOrder.items?.length || 0})</h4>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="flex items-center gap-3">
                        {item.product_image && (
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            referrerPolicy="no-referrer"
                            className="h-10 w-10 rounded-lg object-cover bg-slate-800 shrink-0"
                          />
                        )}
                        <div>
                          <span className="font-semibold text-white block">{item.product_name}</span>
                          <span className="text-slate-400 text-[11px]">{item.tenure_months} Months Plan • ₹{item.monthly_price}/mo</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-white block">₹{item.monthly_price * item.quantity}</span>
                        <span className="text-[10px] text-slate-500">Dep: ₹{item.security_deposit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal First Month Rent:</span>
                  <span>₹{Number(selectedOrder.order?.subtotal_monthly || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Refundable Security Deposit:</span>
                  <span>₹{Number(selectedOrder.order?.deposit_total || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Taxes & GST (18%):</span>
                  <span>₹{Number(selectedOrder.order?.tax_amount || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-bold text-white text-xs pt-2 border-t border-slate-800">
                  <span>Total Due & Paid:</span>
                  <span className="text-emerald-400">₹{Number(selectedOrder.order?.total_amount_due || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
