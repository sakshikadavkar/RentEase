import { Package, Truck, CheckCircle2, Phone } from 'lucide-react';

export default function OrderLifecycleCard({ order, delivery }) {
  if (!order) return null;

  const getOrderStatusBadge = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'out_for_delivery':
      case 'shipped':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'confirmed':
      case 'processing':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  const steps = [
    { key: 'placed', label: 'Order Placed', done: true },
    { key: 'confirmed', label: 'Payment Verified', done: true },
    { key: 'processing', label: 'Quality Prepared', done: ['processing', 'shipped', 'out_for_delivery', 'delivered'].includes(order.status) },
    { key: 'shipped', label: 'Out for Delivery', done: ['shipped', 'out_for_delivery', 'delivered'].includes(order.status) || delivery?.status === 'out_for_delivery' || delivery?.status === 'delivered' },
    { key: 'delivered', label: 'Delivered & Installed', done: order.status === 'delivered' || delivery?.status === 'delivered' },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">
              Order {order.orderNumber || `ORD-${order.id}`}
            </h4>
            <p className="text-xs text-slate-500">
              Placed on {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recent'}
            </p>
          </div>
        </div>

        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold border capitalize ${getOrderStatusBadge(order.status)}`}>
          {order.status?.replace('_', ' ') || 'Placed'}
        </span>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-xl bg-slate-50 p-3 text-xs border border-slate-100">
        <div>
          <span className="text-slate-500 block">Monthly Total</span>
          <span className="font-bold text-slate-900">₹{Number(order.subtotalMonthly || 0).toLocaleString('en-IN')}/mo</span>
        </div>
        <div>
          <span className="text-slate-500 block">Security Deposit</span>
          <span className="font-bold text-slate-900">₹{Number(order.depositTotal || 0).toLocaleString('en-IN')}</span>
        </div>
        <div>
          <span className="text-slate-500 block">Total Paid Today</span>
          <span className="font-bold text-emerald-700">₹{Number(order.totalAmountDue || 0).toLocaleString('en-IN')}</span>
        </div>
        <div>
          <span className="text-slate-500 block">Payment Method</span>
          <span className="font-semibold text-slate-700">{order.paymentMethod || 'UPI'}</span>
        </div>
      </div>

      {/* Delivery Tracking Details */}
      {delivery && (
        <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-3 text-xs space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 font-bold text-blue-900">
              <Truck className="h-4 w-4 text-blue-600" />
              <span>Tracking: {delivery.trackingNumber || 'TRK-Live'}</span>
            </div>
            {delivery.timeSlot && (
              <span className="text-blue-800 font-medium">
                Slot: {delivery.timeSlot}
              </span>
            )}
          </div>
          {delivery.driverName && (
            <div className="flex items-center justify-between text-slate-700 pt-1 border-t border-blue-100">
              <span>Logistics Partner: <strong className="text-slate-900">{delivery.driverName}</strong></span>
              {delivery.driverPhone && (
                <a href={`tel:${delivery.driverPhone}`} className="text-blue-600 font-bold hover:underline inline-flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {delivery.driverPhone}
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {/* Order Progress Stepper */}
      <div className="pt-2">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {steps.map((step) => (
            <div key={step.key} className="space-y-1">
              <div className="flex items-center gap-1.5">
                {step.done ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-slate-300 flex items-center justify-center shrink-0">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                  </div>
                )}
                <span className={`text-[11px] font-bold ${step.done ? 'text-slate-900' : 'text-slate-400'}`}>
                  {step.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
