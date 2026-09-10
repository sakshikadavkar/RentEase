import { useState, useEffect } from 'react';
import { useRental } from '../../context/useRental';
import {
  BarChart2,
  PieChart as PieIcon,
  Boxes,
  Wrench,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#f97316', '#64748b'];

export default function AdminAnalytics() {
  const { authFetch } = useRental();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch('/api/admin/analytics');
      if (res.success && res.data) {
        setAnalytics(res.data);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError(err.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await authFetch('/api/admin/analytics');
        if (active && res.success && res.data) {
          setAnalytics(res.data);
        }
      } catch (err) {
        if (active) setError(err.message || 'Failed to fetch analytics');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [authFetch]);

  if (loading && !analytics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-400">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-sm">Crunching business analytics...</p>
      </div>
    );
  }

  if (error && !analytics) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center text-white">
        <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" />
        <h2 className="text-base font-bold text-red-200">Unable to load analytics</h2>
        <p className="text-xs text-red-300/80 mb-4">{error}</p>
        <button
          onClick={fetchAnalytics}
          className="inline-flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-500 px-4 py-2 text-xs font-semibold text-white transition"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </button>
      </div>
    );
  }

  const revenue = analytics?.revenue || {};
  const categories = (analytics?.categories || []).map((c) => ({
    name: c.category || 'Uncategorized',
    rentals: parseInt(c.rental_count || 0, 10),
    mrr: parseInt(c.total_mrr || 0, 10),
  }));

  const rentalsByStatus = (analytics?.rentalsByStatus || []).map((r) => ({
    name: r.status.replace('_', ' ').toUpperCase(),
    value: parseInt(r.count, 10),
  }));

  const inventoryByCity = (analytics?.inventoryByCity || []).map((c) => ({
    city: c.city,
    total: parseInt(c.total_units, 10),
    available: parseInt(c.available_units, 10),
    rented: parseInt(c.total_units, 10) - parseInt(c.available_units, 10),
  }));

  const ticketsByCategory = (analytics?.ticketsByCategory || []).map((t) => ({
    name: t.issue_category,
    tickets: parseInt(t.count, 10),
  }));

  const topProducts = analytics?.topProducts || [];

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Business & Fleet Analytics</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Key operational metrics, revenue breakdowns, fleet deployment, and maintenance performance.
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition border border-slate-700 w-fit"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5">
          <span className="text-xs font-medium text-slate-400 block mb-1">Total Processed Revenue</span>
          <span className="text-2xl font-extrabold text-white tracking-tight">
            ₹{Number(revenue.totalRevenue || 0).toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-emerald-400 block mt-2">All completed transactions</span>
        </div>
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5">
          <span className="text-xs font-medium text-slate-400 block mb-1">Rental Subscription Revenue</span>
          <span className="text-2xl font-extrabold text-blue-400 tracking-tight">
            ₹{Number(revenue.rentRevenue || 0).toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-slate-400 block mt-2">Recurring rental payments</span>
        </div>
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5">
          <span className="text-xs font-medium text-slate-400 block mb-1">Security Deposits Held</span>
          <span className="text-2xl font-extrabold text-amber-400 tracking-tight">
            ₹{Number(revenue.depositRevenue || 0).toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-slate-400 block mt-2">Refundable on inspection</span>
        </div>
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5">
          <span className="text-xs font-medium text-slate-400 block mb-1">Subscription Extension Rate</span>
          <span className="text-2xl font-extrabold text-purple-400 tracking-tight">
            {analytics?.extensionRate || 0}%
          </span>
          <span className="text-[11px] text-slate-400 block mt-2">Tenure extensions requested</span>
        </div>
      </div>

      {/* Charts Row 1: Subscriptions by Category & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Revenue Chart */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-blue-400" />
              Active Subscriptions by Category
            </h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categories} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                  itemStyle={{ color: '#93c5fd' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="rentals" name="Active Rentals" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subscriptions Status Distribution */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieIcon className="h-4 w-4 text-emerald-400" />
              Rental Lifecycle Distribution
            </h3>
          </div>
          <div className="h-72 w-full flex items-center justify-center">
            {rentalsByStatus.length === 0 ? (
              <p className="text-xs text-slate-500">No rental lifecycle data available</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={rentalsByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {rentalsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Charts Row 2: City Inventory & Maintenance Tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* City Inventory Deployment */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Boxes className="h-4 w-4 text-amber-400" />
              Inventory Units by City
            </h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inventoryByCity} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="city" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="available" name="Available Units" fill="#10b981" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="rented" name="Rented Units" fill="#3b82f6" radius={[4, 4, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Maintenance Categories */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Wrench className="h-4 w-4 text-rose-400" />
              Maintenance Issues Breakdown
            </h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ticketsByCategory} layout="vertical" margin={{ top: 10, right: 20, left: 40, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Bar dataKey="tickets" name="Ticket Volume" fill="#f43f5e" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Rented Products Leaderboard */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white">Top Performing Catalog Rentals</h3>
          <span className="text-xs text-slate-400">Ranked by active subscription demand</span>
        </div>

        {topProducts.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">No active rental subscriptions recorded yet</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {topProducts.map((p, idx) => (
              <div
                key={p.id || idx}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-600/10 text-xs font-bold text-blue-400 border border-blue-500/20">
                  #{idx + 1}
                </div>
                {p.image && (
                  <img
                    src={p.image}
                    alt={p.name}
                    referrerPolicy="no-referrer"
                    className="h-10 w-10 rounded-lg object-cover bg-slate-800 shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <span className="font-semibold text-xs text-white truncate block">{p.name}</span>
                  <p className="text-[11px] text-slate-400 truncate">
                    ₹{p.monthly_price}/mo • <span className="text-emerald-400">{p.active_count} active</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
