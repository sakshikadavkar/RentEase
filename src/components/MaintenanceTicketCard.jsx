import { Wrench, CheckCircle2, Clock, Phone, User } from 'lucide-react';

export default function MaintenanceTicketCard({ ticket }) {
  if (!ticket) return null;

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'critical':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'high':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'medium':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'resolved':
      case 'closed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'in_progress':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'assigned':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  const timeline = ticket.timeline || [
    { key: 'open', label: 'Ticket Submitted', completed: true, current: ticket.status === 'open' },
    { key: 'assigned', label: 'Technician Assigned', completed: ['assigned', 'in_progress', 'resolved', 'closed'].includes(ticket.status), current: ticket.status === 'assigned' },
    { key: 'in_progress', label: 'Service In Progress', completed: ['in_progress', 'resolved', 'closed'].includes(ticket.status), current: ticket.status === 'in_progress' },
    { key: 'resolved', label: 'Issue Resolved', completed: ['resolved', 'closed'].includes(ticket.status), current: ['resolved', 'closed'].includes(ticket.status) },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <Wrench className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-slate-900 text-sm">{ticket.productName || 'Rental Item'}</h4>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold border uppercase ${getUrgencyBadge(ticket.urgency)}`}>
                {ticket.urgency}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Ticket <span className="font-semibold text-slate-700">{ticket.ticketNumber || `TKT-${ticket.id}`}</span> • Category: <span className="font-medium text-slate-700">{ticket.issueCategory}</span>
            </p>
          </div>
        </div>

        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold border capitalize ${getStatusBadge(ticket.status)}`}>
          {ticket.status?.replace('_', ' ') || 'Submitted'}
        </span>
      </div>

      <div className="text-xs text-slate-700 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
        <p className="font-semibold text-slate-900 mb-1">Issue Description:</p>
        <p className="text-slate-600 leading-relaxed">{ticket.description}</p>
        {ticket.preferredTimeSlot && (
          <p className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-blue-600" />
            Preferred Slot: <span className="font-medium text-slate-700">{ticket.preferredTimeSlot}</span>
          </p>
        )}
      </div>

      {ticket.technicianName && (
        <div className="flex items-center justify-between rounded-xl bg-emerald-50/50 p-3 text-xs border border-emerald-100">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-emerald-600" />
            <span className="text-slate-700">
              Assigned Specialist: <span className="font-bold text-slate-900">{ticket.technicianName}</span>
            </span>
          </div>
          {ticket.technicianPhone && (
            <a
              href={`tel:${ticket.technicianPhone}`}
              className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:underline"
            >
              <Phone className="h-3.5 w-3.5" />
              {ticket.technicianPhone}
            </a>
          )}
        </div>
      )}

      {/* Structured Timeline Stepper */}
      <div className="pt-2">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {timeline.map((step) => (
            <div key={step.key || step.label} className="space-y-1">
              <div className="flex items-center gap-1.5">
                {step.completed ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-slate-300 flex items-center justify-center shrink-0">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                  </div>
                )}
                <span className={`text-xs font-bold ${step.completed ? 'text-slate-900' : 'text-slate-400'}`}>
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
