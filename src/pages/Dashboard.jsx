import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useRental } from '../context/useRental';
import { PRODUCTS } from '../constants/theme';
import ProductCard from '../components/ProductCard';

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'rentals';
  const { user, rentals, favoriteProducts, logout } = useRental();
  const [serviceToast, setServiceToast] = useState('');

  const wishlistItems = PRODUCTS.filter((p) => favoriteProducts.includes(p.id));

  const handleRequestService = (rentalId) => {
    setServiceToast(`Service request raised for ${rentalId}. Our technician will contact you within 4 hours.`);
    setTimeout(() => setServiceToast(''), 4000);
  };

  return (
    <div className="space-y-8">
      {/* Header Profile Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-xl font-black text-white">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-950">{user?.name || 'RentEase Member'}</h1>
              <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">Verified</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{user?.email || 'member@rentease.in'} · Active in {user?.city || 'Bengaluru'}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-rose-600 self-start sm:self-auto"
        >
          Sign Out
        </button>
      </div>

      {serviceToast && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-center text-xs font-bold text-emerald-800">
          ✓ {serviceToast}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-bold">
        <button
          type="button"
          onClick={() => setSearchParams({ tab: 'rentals' })}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'rentals' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Active Rentals ({rentals.length})
        </button>
        <button
          type="button"
          onClick={() => setSearchParams({ tab: 'wishlist' })}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'wishlist' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Saved Wishlist ({wishlistItems.length})
        </button>
        <button
          type="button"
          onClick={() => setSearchParams({ tab: 'benefits' })}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'benefits' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Member Benefits
        </button>
      </div>

      {/* Tab Content: Active Rentals */}
      {activeTab === 'rentals' && (
        <div className="space-y-4">
          {rentals.length === 0 ? (
            <div className="py-12 text-center rounded-2xl border border-slate-200 bg-white p-8 space-y-3">
              <p className="text-sm font-bold text-slate-900">No active rental subscriptions</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">Explore 900+ premium furniture and home appliances on flexible plans.</p>
              <Link
                to="/products"
                className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-5 text-xs font-bold text-white shadow-xs hover:bg-blue-700"
              >
                Browse Catalog
              </Link>
            </div>
          ) : (
            rentals.map((rental) => (
              <div
                key={rental.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{rental.productName}</span>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                        {rental.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">Rental ID: {rental.id} · {rental.category}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-base font-black text-slate-950">₹{rental.monthlyRent?.toLocaleString() || '1,499'}</span>
                    <span className="text-[10px] text-slate-400"> / month</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Tenure Plan</span>
                    <span className="font-semibold text-slate-800">{rental.tenureMonths || 12} Months</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Start Date</span>
                    <span className="font-semibold text-slate-800">{rental.startDate || '2026-08-15'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Next Billing</span>
                    <span className="font-semibold text-slate-800">{rental.nextBillingDate || '2026-09-15'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Security Deposit</span>
                    <span className="font-semibold text-slate-800">₹{rental.deposit?.toLocaleString() || '0'} (Refundable)</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                  <p className="text-[11px] text-slate-500 truncate max-w-md">
                    📍 {rental.deliveryAddress || 'Bengaluru, Karnataka'}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleRequestService(rental.id)}
                      className="inline-flex h-8 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-[11px] font-bold text-slate-700 hover:bg-slate-100"
                    >
                      Request Free Maintenance
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRequestService(rental.id)}
                      className="inline-flex h-8 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-[11px] font-bold text-slate-700 hover:bg-slate-100"
                    >
                      Relocate Item
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab Content: Wishlist */}
      {activeTab === 'wishlist' && (
        <div>
          {wishlistItems.length === 0 ? (
            <div className="py-12 text-center rounded-2xl border border-slate-200 bg-white p-8 space-y-3">
              <p className="text-sm font-bold text-slate-900">Your wishlist is empty</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">Click the heart icon on any product to save it for later.</p>
              <Link
                to="/products"
                className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-5 text-xs font-bold text-white shadow-xs hover:bg-blue-700"
              >
                Explore Products
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

      {/* Tab Content: Member Benefits */}
      {activeTab === 'benefits' && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
            <span className="text-2xl">🛡️</span>
            <h4 className="text-sm font-bold text-slate-900">100% Free Maintenance</h4>
            <p className="text-xs text-slate-500">Periodic cleaning, motor checkups, and tune-ups are completely covered under your plan.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
            <span className="text-2xl">🚚</span>
            <h4 className="text-sm font-bold text-slate-900">Free City Relocation</h4>
            <p className="text-xs text-slate-500">Moving houses within the same city? We disassemble, transport, and reassemble for free.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
            <span className="text-2xl">🔄</span>
            <h4 className="text-sm font-bold text-slate-900">Easy Upgrades</h4>
            <p className="text-xs text-slate-500">Swap or upgrade your appliances and furniture anytime after 6 months of active tenure.</p>
          </div>
        </div>
      )}
    </div>
  );
}
