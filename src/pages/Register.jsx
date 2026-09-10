import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  ArrowRight,
  Sparkles,
  Calendar,
  ShieldCheck,
} from 'lucide-react';
import { useRental } from '../context/useRental';
import { HERO_IMAGE } from '../constants/theme';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { register } = useRental();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await register(email, password, name, city, phone);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 w-full flex flex-col md:grid md:grid-cols-2 min-h-[calc(100vh-105px)] bg-slate-950">
      {/* Left Column: 50% Lifestyle Experience Visual */}
      <div className="relative flex flex-col justify-between p-6 sm:p-8 md:p-10 lg:p-12 xl:p-14 text-white min-h-[320px] sm:min-h-[380px] md:min-h-full overflow-hidden bg-slate-950">
        {/* Full-bleed lifestyle image */}
        <img
          src={HERO_IMAGE}
          alt="Curated modern living room rental furniture"
          referrerPolicy="no-referrer"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-65 transition-transform duration-700 hover:scale-105"
        />

        {/* Subtle blue / lavender ambient gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-slate-950/20 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-transparent to-indigo-900/40 pointer-events-none" />
        <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-blue-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-purple-500/25 blur-3xl" />

        {/* Top Brand Pill */}
        <div className="relative z-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white text-slate-950 shadow-xs">
              <svg
                className="h-3.5 w-3.5 text-blue-600"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v6H4a1 1 0 0 1-1-1V9.5Z"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="text-sm font-black tracking-tight">
              Rent<span className="text-blue-400">Ease</span>
            </span>
            <span className="text-[11px] text-slate-300 font-normal border-l border-white/25 pl-2.5">
              Lifestyle Rentals
            </span>
          </Link>
        </div>

        {/* Mid / Tagline Section */}
        <div className="relative z-10 my-6 md:my-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black tracking-tight text-white leading-tight">
            Build your space.
            <br />
            <span className="bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200 bg-clip-text text-transparent">
              Your way.
            </span>
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-slate-200/90 max-w-md leading-relaxed hidden sm:block">
            Join RentEase and enjoy premium furniture, appliances and electronics without the commitment of ownership.
          </p>
        </div>

        {/* Bottom Floating Glass Cards */}
        <div className="relative z-10 grid grid-cols-3 gap-2 sm:gap-3 pt-2">
          <div className="rounded-2xl border border-white/20 bg-slate-950/50 p-2.5 sm:p-3.5 backdrop-blur-md shadow-lg shadow-black/10 transition-all duration-200 hover:bg-slate-950/65 hover:border-white/30">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-blue-500/25 text-blue-300 shrink-0">
                <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </span>
              <span className="text-[11px] sm:text-xs font-bold text-white truncate">900+ Products</span>
            </div>
            <p className="mt-1 text-[10px] sm:text-[11px] text-slate-200 hidden md:block truncate">Curated & verified</p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-slate-950/50 p-2.5 sm:p-3.5 backdrop-blur-md shadow-lg shadow-black/10 transition-all duration-200 hover:bg-slate-950/65 hover:border-white/30">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-indigo-500/25 text-indigo-300 shrink-0">
                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </span>
              <span className="text-[11px] sm:text-xs font-bold text-white truncate">1–12 Month Plans</span>
            </div>
            <p className="mt-1 text-[10px] sm:text-[11px] text-slate-200 hidden md:block truncate">Flexible tenure</p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-slate-950/50 p-2.5 sm:p-3.5 backdrop-blur-md shadow-lg shadow-black/10 transition-all duration-200 hover:bg-slate-950/65 hover:border-white/30">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-purple-500/25 text-purple-300 shrink-0">
                <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </span>
              <span className="text-[11px] sm:text-xs font-bold text-white truncate">Maintenance Support</span>
            </div>
            <p className="mt-1 text-[10px] sm:text-[11px] text-slate-200 hidden md:block truncate">Zero maintenance</p>
          </div>
        </div>
      </div>

      {/* Right Column: 50% Sign Up Form with subtle warm off-white / blue-tinted background */}
      <div className="flex flex-col justify-center px-6 py-8 sm:px-10 md:px-8 lg:px-12 xl:px-16 bg-[#f8fafc] border-t md:border-t-0 md:border-l border-slate-200/80">
        <div className="w-full max-w-md mx-auto space-y-4 sm:space-y-5">
          {/* Header & Logo */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white shadow-xs">
                <svg
                  className="h-5 w-5 text-blue-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v6H4a1 1 0 0 1-1-1V9.5Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <div className="leading-tight">
                <span className="text-base font-black tracking-tight text-slate-950">
                  Rent<span className="text-blue-600">Ease</span>
                </span>
                <span className="block text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  Customer Portal
                </span>
              </div>
            </div>

            <div className="pt-1">
              <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                Create your account
              </h1>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                Start renting smarter today.
              </p>
            </div>
          </div>

          {/* Error Notice */}
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs font-semibold text-rose-700 flex items-start gap-2.5"
            >
              <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
            {/* Full Name */}
            <div>
              <label
                htmlFor="register-name"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Full Name
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <User className="h-4 w-4" aria-hidden="true" />
                </div>
                <input
                  id="register-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Morgan"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label
                htmlFor="register-email"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail className="h-4 w-4" aria-hidden="true" />
                </div>
                <input
                  id="register-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                />
              </div>
            </div>

            {/* 2-Column Row for Phone & City */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Phone Number */}
              <div>
                <label
                  htmlFor="register-phone"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Phone <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Phone className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <input
                    id="register-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Primary City */}
              <div>
                <label
                  htmlFor="register-city"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Primary City
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <select
                    id="register-city"
                    name="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-8 text-xs sm:text-sm font-medium text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 appearance-none cursor-pointer"
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
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Create Password */}
            <div>
              <label
                htmlFor="register-password"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Create Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock className="h-4 w-4" aria-hidden="true" />
                </div>
                <input
                  id="register-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 rounded"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            {/* Primary Submit Button */}
            <div className="pt-1">
              <button
                type="submit"
                id="register-submit-btn"
                disabled={submitting}
                className="w-full inline-flex h-11 sm:h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-sm shadow-blue-500/25 hover:bg-blue-700 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
              >
                {submitting ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Account...
                  </span>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer Sign In Link */}
          <div className="border-t border-slate-200/80 pt-4 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-blue-600 hover:text-blue-700 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500/30 rounded"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
