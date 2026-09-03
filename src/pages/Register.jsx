import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRental } from '../context/useRental';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [error, setError] = useState('');
  const { register } = useRental();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    register(email, password, name);
    navigate('/dashboard');
  };

  return (
    <div className="mx-auto max-w-md py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-black tracking-tight text-slate-950">Create RentEase Account</h1>
          <p className="mt-1 text-xs text-slate-500">Join thousands renting furniture with zero commitment</p>
        </div>

        {error && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <label className="block space-y-1">
            <span className="font-semibold text-slate-700">Full Name</span>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="Alex Morgan"
            />
          </label>

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
            <span className="font-semibold text-slate-700">Primary City</span>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="Bengaluru">Bengaluru</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi NCR">Delhi NCR</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Pune">Pune</option>
              <option value="Chennai">Chennai</option>
              <option value="Kolkata">Kolkata</option>
              <option value="Jaipur">Jaipur</option>
              <option value="Ahmedabad">Ahmedabad</option>
            </select>
          </label>

          <label className="block space-y-1">
            <span className="font-semibold text-slate-700">Create Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="Minimum 6 characters"
            />
          </label>

          <button
            type="submit"
            className="w-full inline-flex h-11 items-center justify-center rounded-xl bg-slate-950 px-4 text-xs font-bold text-white shadow-xs hover:bg-blue-600 transition"
          >
            Create Account & Get Started
          </button>
        </form>

        <div className="border-t border-slate-100 pt-4 text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-blue-600 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
