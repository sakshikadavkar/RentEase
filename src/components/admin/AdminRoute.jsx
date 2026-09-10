import { Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { useRental } from '../../context/useRental';
import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react';

export default function AdminRoute({ children }) {
  const { user, token, isAdmin } = useRental();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12 text-white">
        <div className="max-w-md w-full rounded-2xl border border-red-500/20 bg-slate-900 p-8 text-center shadow-2xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 mb-6">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Admin Access Restricted</h1>
          <p className="text-sm text-slate-400 mb-6">
            Your account (<span className="text-slate-200 font-medium">{user?.email || 'Current User'}</span>) does not have administrator privileges.
          </p>

          <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 text-left mb-6 text-xs text-slate-400 space-y-2">
            <div className="flex justify-between">
              <span>Account Role:</span>
              <span className="font-semibold uppercase text-amber-400">{user?.role || 'customer'}</span>
            </div>
            <div className="flex justify-between">
              <span>Required Role:</span>
              <span className="font-semibold uppercase text-emerald-400">admin</span>
            </div>
            <p className="pt-2 text-[11px] text-slate-500 border-t border-slate-800/80">
              Please sign in with an administrator account to continue.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/dashboard"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2.5 text-xs font-semibold text-white transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Customer Dashboard
            </Link>
            <Link
              to="/login"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2.5 text-xs font-semibold text-white transition"
            >
              <LogIn className="h-4 w-4" />
              Switch Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children ? children : <Outlet />;
}
