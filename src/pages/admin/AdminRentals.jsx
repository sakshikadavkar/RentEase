import { useState, useEffect, useCallback } from 'react';
import { useRental } from '../../context/useRental';
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  History,
  Wrench,
} from 'lucide-react';

const RENTAL_STATUSES = [
  { value: 'active', label: 'Active Subscription', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { value: 'extended', label: 'Extended Tenure', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { value: 'return_requested', label: 'Return Pending', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { value: 'terminated', label: 'Terminated Early', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  { value: 'completed', label: 'Completed & Returned', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
  { value: 'overdue', label: 'Overdue Billing', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
];

export default function AdminRentals() {
  const { authFetch } = useRental();
  const [rentals, setRentals] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedRental, setSelectedRental] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchRentals = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 10);
      if (search.trim()) params.append('search', search.trim());
      if (statusFilter) params.append('status', statusFilter);

      const res = await authFetch(`/api/admin/rentals?${params.toString()}`);
      if (res.success && res.data) {
        setRentals(res.data.rentals || []);
        setPagination(res.data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
      }
    } catch (err) {
      console.error('Failed to load rentals:', err);
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

        const res = await authFetch(`/api/admin/rentals?${params.toString()}`);
        if (active && res.success && res.data) {
          setRentals(res.data.rentals || []);
          setPagination(res.data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
        }
      } catch (err) {
        console.error('Failed to load rentals:', err);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [authFetch, search, statusFilter]);

  const handleViewDetail = async (rentalId) => {
    try {
      const res = await authFetch(`/api/admin/rentals/${rentalId}`);
      if (res.success && res.data) {
        setSelectedRental(res.data);
      }
    } catch (err) {
      alert(err.message || 'Failed to load rental details');
    }
  };

  const handleUpdateStatus = async (rentalId, newStatus) => {
    setUpdatingStatus(true);
    try {
      const res = await authFetch(`/api/admin/rentals/${rentalId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.success) {
        setRentals((prev) =>
          prev.map((r) => (r.id === rentalId ? { ...r, status: newStatus } : r))
        );
        if (selectedRental?.rental?.id === rentalId) {
          setSelectedRental((prev) => ({
            ...prev,
            rental: { ...prev.rental, status: newStatus },
          }));
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to update rental status');
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
            <h2 className="text-xl font-bold tracking-tight text-white">Rental Subscriptions Hub</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Monitor active customer tenures, extensions, returns, billing cycles, and deposit obligations.
            </p>
          </div>
          <button
            onClick={() => fetchRentals(pagination.page)}
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
              placeholder="Search rental #, product name, or subscriber..."
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
              <option value="">All Subscription Statuses</option>
              {RENTAL_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Rentals Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
            <p className="text-xs">Loading subscriptions...</p>
          </div>
        ) : rentals.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            No rental subscriptions found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3">Rental # & Product</th>
                  <th className="px-4 py-3">Subscriber</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Monthly Rent</th>
                  <th className="px-4 py-3">Start Date</th>
                  <th className="px-4 py-3">End Date</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {rentals.map((rental) => {
                  const statusObj = RENTAL_STATUSES.find((s) => s.value === rental.status) || RENTAL_STATUSES[0];

                  return (
                    <tr key={rental.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {rental.product_image && (
                            <img
                              src={rental.product_image}
                              alt={rental.product_name}
                              referrerPolicy="no-referrer"
                              className="h-10 w-10 rounded-lg object-cover bg-slate-800 shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <span className="font-mono font-bold text-white text-xs block">{rental.rental_number}</span>
                            <span className="text-slate-400 text-[11px] truncate block">{rental.product_name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-white block">{rental.user_name}</span>
                        <span className="text-[11px] text-slate-400 truncate block">{rental.user_email}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <select
                          value={rental.status}
                          disabled={updatingStatus}
                          onChange={(e) => handleUpdateStatus(rental.id, e.target.value)}
                          className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase border bg-slate-950 ${statusObj.color} focus:outline-none cursor-pointer`}
                        >
                          {RENTAL_STATUSES.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-emerald-400">
                        ₹{Number(rental.monthly_rent).toLocaleString('en-IN')}/mo
                      </td>
                      <td className="px-4 py-3.5 text-slate-400 text-[11px]">
                        {new Date(rental.start_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3.5 text-slate-300 text-[11px] font-medium">
                        {new Date(rental.end_date).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => handleViewDetail(rental.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                          title="View Subscription Details"
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
            Showing <strong className="text-white">{rentals.length}</strong> of{' '}
            <strong className="text-white">{pagination.total}</strong> subscriptions
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchRentals(pagination.page - 1)}
              disabled={pagination.page <= 1 || loading}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs">
              Page {pagination.page} of {pagination.totalPages || 1}
            </span>
            <button
              onClick={() => fetchRentals(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages || loading}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Subscription Detail Modal */}
      {selectedRental && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-slate-800 mb-5">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Subscription {selectedRental.rental?.rental_number}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {selectedRental.rental?.status}
                  </span>
                </h3>
                <p className="text-xs text-slate-400">{selectedRental.rental?.product_name}</p>
              </div>
              <button
                onClick={() => setSelectedRental(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 text-xs">
              {/* Product & Pricing Overview */}
              <div className="grid grid-cols-3 gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 text-center">
                <div>
                  <span className="text-slate-400 block text-[11px]">Monthly Rent</span>
                  <span className="text-base font-bold text-emerald-400">
                    ₹{selectedRental.rental?.monthly_rent}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Deposit Held</span>
                  <span className="text-base font-bold text-white">
                    ₹{selectedRental.rental?.deposit_paid}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Tenure</span>
                  <span className="text-base font-bold text-blue-400">
                    {selectedRental.rental?.tenure_months} Months
                  </span>
                </div>
              </div>

              {/* Subscriber Details */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[11px] mb-1">Subscriber & Location</span>
                <span className="font-semibold text-white block">{selectedRental.rental?.user_name} ({selectedRental.rental?.user_email})</span>
                <p className="text-slate-300 mt-1">{selectedRental.rental?.delivery_address}</p>
                <p className="text-slate-400 text-[11px] mt-1">
                  Active Period: {new Date(selectedRental.rental?.start_date).toLocaleDateString()} → {new Date(selectedRental.rental?.end_date).toLocaleDateString()}
                </p>
              </div>

              {/* Extension History */}
              <div>
                <h4 className="font-semibold text-white mb-2 flex items-center gap-1.5">
                  <History className="h-4 w-4 text-blue-400" />
                  Tenure Extension History ({selectedRental.extensions?.length || 0})
                </h4>
                {selectedRental.extensions?.length === 0 ? (
                  <p className="text-slate-500 text-[11px]">No extension requests on this subscription</p>
                ) : (
                  <div className="space-y-2">
                    {selectedRental.extensions?.map((ext) => (
                      <div key={ext.id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] flex justify-between items-center">
                        <div>
                          <span className="font-semibold text-white block">+{ext.additional_months} Months Extension</span>
                          <span className="text-slate-400">New End Date: {new Date(ext.new_end_date).toLocaleDateString()}</span>
                        </div>
                        <span className="text-emerald-400 font-bold">Approved</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Maintenance Tickets */}
              <div>
                <h4 className="font-semibold text-white mb-2 flex items-center gap-1.5">
                  <Wrench className="h-4 w-4 text-rose-400" />
                  Linked Support Tickets ({selectedRental.tickets?.length || 0})
                </h4>
                {selectedRental.tickets?.length === 0 ? (
                  <p className="text-slate-500 text-[11px]">No maintenance tickets logged</p>
                ) : (
                  <div className="space-y-2">
                    {selectedRental.tickets?.map((t) => (
                      <div key={t.id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] flex justify-between items-center">
                        <div>
                          <span className="font-semibold text-white block">{t.ticket_number}: {t.issue_category}</span>
                          <span className="text-slate-400">{t.description}</span>
                        </div>
                        <span className="font-mono text-amber-400 uppercase text-[10px]">{t.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
