import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRental } from '../context/useRental';

export default function Login() {
  const [email, setEmail] = useState('alex.morgan@example.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const { login } = useRental();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    login(email, password, 'Alex Morgan');
    navigate('/dashboard');
  };

  return (
    <div className="mx-auto max-w-md py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-black tracking-tight text-slate-950">Welcome to RentEase</h1>
          <p className="mt-1 text-xs text-slate-500">Sign in to manage your rentals and saved items</p>
        </div>

        {error && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <label className="block space-y-1">
            <span className="font-semibold text-slate-700">Email Address</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="you@example.com"
            />
          </label>

          <label className="block space-y-1">
            <div className="flex justify-between">
              <span className="font-semibold text-slate-700">Password</span>
              <span className="text-[11px] text-blue-600 hover:underline cursor-pointer">Forgot password?</span>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="••••••••"
            />
          </label>

          <button
            type="submit"
            className="w-full inline-flex h-11 items-center justify-center rounded-xl bg-slate-950 px-4 text-xs font-bold text-white shadow-xs hover:bg-blue-600 transition"
          >
            Sign In to Account
          </button>
        </form>

        <div className="border-t border-slate-100 pt-4 text-center text-xs text-slate-500">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-bold text-blue-600 hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
