import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="py-20 text-center space-y-4">
      <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-700">404 Error</span>
      <h1 className="text-3xl font-black text-slate-950">Page Not Found</h1>
      <p className="max-w-md mx-auto text-xs text-slate-600 sm:text-sm">
        The page or rental section you are looking for does not exist or has moved.
      </p>
      <div className="pt-2 flex justify-center gap-3">
        <Link
          to="/"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-6 text-xs font-bold text-white shadow-xs hover:bg-blue-700"
        >
          Return Home
        </Link>
        <Link
          to="/products"
          className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-6 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50"
        >
          Explore Catalog
        </Link>
      </div>
    </div>
  );
}
