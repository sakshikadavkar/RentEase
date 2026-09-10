import { CheckCircle2, ShieldCheck } from 'lucide-react';

export default function DepositRefundStatusCard({ returnInfo, depositPaid = 0 }) {
  if (!returnInfo) return null;

  const deposit = Number(depositPaid || 0);
  const earlyFee = Number(returnInfo.earlyTerminationFee || 0);
  const damageFee = Number(returnInfo.damageDeduction || 0);
  const finalRefund = returnInfo.finalRefundAmount !== null
    ? Number(returnInfo.finalRefundAmount)
    : Math.max(0, deposit - earlyFee - damageFee);

  const steps = [
    { key: 'requested', label: 'Return Scheduled', done: true, desc: returnInfo.pickupDate ? `Pickup on ${returnInfo.pickupDate}` : 'Scheduled' },
    { key: 'pickup', label: 'Doorstep Pickup', done: ['item_received', 'inspecting', 'completed', 'refunded'].includes(returnInfo.status), desc: 'Product collected & verified' },
    { key: 'inspecting', label: 'Quality Inspection', done: ['inspecting', 'completed', 'refunded'].includes(returnInfo.status), desc: 'Zero hassle inspection' },
    { key: 'refunded', label: 'Deposit Refunded', done: returnInfo.depositRefundStatus === 'refunded' || returnInfo.status === 'completed', desc: `₹${finalRefund.toLocaleString('en-IN')} to original account` },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <h4 className="font-bold text-slate-900 text-sm">Security Deposit Refund Tracker</h4>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Return ID: <span className="font-semibold text-slate-700">{returnInfo.returnNumber || 'RET-Pending'}</span>
          </p>
        </div>
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${
          returnInfo.depositRefundStatus === 'refunded'
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : returnInfo.depositRefundStatus === 'approved'
            ? 'bg-blue-50 text-blue-700 border border-blue-200'
            : 'bg-amber-50 text-amber-700 border border-amber-200'
        }`}>
          {returnInfo.depositRefundStatus === 'refunded' ? 'Refund Processed' : 'Pending Inspection'}
        </span>
      </div>

      {/* Settlement Breakdown Table */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl bg-slate-50 p-3 text-xs border border-slate-100">
        <div>
          <span className="text-slate-500 block">Initial Deposit</span>
          <span className="font-bold text-slate-900 text-sm">₹{deposit.toLocaleString('en-IN')}</span>
        </div>
        {earlyFee > 0 && (
          <div>
            <span className="text-slate-500 block">Early Term Fee</span>
            <span className="font-bold text-rose-600 text-sm">-₹{earlyFee.toLocaleString('en-IN')}</span>
          </div>
        )}
        {damageFee > 0 && (
          <div>
            <span className="text-slate-500 block">Damage Deduct</span>
            <span className="font-bold text-rose-600 text-sm">-₹{damageFee.toLocaleString('en-IN')}</span>
          </div>
        )}
        <div>
          <span className="text-slate-500 block">Net Refund Amount</span>
          <span className="font-bold text-emerald-600 text-sm">₹{finalRefund.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="pt-2">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
                <span className={`text-xs font-bold ${step.done ? 'text-slate-900' : 'text-slate-400'}`}>
                  {step.label}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 pl-5.5">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
