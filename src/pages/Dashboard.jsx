import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useRental } from '../context/useRental';
import { PRODUCTS } from '../constants/theme';
import ProductCard from '../components/ProductCard';
import ProductImage from '../components/ProductImage';
import RentalExtendModal from '../components/RentalExtendModal';
import RentalReturnModal from '../components/RentalReturnModal';
import RentalTerminateModal from '../components/RentalTerminateModal';
import DepositRefundStatusCard from '../components/DepositRefundStatusCard';
import MaintenanceRequestModal from '../components/MaintenanceRequestModal';
import MaintenanceTicketCard from '../components/MaintenanceTicketCard';
import OrderLifecycleCard from '../components/OrderLifecycleCard';
import {
  Clock,
  RotateCcw,
  Wrench,
  Package,
  Heart,
  ShieldCheck,
  Truck,
  Plus,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  MapPin,
  Calendar,
  LogOut,
  ChevronRight,
  Home,
  Check,
  Layers,
  ArrowRight,
} from 'lucide-react';

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'rentals';

  const {
    user,
    rentals,
    loadingRentals,
    fetchRentals,
    extendRental,
    returnRental,
    terminateRental,
    maintenanceTickets,
    loadingTickets,
    createMaintenanceTicket,
    orders,
    deliveries,
    favoriteProducts,
    logout,
  } = useRental();

  // Active Modals State
  const [extendModalRental, setExtendModalRental] = useState(null);
  const [returnModalRental, setReturnModalRental] = useState(null);
  const [terminateModalRental, setTerminateModalRental] = useState(null);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [maintenanceDefaultRentalId, setMaintenanceDefaultRentalId] = useState('');

  // Toast Feedback State
  const [toastMessage, setToastMessage] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 5000);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await fetchRentals();
      showToast('Database synchronized successfully with latest rental records.');
    } catch {
      showToast('Synced with server.');
    } finally {
      setTimeout(() => setIsSyncing(false), 500);
    }
  };

  const wishlistItems = PRODUCTS.filter((p) => favoriteProducts.includes(p.id));

  // Category counts
  const activeRentalsList = rentals.filter((r) => ['active', 'Active'].includes(r.status));
  const extendedRentalsList = rentals.filter((r) => r.extensionHistory && r.extensionHistory.length > 0);
  const returnsList = rentals.filter(
    (r) => ['return_requested', 'inspecting', 'completed', 'terminated'].includes(r.status) || r.returnInfo
  );

  // Financial aggregates
  const totalMonthlyCommitment = activeRentalsList.reduce((acc, r) => acc + Number(r.monthlyRent || 0), 0);
  const totalDepositProtected = activeRentalsList.reduce((acc, r) => acc + Number(r.depositPaid || r.deposit || 0), 0);

  // Handlers
  const handleExtendConfirm = async (rentalId, months) => {
    await extendRental(rentalId, months);
    showToast(`✓ Rental successfully extended by +${months} months! Updated end date and billing saved.`);
  };

  const handleReturnConfirm = async (rentalId, data) => {
    await returnRental(rentalId, data);
    showToast(`✓ Return scheduled successfully for ${data.pickupDate}. Doorstep pickup will occur in your chosen slot.`);
  };

  const handleTerminateConfirm = async (rentalId, data) => {
    await terminateRental(rentalId, data);
    showToast(`✓ Early termination requested. Deposit refund inspection scheduled.`);
  };

  const handleCreateMaintenanceConfirm = async (ticketData) => {
    const res = await createMaintenanceTicket(ticketData);
    showToast(`✓ Service ticket #${res.data?.ticketNumber || 'TKT'} created. Technician assigned within 4 hours.`);
  };

  return (
    <div className="relative space-y-8 max-w-7xl mx-auto py-2 pb-16">
      {/* Ambient Backdrop Gradients */}
      <div className="pointer-events-none absolute -top-10 left-1/4 -z-10 h-72 w-72 rounded-full bg-blue-500/5 blur-3xl" />
      <div className="pointer-events-none absolute top-40 right-10 -z-10 h-72 w-72 rounded-full bg-indigo-500/5 blur-3xl" />

      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-medium text-slate-500 overflow-x-auto whitespace-nowrap py-1">
        <Link to="/" className="inline-flex items-center gap-1 hover:text-blue-600 transition-colors">
          <Home className="h-3.5 w-3.5" />
          <span>Home</span>
        </Link>
        <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
        <span className="text-slate-900 font-semibold">Customer Dashboard</span>
      </nav>

      {/* User Header Profile Banner */}
      <div className="rounded-3xl border border-slate-200/85 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Avatar & Greetings */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="relative flex h-16 w-16 sm:h-18 sm:w-18 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-2xl font-black text-white shadow-md shadow-blue-500/20">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-white">
                <Check className="h-3.5 w-3.5 stroke-[3]" />
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-slate-950">
                  {user?.name || 'RentEase Customer'}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 border border-blue-100">
                  <Sparkles className="h-3 w-3 text-blue-600" />
                  <span>Verified Member</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500 font-medium">
                <span>{user?.email || 'member@rentease.in'}</span>
                <span className="hidden sm:inline text-slate-300">•</span>
                <span className="inline-flex items-center gap-1 text-slate-600">
                  <MapPin className="h-3.5 w-3.5 text-blue-600" />
                  <span>Hub: {user?.city || 'Bengaluru'}</span>
                </span>
                <span className="hidden sm:inline text-slate-300">•</span>
                <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.2 rounded">
                  Active Subscription Tier
                </span>
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2.5 self-start md:self-center shrink-0">
            <button
              type="button"
              onClick={handleSync}
              disabled={isSyncing}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-4 text-xs font-bold text-slate-700 hover:bg-white hover:border-slate-300 transition-colors shadow-2xs disabled:opacity-60"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Data'}</span>
            </button>

            <button
              type="button"
              onClick={logout}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors shadow-2xs"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Quick Summary Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-100 text-xs">
          {/* Card 1: Active Rentals */}
          <button
            type="button"
            onClick={() => setSearchParams({ tab: 'rentals' })}
            className={`p-4 rounded-2xl border text-left transition-all duration-150 ${
              activeTab === 'rentals'
                ? 'border-blue-600 bg-blue-50/50 shadow-2xs ring-2 ring-blue-500/15'
                : 'border-slate-200/80 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active Rentals</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Clock className="h-3.5 w-3.5" />
              </span>
            </div>
            <div className="mt-2">
              <span className="text-xl sm:text-2xl font-black text-slate-950 block">
                {activeRentalsList.length}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                ₹{totalMonthlyCommitment.toLocaleString('en-IN')}/mo total
              </span>
            </div>
          </button>

          {/* Card 2: Orders & Logistics */}
          <button
            type="button"
            onClick={() => setSearchParams({ tab: 'orders' })}
            className={`p-4 rounded-2xl border text-left transition-all duration-150 ${
              activeTab === 'orders'
                ? 'border-blue-600 bg-blue-50/50 shadow-2xs ring-2 ring-blue-500/15'
                : 'border-slate-200/80 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Orders & Deliveries</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Package className="h-3.5 w-3.5" />
              </span>
            </div>
            <div className="mt-2">
              <span className="text-xl sm:text-2xl font-black text-slate-950 block">
                {orders.length}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                {deliveries.filter((d) => d.status !== 'delivered').length} active tracking
              </span>
            </div>
          </button>

          {/* Card 3: Maintenance Tickets */}
          <button
            type="button"
            onClick={() => setSearchParams({ tab: 'maintenance' })}
            className={`p-4 rounded-2xl border text-left transition-all duration-150 ${
              activeTab === 'maintenance'
                ? 'border-blue-600 bg-blue-50/50 shadow-2xs ring-2 ring-blue-500/15'
                : 'border-slate-200/80 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Service Care</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <Wrench className="h-3.5 w-3.5" />
              </span>
            </div>
            <div className="mt-2">
              <span className="text-xl sm:text-2xl font-black text-slate-950 block">
                {maintenanceTickets.length}
              </span>
              <span className="text-[11px] text-emerald-600 font-bold">
                100% Free Doorstep Support
              </span>
            </div>
          </button>

          {/* Card 4: Protected Deposits */}
          <button
            type="button"
            onClick={() => setSearchParams({ tab: 'returns' })}
            className={`p-4 rounded-2xl border text-left transition-all duration-150 ${
              activeTab === 'returns'
                ? 'border-blue-600 bg-blue-50/50 shadow-2xs ring-2 ring-blue-500/15'
                : 'border-slate-200/80 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Security Deposits</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                <ShieldCheck className="h-3.5 w-3.5" />
              </span>
            </div>
            <div className="mt-2">
              <span className="text-xl sm:text-2xl font-black text-slate-950 block">
                ₹{totalDepositProtected.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                100% Refundable on return
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Floating Action Toast Notification */}
      {toastMessage && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200/90 p-4 text-center text-xs font-bold text-emerald-900 shadow-sm flex items-center justify-center gap-2.5 transition-all">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Tabs Bar */}
      <div className="flex border-b border-slate-200/80 overflow-x-auto gap-2 sm:gap-4 text-xs font-bold no-scrollbar pb-1">
        {[
          { id: 'rentals', label: 'Active Rentals', count: activeRentalsList.length, icon: Clock },
          { id: 'extended', label: 'Extended Plans', count: extendedRentalsList.length, icon: Sparkles },
          { id: 'returns', label: 'Returns & Refunds', count: returnsList.length, icon: RotateCcw },
          { id: 'maintenance', label: 'Maintenance Tickets', count: maintenanceTickets.length, icon: Wrench },
          { id: 'orders', label: 'Orders & Deliveries', count: orders.length, icon: Package },
          { id: 'wishlist', label: 'Wishlist', count: wishlistItems.length, icon: Heart },
          { id: 'benefits', label: 'Care Benefits', count: null, icon: ShieldCheck },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSearchParams({ tab: tab.id })}
              className={`pb-3 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 px-1 text-xs ${
                isActive
                  ? 'border-blue-600 text-blue-600 font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 1. TAB: Active Rentals (Hero Section) */}
      {/* ========================================================================= */}
      {activeTab === 'rentals' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-950 flex items-center gap-2">
                <span>Active Rental Subscriptions</span>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                  {activeRentalsList.length} Live Plans
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Manage your running subscriptions, request free maintenance, extend tenures, or schedule hassle-free returns.
              </p>
            </div>

            <Link
              to="/products"
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition self-start sm:self-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Rent More Products</span>
            </Link>
          </div>

          {loadingRentals ? (
            <div className="py-16 text-center rounded-3xl border border-slate-200/80 bg-white p-8 space-y-3">
              <RefreshCw className="h-6 w-6 text-blue-600 animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-600">Loading your rental subscriptions...</p>
            </div>
          ) : activeRentalsList.length === 0 ? (
            <div className="py-16 text-center rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-12 space-y-4 shadow-xs">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 border border-blue-100 text-blue-600">
                <Layers className="h-8 w-8 stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">No active rental subscriptions</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Explore 900+ curated items across Living Room, Bedroom, Appliances, and Study with zero security deposit options, free doorstep maintenance, and flexible extensions.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  to="/products"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition"
                >
                  <span>Browse Catalog</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {activeRentalsList.map((rental) => {
                const totalDeposit = Number(rental.depositPaid || rental.deposit || 0);
                const isZeroDeposit = totalDeposit === 0;
                return (
                  <div
                    key={rental.id}
                    className="rounded-3xl border border-slate-200/85 bg-white p-6 sm:p-7 shadow-xs space-y-5 transition hover:border-slate-300"
                  >
                    {/* Top Row: Product Identity & Monthly Rent */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 sm:h-18 sm:w-18 shrink-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100">
                          <ProductImage
                            src={rental.product?.image || rental.image}
                            alt={rental.product?.name || rental.productName || 'Rental Item'}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm sm:text-base font-bold text-slate-950 truncate">
                              {rental.product?.name || rental.productName}
                            </span>
                            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                              Active · In Service
                            </span>
                            {rental.extensionHistory && rental.extensionHistory.length > 0 && (
                              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">
                                Extended +{rental.extensionHistory.reduce((acc, h) => acc + (h.monthsAdded || 0), 0)}m
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 font-medium">
                            <span>Sub ID: <strong className="font-mono text-slate-800">{rental.rentalNumber || rental.id}</strong></span>
                            <span>•</span>
                            <span>{rental.product?.category || rental.category || 'Home & Living'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-left sm:text-right shrink-0 bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl sm:rounded-none">
                        <span className="text-xs text-slate-400 block font-medium">Monthly Rental</span>
                        <span className="text-xl sm:text-2xl font-black tracking-tight text-blue-600">
                          ₹{Number(rental.monthlyRent || 0).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[11px] text-slate-400"> / month</span>
                      </div>
                    </div>

                    {/* Middle Row: Plan Details Metric Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-bold block flex items-center gap-1">
                          <Clock className="h-3 w-3 text-slate-400" />
                          <span>Tenure Plan</span>
                        </span>
                        <span className="font-bold text-slate-900 mt-1 block">
                          {rental.tenureMonths || 12} Months
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-bold block flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          <span>Start Date</span>
                        </span>
                        <span className="font-semibold text-slate-800 mt-1 block">
                          {rental.startDate
                            ? new Date(rental.startDate).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })
                            : 'Active'}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-bold block flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          <span>Tenure End Date</span>
                        </span>
                        <span className="font-semibold text-slate-800 mt-1 block">
                          {rental.endDate
                            ? new Date(rental.endDate).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })
                            : 'Auto-renew'}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-bold block flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3 text-emerald-600" />
                          <span>Security Deposit</span>
                        </span>
                        {isZeroDeposit ? (
                          <span className="font-bold text-emerald-700 mt-1 inline-flex items-center gap-1 bg-emerald-100/60 px-1.5 py-0.5 rounded text-[11px]">
                            ₹0 Deposit Protected
                          </span>
                        ) : (
                          <span className="font-bold text-emerald-700 mt-1 block">
                            ₹{totalDeposit.toLocaleString('en-IN')} (Refundable)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Row: Address & Structured Action Buttons */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-md">
                          {rental.deliveryAddress || 'Indiranagar, Bengaluru, Karnataka'}
                        </span>
                      </div>

                      {/* Action Toolbar */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* 1. Extend Tenure */}
                        <button
                          type="button"
                          onClick={() => setExtendModalRental(rental)}
                          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors shadow-2xs"
                        >
                          <Clock className="h-3.5 w-3.5" />
                          <span>Extend Plan</span>
                        </button>

                        {/* 2. Structured Free Maintenance */}
                        <button
                          type="button"
                          onClick={() => {
                            setMaintenanceDefaultRentalId(rental.id);
                            setIsMaintenanceModalOpen(true);
                          }}
                          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs"
                        >
                          <Wrench className="h-3.5 w-3.5 text-slate-500" />
                          <span>Free Service</span>
                        </button>

                        {/* 3. Schedule Return */}
                        <button
                          type="button"
                          onClick={() => setReturnModalRental(rental)}
                          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs"
                        >
                          <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
                          <span>Return</span>
                        </button>

                        {/* 4. Early Termination */}
                        <button
                          type="button"
                          onClick={() => setTerminateModalRental(rental)}
                          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-rose-100 bg-rose-50/50 px-3 text-xs font-semibold text-rose-600 hover:bg-rose-100/60 transition-colors"
                        >
                          <AlertTriangle className="h-3.5 w-3.5" />
                          <span>Early Close</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TAB: Extended Rentals */}
      {/* ========================================================================= */}
      {activeTab === 'extended' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-950">
              Extended Rental Plans
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Review all extended tenures, added months, and updated end dates.
            </p>
          </div>

          {extendedRentalsList.length === 0 ? (
            <div className="py-16 text-center rounded-3xl border border-slate-200/80 bg-white p-8 space-y-4 shadow-xs">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Sparkles className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-bold text-slate-900">No extended rentals yet</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Extend your active rental tenures anytime with 1, 3, 6, or 12 month options and lock in tenure savings.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSearchParams({ tab: 'rentals' })}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition"
              >
                <span>View Active Rentals</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {extendedRentalsList.map((rental) => (
                <div
                  key={rental.id}
                  className="rounded-3xl border border-blue-200/80 bg-gradient-to-r from-blue-50/40 via-white to-white p-6 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                        {rental.product?.name || rental.productName}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Subscription: <strong className="font-mono text-slate-800">{rental.rentalNumber || rental.id}</strong>
                      </p>
                    </div>
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800 self-start sm:self-auto">
                      Extended Plan Active
                    </span>
                  </div>

                  <div className="rounded-2xl bg-white p-4 border border-slate-100 space-y-3 text-xs">
                    <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-blue-600" />
                      <span>Extension Log & History</span>
                    </h4>
                    <div className="divide-y divide-slate-100">
                      {rental.extensionHistory.map((h, i) => (
                        <div key={i} className="py-2 flex items-center justify-between text-slate-600 first:pt-0 last:pb-0">
                          <span className="font-medium">
                            Added +{h.monthsAdded} Months on {new Date(h.createdAt).toLocaleDateString('en-IN')}
                          </span>
                          <span className="font-bold text-slate-900 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                            New End: {h.newEndDate}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setExtendModalRental(rental)}
                      className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Extend Further</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TAB: Returns & Refunds */}
      {/* ========================================================================= */}
      {activeTab === 'returns' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-950">
              Returns & Security Deposit Refunds
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Track doorstep pickup scheduling, quality inspection, and 100% deposit refund timeline.
            </p>
          </div>

          {returnsList.length === 0 ? (
            <div className="py-16 text-center rounded-3xl border border-slate-200/80 bg-white p-8 space-y-4 shadow-xs">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                <RotateCcw className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-bold text-slate-900">No scheduled returns or refund requests</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  When you schedule a product return or early close, monitor doorstep pickup slots, quality inspection, and swift 24–48h deposit refunds here.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSearchParams({ tab: 'rentals' })}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition"
              >
                <span>View Active Rentals</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {returnsList.map((rental) => (
                <div key={rental.id} className="space-y-3">
                  <div className="rounded-3xl border border-slate-200/85 bg-white p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                        {rental.product?.name || rental.productName}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Subscription ID: <strong className="font-mono text-slate-800">{rental.rentalNumber || rental.id}</strong>
                      </p>
                    </div>
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-200 capitalize self-start sm:self-auto">
                      {rental.status?.replace('_', ' ')}
                    </span>
                  </div>
                  {rental.returnInfo && (
                    <DepositRefundStatusCard
                      returnInfo={rental.returnInfo}
                      depositPaid={rental.depositPaid || rental.deposit}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TAB: Maintenance Tickets */}
      {/* ========================================================================= */}
      {activeTab === 'maintenance' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-950">
                RentEase Care Maintenance Center
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Track assigned technician visits and raise free doorstep service tickets.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setMaintenanceDefaultRentalId(activeRentalsList[0]?.id || '');
                setIsMaintenanceModalOpen(true);
              }}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition self-start sm:self-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Raise Service Ticket</span>
            </button>
          </div>

          {loadingTickets ? (
            <div className="py-16 text-center rounded-3xl border border-slate-200/80 bg-white p-8 space-y-3">
              <RefreshCw className="h-6 w-6 text-blue-600 animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-600">Loading service tickets...</p>
            </div>
          ) : maintenanceTickets.length === 0 ? (
            <div className="py-16 text-center rounded-3xl border border-slate-200/80 bg-white p-8 space-y-4 shadow-xs">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Wrench className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-bold text-slate-900">No active maintenance tickets</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Need product repair, deep sanitization, or periodic tuning? All services are 100% free under your RentEase membership.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMaintenanceDefaultRentalId(activeRentalsList[0]?.id || '');
                  setIsMaintenanceModalOpen(true);
                }}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition"
              >
                <Wrench className="h-4 w-4" />
                <span>Request Free Service</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {maintenanceTickets.map((ticket) => (
                <MaintenanceTicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. TAB: Orders & Deliveries Tracking */}
      {/* ========================================================================= */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-950">
              Orders & Doorstep Deliveries
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Live status tracking, milestones, scheduled slots, and assigned delivery partners.
            </p>
          </div>

          {orders.length === 0 ? (
            <div className="py-16 text-center rounded-3xl border border-slate-200/80 bg-white p-8 space-y-4 shadow-xs">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                <Package className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-bold text-slate-900">No order records found</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Place a rental order to see real-time delivery milestones, scheduled installation slots, and delivery details.
                </p>
              </div>
              <Link
                to="/products"
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition"
              >
                <span>Start Renting</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const delivery = deliveries.find((d) => d.orderId === order.id);
                return <OrderLifecycleCard key={order.id} order={order} delivery={delivery} />;
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. TAB: Wishlist */}
      {/* ========================================================================= */}
      {activeTab === 'wishlist' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-950">
              Saved Wishlist
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Items you have shortlisted for future rental setups.
            </p>
          </div>

          {wishlistItems.length === 0 ? (
            <div className="py-16 text-center rounded-3xl border border-slate-200/80 bg-white p-8 space-y-4 shadow-xs">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
                <Heart className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-bold text-slate-900">Your wishlist is empty</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click the heart icon on any product in the catalog to save it to your personalized wishlist.
                </p>
              </div>
              <Link
                to="/products"
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition"
              >
                <span>Explore Products</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {wishlistItems.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. TAB: Member Care Benefits */}
      {/* ========================================================================= */}
      {activeTab === 'benefits' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-950">
              RentEase Member Privileges & Care
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Every rental subscription is backed by comprehensive maintenance, relocation, and flexible upgrade protections.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div className="rounded-3xl border border-slate-200/85 bg-white p-6 sm:p-7 shadow-xs space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-950">100% Free Maintenance</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Periodic cleaning, motor and electrical servicing, polish touch-ups, and genuine part replacements are completely ₹0 throughout your tenure.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200/85 bg-white p-6 sm:p-7 shadow-xs space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <Truck className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-950">Free City Relocation</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Moving houses within your city? Our professional logistics team handles complete disassembly, safe transport, and doorstep setup for free.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200/85 bg-white p-6 sm:p-7 shadow-xs space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <RotateCcw className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-950">Hassle-Free Returns & Upgrades</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Swap or upgrade models after 6 months or schedule instant return pickups with swift 24–48h deposit refund processing.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Modal Dialogs (Preserved identical props and handlers) */}
      {/* ========================================================================= */}
      <RentalExtendModal
        rental={extendModalRental}
        isOpen={Boolean(extendModalRental)}
        onClose={() => setExtendModalRental(null)}
        onConfirm={handleExtendConfirm}
      />

      <RentalReturnModal
        rental={returnModalRental}
        isOpen={Boolean(returnModalRental)}
        onClose={() => setReturnModalRental(null)}
        onConfirm={handleReturnConfirm}
      />

      <RentalTerminateModal
        rental={terminateModalRental}
        isOpen={Boolean(terminateModalRental)}
        onClose={() => setTerminateModalRental(null)}
        onConfirm={handleTerminateConfirm}
      />

      <MaintenanceRequestModal
        rentals={activeRentalsList}
        defaultRentalId={maintenanceDefaultRentalId}
        isOpen={isMaintenanceModalOpen}
        onClose={() => setIsMaintenanceModalOpen(false)}
        onConfirm={handleCreateMaintenanceConfirm}
      />
    </div>
  );
}

