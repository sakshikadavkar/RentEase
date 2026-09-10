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

const TICKET_STATUSES = [
  { value: 'open', label: 'Open Ticket', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { value: 'assigned', label: 'Technician Assigned', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  { value: 'resolved', label: 'Resolved', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
];

const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'text-slate-400' },
  { value: 'medium', label: 'Medium', color: 'text-blue-400' },
  { value: 'high', label: 'High', color: 'text-amber-400 font-bold' },
  { value: 'urgent', label: 'Urgent 🔥', color: 'text-rose-400 font-extrabold' },
];

export default function AdminMaintenance() {
  const { authFetch } = useRental();
  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editingTicket, setEditingTicket] = useState(null);
  const [formData, setFormData] = useState({
    status: 'open',
    priority: 'medium',
    technician_name: '',
    technician_phone: '',
    resolution_notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchTickets = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 10);
      if (search.trim()) params.append('search', search.trim());
      if (statusFilter) params.append('status', statusFilter);

      const res = await authFetch(`/api/admin/maintenance?${params.toString()}`);
      if (res.success && res.data) {
        setTickets(res.data.tickets || []);
        setPagination(res.data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
      }
    } catch (err) {
      console.error('Failed to load maintenance tickets:', err);
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

        const res = await authFetch(`/api/admin/maintenance?${params.toString()}`);
        if (active && res.success && res.data) {
          setTickets(res.data.tickets || []);
          setPagination(res.data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
        }
      } catch (err) {
        console.error('Failed to load maintenance tickets:', err);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [authFetch, search, statusFilter]);

  const handleOpenEdit = (ticket) => {
    setEditingTicket(ticket);
    setFormData({
      status: ticket.status,
      priority: ticket.priority || 'medium',
      technician_name: ticket.technician_name || '',
      technician_phone: ticket.technician_phone || '',
      resolution_notes: ticket.resolution_notes || '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await authFetch(`/api/admin/maintenance/${editingTicket.id}`, {
        method: 'PATCH',
        body: JSON.stringify(formData),
      });
      if (res.success) {
        setEditingTicket(null);
        fetchTickets(pagination.page);
      }
    } catch (err) {
      alert(err.message || 'Failed to update ticket');
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
            <h2 className="text-xl font-bold tracking-tight text-white">Maintenance & Technical Support Desk</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Triage customer service requests, assign specialized field engineers, and log on-site repairs.
            </p>
          </div>
          <button
            onClick={() => fetchTickets(pagination.page)}
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
              placeholder="Search ticket #, customer, or issue summary..."
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
              <option value="">All Support Ticket Statuses</option>
              {TICKET_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
            <p className="text-xs">Loading support tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            No maintenance tickets found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3">Ticket # & Category</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Assigned Engineer</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {tickets.map((t) => {
                  const statusObj = TICKET_STATUSES.find((s) => s.value === t.status) || TICKET_STATUSES[0];
                  const priorityObj = PRIORITIES.find((p) => p.value === t.priority) || PRIORITIES[1];

                  return (
                    <tr key={t.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-5 py-3.5">
                        <span className="font-mono font-bold text-white text-xs block">{t.ticket_number}</span>
                        <span className="text-slate-400 text-[11px] block">{t.issue_category}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-white block">{t.user_name}</span>
                        <span className="text-[11px] text-slate-400 truncate block">{t.rental_number}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-[11px] uppercase ${priorityObj.color}`}>
                          {t.priority || 'medium'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${statusObj.color}`}>
                          {t.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        {t.technician_name ? (
                          <div>
                            <span className="text-white font-medium block">{t.technician_name}</span>
                            <span className="text-[10px] text-slate-400">{t.technician_phone || '—'}</span>
                          </div>
                        ) : (
                          <span className="text-amber-400 text-[11px] font-medium">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-slate-400 text-[11px]">
                        {new Date(t.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => handleOpenEdit(t)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
                        >
                          <Edit2 className="h-3 w-3 text-blue-400" />
                          Triage
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
            Showing <strong className="text-white">{tickets.length}</strong> of{' '}
            <strong className="text-white">{pagination.total}</strong> tickets
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchTickets(pagination.page - 1)}
              disabled={pagination.page <= 1 || loading}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs">
              Page {pagination.page} of {pagination.totalPages || 1}
            </span>
            <button
              onClick={() => fetchTickets(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages || loading}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Triage & Assign Modal */}
      {editingTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-200 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <h3 className="text-base font-bold text-white">
                Triage Ticket: {editingTicket.ticket_number}
              </h3>
              <button
                onClick={() => setEditingTicket(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
              <span className="font-semibold text-white block">Reported Issue:</span>
              <p className="text-slate-300">{editingTicket.description}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Ticket Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  >
                    {TICKET_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Technician Name</label>
                  <input
                    type="text"
                    value={formData.technician_name}
                    onChange={(e) => setFormData({ ...formData, technician_name: e.target.value })}
                    placeholder="Suresh Tech"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Technician Phone</label>
                  <input
                    type="text"
                    value={formData.technician_phone}
                    onChange={(e) => setFormData({ ...formData, technician_phone: e.target.value })}
                    placeholder="+91 98450 12345"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Service / Resolution Notes</label>
                <textarea
                  rows="3"
                  value={formData.resolution_notes}
                  onChange={(e) => setFormData({ ...formData, resolution_notes: e.target.value })}
                  placeholder="Replaced hydraulic piston, leveled base..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingTicket(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-white disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Update Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
