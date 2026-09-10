import { useState, useEffect, useCallback } from 'react';
import { useRental } from '../../context/useRental';
import {
  Search,
  UserCheck,
  UserX,
  Shield,
  Wrench,
  Truck,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

export default function AdminUsers() {
  const { authFetch, user: currentUser } = useRental();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 10);
      if (search.trim()) params.append('search', search.trim());
      if (roleFilter) params.append('role', roleFilter);
      if (activeFilter) params.append('is_active', activeFilter);

      const res = await authFetch(`/api/admin/users?${params.toString()}`);
      if (res.success && res.data) {
        setUsers(res.data.users || []);
        setPagination(res.data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  }, [authFetch, search, roleFilter, activeFilter]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const params = new URLSearchParams();
        params.append('page', 1);
        params.append('limit', 10);
        if (search.trim()) params.append('search', search.trim());
        if (roleFilter) params.append('role', roleFilter);
        if (activeFilter) params.append('is_active', activeFilter);

        const res = await authFetch(`/api/admin/users?${params.toString()}`);
        if (active && res.success && res.data) {
          setUsers(res.data.users || []);
          setPagination(res.data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
        }
      } catch (err) {
        console.error('Failed to load users:', err);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [authFetch, search, roleFilter, activeFilter]);

  const handleToggleStatus = async (user) => {
    const newStatus = !user.is_active;
    if (user.id === currentUser?.id && !newStatus) {
      alert('You cannot deactivate your own account.');
      return;
    }

    if (!confirm(`Are you sure you want to ${newStatus ? 'activate' : 'deactivate'} ${user.name}?`)) {
      return;
    }

    setActionLoading(user.id);
    try {
      const res = await authFetch(`/api/admin/users/${user.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: newStatus }),
      });
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, is_active: newStatus } : u))
        );
        if (selectedUser?.user?.id === user.id) {
          setSelectedUser((prev) => ({
            ...prev,
            user: { ...prev.user, is_active: newStatus },
          }));
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to update user status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleChangeRole = async (user, newRole) => {
    if (user.id === currentUser?.id && newRole !== 'admin') {
      alert('You cannot demote yourself from the admin role.');
      return;
    }

    if (!confirm(`Change role for ${user.name} from "${user.role}" to "${newRole}"?`)) {
      return;
    }

    setActionLoading(user.id);
    try {
      const res = await authFetch(`/api/admin/users/${user.id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: newRole }),
      });
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
        );
        if (selectedUser?.user?.id === user.id) {
          setSelectedUser((prev) => ({
            ...prev,
            user: { ...prev.user, role: newRole },
          }));
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to update user role');
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewDetail = async (userId) => {
    setSelectedUser(null);
    try {
      const res = await authFetch(`/api/admin/users/${userId}`);
      if (res.success && res.data) {
        setSelectedUser(res.data);
      }
    } catch (err) {
      alert(err.message || 'Failed to load user details');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">User Accounts & Roles</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage platform customers, administrators, technicians, and logistics dispatchers.
            </p>
          </div>
          <button
            onClick={() => fetchUsers(pagination.page)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition border border-slate-700 w-fit"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Search and Filters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500 transition"
            >
              <option value="">All Roles</option>
              <option value="customer">Customer</option>
              <option value="admin">Administrator</option>
              <option value="technician">Technician</option>
              <option value="logistics">Logistics</option>
            </select>
          </div>

          <div>
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500 transition"
            >
              <option value="">All Statuses</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive / Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
            <p className="text-xs">Loading user accounts...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            No users found matching current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3">User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">City</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-center">Rentals</th>
                  <th className="px-4 py-3 text-center">Orders</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => {
                  const isCurrent = u.id === currentUser?.id;
                  const isBusy = actionLoading === u.id;

                  return (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-xs shrink-0">
                            {u.name?.slice(0, 1) || 'U'}
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold text-white truncate block">
                              {u.name} {isCurrent && <span className="text-[10px] text-blue-400 font-normal">(You)</span>}
                            </span>
                            <span className="text-[11px] text-slate-400 truncate block">{u.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          u.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                          u.role === 'technician' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          u.role === 'logistics' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                          'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                          {u.role === 'admin' && <Shield className="h-2.5 w-2.5" />}
                          {u.role === 'technician' && <Wrench className="h-2.5 w-2.5" />}
                          {u.role === 'logistics' && <Truck className="h-2.5 w-2.5" />}
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-300">
                        {u.city || '—'}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                          u.is_active
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${u.is_active ? 'bg-emerald-400' : 'bg-red-400'}`} />
                          {u.is_active ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center font-mono font-medium">
                        {u.rentals_count || 0}
                      </td>
                      <td className="px-4 py-3.5 text-center font-mono font-medium">
                        {u.orders_count || 0}
                      </td>
                      <td className="px-4 py-3.5 text-slate-400 text-[11px]">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleViewDetail(u.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                            title="View Account Details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>

                          <select
                            value={u.role}
                            disabled={isBusy}
                            onChange={(e) => handleChangeRole(u, e.target.value)}
                            className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-[11px] text-slate-200 focus:outline-none focus:border-blue-500 transition"
                          >
                            <option value="customer">customer</option>
                            <option value="admin">admin</option>
                            <option value="technician">technician</option>
                            <option value="logistics">logistics</option>
                          </select>

                          <button
                            onClick={() => handleToggleStatus(u)}
                            disabled={isBusy || isCurrent}
                            className={`p-1.5 rounded-lg transition ${
                              u.is_active
                                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
                            } disabled:opacity-40`}
                            title={u.is_active ? 'Suspend Account' : 'Activate Account'}
                          >
                            {u.is_active ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                          </button>
                        </div>
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
            Showing <strong className="text-white">{users.length}</strong> of{' '}
            <strong className="text-white">{pagination.total}</strong> accounts
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchUsers(pagination.page - 1)}
              disabled={pagination.page <= 1 || loading}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs">
              Page {pagination.page} of {pagination.totalPages || 1}
            </span>
            <button
              onClick={() => fetchUsers(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages || loading}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* User Details Drawer Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-slate-800 mb-5">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{selectedUser.user?.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {selectedUser.user?.role}
                  </span>
                </h3>
                <p className="text-xs text-slate-400">{selectedUser.user?.email} • {selectedUser.user?.city || 'No city specified'}</p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* User Details Content */}
            <div className="space-y-5 text-xs">
              {/* Profile Summary */}
              <div className="grid grid-cols-3 gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 text-center">
                <div>
                  <span className="text-slate-400 block text-[11px]">Active Rentals</span>
                  <span className="text-base font-bold text-emerald-400">
                    {selectedUser.rentals?.filter((r) => r.status === 'active' || r.status === 'extended').length || 0}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Total Orders</span>
                  <span className="text-base font-bold text-white">{selectedUser.orders?.length || 0}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Support Tickets</span>
                  <span className="text-base font-bold text-amber-400">{selectedUser.tickets?.length || 0}</span>
                </div>
              </div>

              {/* Addresses */}
              <div>
                <h4 className="font-semibold text-white mb-2">Saved Delivery Addresses</h4>
                {selectedUser.addresses?.length === 0 ? (
                  <p className="text-slate-500 text-[11px]">No addresses saved</p>
                ) : (
                  <div className="space-y-2">
                    {selectedUser.addresses?.map((addr) => (
                      <div key={addr.id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px]">
                        <span className="font-semibold text-white block">{addr.name} ({addr.address_type})</span>
                        <p className="text-slate-400">{addr.address_line1}, {addr.city} - {addr.postal_code}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Subscriptions */}
              <div>
                <h4 className="font-semibold text-white mb-2">Rental Subscriptions</h4>
                {selectedUser.rentals?.length === 0 ? (
                  <p className="text-slate-500 text-[11px]">No rental subscriptions</p>
                ) : (
                  <div className="space-y-2">
                    {selectedUser.rentals?.map((r) => (
                      <div key={r.id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px]">
                        <div>
                          <span className="font-semibold text-white block">{r.product_name || r.rental_number}</span>
                          <span className="text-slate-400">Status: {r.status} • Ends {new Date(r.end_date).toLocaleDateString()}</span>
                        </div>
                        <span className="font-bold text-emerald-400">₹{r.monthly_rent}/mo</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Orders */}
              <div>
                <h4 className="font-semibold text-white mb-2">Recent Order History</h4>
                {selectedUser.orders?.length === 0 ? (
                  <p className="text-slate-500 text-[11px]">No orders placed</p>
                ) : (
                  <div className="space-y-2">
                    {selectedUser.orders?.map((o) => (
                      <div key={o.id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px]">
                        <div>
                          <span className="font-mono font-semibold text-white">{o.order_number}</span>
                          <span className="text-slate-400 block">Status: {o.status} • {new Date(o.created_at).toLocaleDateString()}</span>
                        </div>
                        <span className="font-bold text-white">₹{o.total_amount_due}</span>
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
