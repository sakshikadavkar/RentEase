import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useRental } from '../../context/useRental';
import {
  Users,
  Package,
  RotateCcw,
  ShoppingCart,
  Wrench,
  Undo2,
  TrendingUp,
  Boxes,
  ArrowUpRight,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

export default function AdminDashboard() {
  const { authFetch } = useRental();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch('/api/admin/dashboard');
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message || 'Failed to fetch dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await authFetch('/api/admin/dashboard');
        if (active && res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        if (active) setError(err.message || 'Failed to fetch dashboard metrics');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [authFetch]);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-400">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-sm">Loading admin dashboard metrics...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center text-white">
        <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" />
        <h2 className="text-base font-bold text-red-200">Unable to load dashboard</h2>
        <p className="text-xs text-red-300/80 mb-4">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="inline-flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-500 px-4 py-2 text-xs font-semibold text-white transition"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </button>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const recentOrders = data?.recentOrders || [];
  const activeRentals = data?.activeRentals || [];
  const openTickets = data?.openTickets || [];
  const pendingReturns = data?.pendingReturns || [];
  const inventoryStatus = metrics.inventory || { total: 0, available: 0, rented: 0, maintenance: 0, utilizationRate: 0 };

  const statCards = [
    {
      title: 'Monthly Recurring Revenue',
      value: `₹${Number(metrics.mrr || 0).toLocaleString('en-IN')}`,
      sub: `${metrics.activeRentals || 0} active subscriptions`,
      icon: TrendingUp,
      color: 'from-emerald-600 to-teal-600',
      link: '/admin/analytics',
    },
    {
      title: 'Catalog Products',
      value: Number(metrics.totalProducts || 903).toLocaleString('en-IN'),
      sub: 'Across 12 service cities',
      icon: Package,
      color: 'from-blue-600 to-cyan-600',
      link: '/admin/products',
    },
    {
      title: 'Active Rentals',
      value: metrics.activeRentals || 0,
      sub: `${metrics.totalRentals || 0} total subscriptions`,
      icon: RotateCcw,
      color: 'from-indigo-600 to-violet-600',
      link: '/admin/rentals',
    },
    {
      title: 'Fleet Utilization',
      value: `${inventoryStatus.utilizationRate || 0}%`,
      sub: `${inventoryStatus.rented || 0} / ${inventoryStatus.total || 0} units rented`,
      icon: Boxes,
      color: 'from-amber-600 to-orange-600',
      link: '/admin/inventory',
    },
    {
      title: 'Registered Users',
      value: metrics.totalUsers || 0,
      sub: `${metrics.totalCustomers || 0} customers, ${metrics.totalAdmins || 0} staff`,
      icon: Users,
      color: 'from-purple-600 to-pink-600',
      link: '/admin/users',
    },
    {
      title: 'Open Support Tickets',
      value: metrics.openTickets || 0,
      sub: 'Needs technician triage',
      icon: Wrench,
      color: 'from-rose-600 to-red-600',
      link: '/admin/maintenance',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Operations Command Center</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time monitoring for RentEase catalog, subscriptions, logistics, and maintenance tickets.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition border border-slate-700"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            to="/admin/analytics"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition shadow-sm"
          >
            <TrendingUp className="h-3.5 w-3.5" />
            Detailed Analytics
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Link
              key={i}
              to={stat.link}
              className="group relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800/90 p-5 hover:border-slate-700 transition duration-150 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-400 block mb-1">{stat.title}</span>
                  <span className="text-2xl font-extrabold text-white tracking-tight">{stat.value}</span>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr ${stat.color} text-white shadow-md`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs text-slate-400">
                <span>{stat.sub}</span>
                <span className="flex items-center gap-1 text-blue-400 group-hover:translate-x-0.5 transition-transform text-[11px] font-semibold">
                  Manage <ArrowUpRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Operational Queues Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders Queue */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white">Recent Customer Orders</h3>
            </div>
            <Link to="/admin/orders" className="text-xs text-blue-400 hover:underline font-semibold flex items-center gap-1">
              View all ({metrics.totalOrders || 0}) <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">No recent orders recorded</div>
          ) : (
            <div className="space-y-2.5">
              {recentOrders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white">{order.order_number}</span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        order.status === 'out_for_delivery' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {order.user_name} • {order.city || 'Bengaluru'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-white block">
                      ₹{Number(order.total_amount_due || 0).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Subscriptions Queue */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Active Rental Subscriptions</h3>
            </div>
            <Link to="/admin/rentals" className="text-xs text-blue-400 hover:underline font-semibold flex items-center gap-1">
              View all ({metrics.totalRentals || 0}) <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          {activeRentals.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">No active rentals</div>
          ) : (
            <div className="space-y-2.5">
              {activeRentals.slice(0, 5).map((rental) => (
                <div
                  key={rental.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {rental.product_image && (
                      <img
                        src={rental.product_image}
                        alt={rental.product_name}
                        referrerPolicy="no-referrer"
                        className="h-10 w-10 rounded-lg object-cover bg-slate-800 shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <span className="font-semibold text-xs text-white truncate block">
                        {rental.product_name || rental.rental_number}
                      </span>
                      <p className="text-[11px] text-slate-400 truncate">
                        {rental.user_name} • Ends {new Date(rental.end_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-emerald-400 block">
                      ₹{Number(rental.monthly_rent || 0).toLocaleString('en-IN')}/mo
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {rental.rental_number}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Open Maintenance Tickets */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-rose-400" />
              <h3 className="text-sm font-bold text-white">Open Maintenance Tickets</h3>
            </div>
            <Link to="/admin/maintenance" className="text-xs text-blue-400 hover:underline font-semibold flex items-center gap-1">
              Dispatch board <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          {openTickets.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">All maintenance tickets resolved</div>
          ) : (
            <div className="space-y-2.5">
              {openTickets.slice(0, 4).map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-start justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-white">{ticket.ticket_number}</span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        ticket.urgency === 'high' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        ticket.urgency === 'medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {ticket.urgency} urgency
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-medium truncate">{ticket.product_name}</p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{ticket.issue_category}: {ticket.description}</p>
                  </div>
                  <div className="text-right shrink-0 pl-2">
                    <span className="text-[10px] text-slate-400 block font-mono">{ticket.status}</span>
                    <span className="text-[10px] text-slate-500 block">{new Date(ticket.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Returns & Inspections */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <Undo2 className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Returns & Damage Inspections</h3>
            </div>
            <Link to="/admin/returns" className="text-xs text-blue-400 hover:underline font-semibold flex items-center gap-1">
              Manage returns <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          {pendingReturns.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">No pending return requests</div>
          ) : (
            <div className="space-y-2.5">
              {pendingReturns.slice(0, 4).map((ret) => (
                <div
                  key={ret.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono text-xs font-bold text-white">{ret.return_number}</span>
                      {ret.is_early_termination && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Early Term
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 truncate">{ret.product_name || 'Rental Item'}</p>
                    <p className="text-[11px] text-slate-400 truncate">
                      Pickup: {new Date(ret.pickup_date).toLocaleDateString()} ({ret.pickup_slot})
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-semibold text-amber-400 block uppercase text-[10px]">
                      {ret.status}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Dep: ₹{Number(ret.deposit_paid || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
