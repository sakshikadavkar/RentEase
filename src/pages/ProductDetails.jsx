import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  Heart,
  ShieldCheck,
  Truck,
  Wrench,
  RotateCcw,
  Check,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  MapPin,
  Clock,
  CheckCircle2,
  ChevronRight,
  Home,
  Info,
} from 'lucide-react';
import { PRODUCTS } from '../constants/theme';
import { useRental } from '../context/useRental';
import ProductImage from '../components/ProductImage';
import ProductCard from '../components/ProductCard';
import Badge from '../components/ui/Badge';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, isFavorite, toggleFavorite } = useRental();

  const product = PRODUCTS.find((p) => p.id === id || p.slug === id) || PRODUCTS[0];
  const [selectedTenure, setSelectedTenure] = useState(12);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(product?.image || '');
  const [addedToast, setAddedToast] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Keep state in sync if product id changes from related products
  const [currentId, setCurrentId] = useState(id);
  if (id !== currentId) {
    setCurrentId(id);
    setActiveImage(product?.image || '');
    setSelectedTenure(12);
    setQuantity(1);
    setActiveTab('overview');
  }

  const favorite = product ? isFavorite(product.id) : false;

  if (!product) {
    return (
      <div className="py-24 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <Info className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-slate-900">Product Not Found</h2>
        <p className="mt-2 text-sm text-slate-600">The rental item you requested does not exist or has been moved.</p>
        <Link
          to="/products"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
        >
          <span>Back to Explore</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  // Calculate tenure discounted pricing
  const tenureMultipliers = {
    1: 1.25,
    3: 1.1,
    6: 1.0,
    12: 0.9,
  };
  const basePrice = product.monthlyPrice || 999;
  const currentMonthlyPrice = Math.round(basePrice * (tenureMultipliers[selectedTenure] || 1));
  const isZeroDeposit = selectedTenure >= 6;
  const depositAmount = isZeroDeposit ? 0 : product.deposit || product.securityDeposit || basePrice * 2;

  const tenureOptions = [
    { months: 1, label: '1 Month', badge: 'Standard', discount: 'Flexible' },
    { months: 3, label: '3 Months', badge: 'Save 10%', discount: 'Save 10%' },
    { months: 6, label: '6 Months', badge: 'Save 20%', discount: 'Save 20%' },
    { months: 12, label: '12 Months', badge: 'Best Value', discount: 'Best Value' },
  ];

  const galleryImages = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];

  const handleAddToCart = () => {
    addToCart(product, selectedTenure, quantity);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3500);
  };

  const handleRentNow = () => {
    addToCart(product, selectedTenure, quantity);
    navigate('/checkout');
  };

  const relatedProducts = PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 4);

  // Available service cities
  const serviceCities = ['Bengaluru', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Pune', 'Chennai'];

  return (
    <div className="space-y-12 pb-12">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-medium text-slate-500 overflow-x-auto whitespace-nowrap py-1">
        <Link to="/" className="inline-flex items-center gap-1 hover:text-blue-600 transition-colors">
          <Home className="h-3.5 w-3.5" />
          <span>Home</span>
        </Link>
        <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
        <Link to="/products" className="hover:text-blue-600 transition-colors">
          Explore
        </Link>
        <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
        <Link
          to={`/products?category=${encodeURIComponent(product.category)}`}
          className="hover:text-blue-600 transition-colors"
        >
          {product.category}
        </Link>
        <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
        <span className="truncate text-slate-900 font-semibold max-w-[240px] sm:max-w-none">
          {product.name || product.title}
        </span>
      </nav>

      {/* Main Product Showcase Grid */}
      <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
        {/* Left Column: Media Showcase (col-span-7) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200/85 bg-white p-3 shadow-xs group">
            {/* Ambient subtle glow background */}
            <div className="pointer-events-none absolute -top-12 -left-12 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-12 -right-12 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />

            <div className="relative overflow-hidden rounded-2xl bg-slate-100">
              <ProductImage
                src={activeImage || product.image}
                alt={product.name || product.title}
                className="h-[380px] sm:h-[460px] md:h-[500px] w-full"
                imageClassName="object-cover h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                priority
              />

              {/* Top Badges */}
              <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2 z-10">
                {product.badge && (
                  <Badge
                    variant={product.badgeVariant || 'primary'}
                    className="backdrop-blur-md bg-white/95 font-bold text-slate-950 border-white/80 shadow-xs text-xs px-3 py-1"
                  >
                    {product.badge}
                  </Badge>
                )}
                {isZeroDeposit && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/90 px-3 py-1 text-xs font-bold text-white shadow-xs backdrop-blur-md">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>0₹ Deposit Plan</span>
                  </span>
                )}
              </div>

              {/* Wishlist Button floating over top-right */}
              <button
                type="button"
                onClick={() => toggleFavorite(product.id)}
                aria-label={`${favorite ? 'Remove' : 'Add'} ${product.name} ${favorite ? 'from' : 'to'} wishlist`}
                aria-pressed={favorite}
                className={`absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border shadow-sm backdrop-blur-md transition-all duration-200 active:scale-90 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  favorite
                    ? 'border-rose-200 bg-rose-50/95 text-rose-600 shadow-rose-200/50 scale-105'
                    : 'border-white/90 bg-white/85 text-slate-600 hover:bg-white hover:text-rose-500'
                }`}
              >
                <Heart className={`h-5 w-5 transition-transform duration-200 ${favorite ? 'fill-current scale-110' : ''}`} />
              </button>

              {/* Bottom Overlaid Status Bar */}
              <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex items-center justify-between z-10">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-950/80 px-3 py-1 text-xs font-medium text-white backdrop-blur-md border border-white/15 shadow-2xs">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Available in {product.city || 'Bengaluru'}</span>
                </span>
                <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-slate-800 backdrop-blur-md shadow-2xs border border-slate-200/70">
                  {product.condition || 'Pristine & Sanitized'}
                </span>
              </div>
            </div>
          </div>

          {/* Thumbnail Strip Gallery */}
          {galleryImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1.5 pt-1">
              {galleryImages.map((img, idx) => {
                const isCurrent = (activeImage || product.image) === img;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(img)}
                    className={`relative h-20 w-24 sm:h-22 sm:w-28 shrink-0 overflow-hidden rounded-2xl border-2 transition-all duration-200 ${
                      isCurrent
                        ? 'border-blue-600 ring-4 ring-blue-500/20 shadow-sm scale-[1.02]'
                        : 'border-slate-200/90 opacity-70 hover:opacity-100 hover:border-slate-300'
                    }`}
                  >
                    <img src={img} alt={`${product.name} view ${idx + 1}`} className="h-full w-full object-cover" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Trust Highlights Strip Below Gallery */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center sm:text-left">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0">
                  <Clock className="h-4 w-4" />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Flexible Tenure</h4>
                  <p className="text-[11px] text-slate-500">1 to 12 mo plans</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                  <Wrench className="h-4 w-4" />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Zero Maintenance</h4>
                  <p className="text-[11px] text-slate-500">Free service calls</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                  <Truck className="h-4 w-4" />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Fast Delivery</h4>
                  <p className="text-[11px] text-slate-500">Free 48h doorstep</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 shrink-0">
                  <RotateCcw className="h-4 w-4" />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Easy Returns</h4>
                  <p className="text-[11px] text-slate-500">Zero exit hassle</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing, Tenure & Rental Configuration (col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Header & Title Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-700 border border-blue-200/70">
                {product.category} · {product.subcategory || 'Premium Rental'}
              </span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {product.availability || 'In Stock'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-950 leading-tight">
              {product.name || product.title}
            </h1>

            {/* Ratings & Quick Metadata */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-0.5">
              <div className="flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span>{typeof product.rating === 'number' ? product.rating.toFixed(1) : product.rating || '4.8'}</span>
              </div>
              <span className="text-slate-300">|</span>
              <span className="font-medium text-slate-600">{product.reviewCount || 48} verified ratings</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500">ID: <span className="font-mono text-[11px] uppercase text-slate-700">{product.id.slice(0, 10)}</span></span>
            </div>

            <p className="text-xs sm:text-sm leading-relaxed text-slate-600 pt-1">
              {product.description}
            </p>
          </div>

          {/* Prominent Pricing Display */}
          <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/50 via-slate-50 to-indigo-50/40 p-4">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 block">
                  Rental Pricing
                </span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950">
                    ₹{currentMonthlyPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-500">/ month</span>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center gap-1 rounded-md bg-blue-100/70 px-2.5 py-1 text-xs font-bold text-blue-800">
                  {selectedTenure} Month Plan
                </span>
                {product.originalPrice > currentMonthlyPrice && (
                  <p className="mt-1 text-xs font-medium text-slate-400 line-through">
                    ₹{product.originalPrice?.toLocaleString('en-IN')}/mo
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Rental Plan Selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
                  Choose Rental Tenure
                </label>
                <span className="text-[11px] text-slate-500">Longer tenure = Lower monthly cost</span>
              </div>
              {isZeroDeposit ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200/80">
                  <Sparkles className="h-3 w-3" />
                  <span>0₹ Security Deposit</span>
                </span>
              ) : (
                <span className="text-[11px] text-slate-400">
                  6+ mo unlocks 0₹ deposit
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {tenureOptions.map((item) => {
                const isSelected = selectedTenure === item.months;
                const optionMonthly = Math.round(basePrice * (tenureMultipliers[item.months] || 1));
                return (
                  <button
                    key={item.months}
                    type="button"
                    onClick={() => setSelectedTenure(item.months)}
                    className={`relative flex flex-col items-center justify-between rounded-2xl p-3 text-center transition-all duration-200 ${
                      isSelected
                        ? 'border-2 border-blue-600 bg-blue-50/70 text-blue-950 font-bold ring-4 ring-blue-500/15 shadow-sm'
                        : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 font-medium'
                    }`}
                  >
                    <span className="text-sm font-black">{item.label}</span>
                    <span className="mt-0.5 text-xs text-slate-600 font-semibold">
                      ₹{optionMonthly.toLocaleString('en-IN')}<span className="text-[10px] text-slate-400">/mo</span>
                    </span>
                    <span
                      className={`mt-2 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Your Rental Summary Panel */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                <span>Your Rental Summary</span>
              </h3>
              <span className="text-xs font-semibold text-slate-500">
                {selectedTenure} Month Plan
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span>Monthly Rent ({quantity} {quantity > 1 ? 'units' : 'unit'})</span>
                <span className="font-bold text-slate-900">
                  ₹{(currentMonthlyPrice * quantity).toLocaleString('en-IN')} / mo
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-600">
                <div>
                  <span>Security Deposit</span>
                  {isZeroDeposit ? (
                    <span className="block text-[10px] text-emerald-600 font-semibold">
                      Eligible on 6+ month plans
                    </span>
                  ) : (
                    <span className="block text-[10px] text-slate-400">
                      100% refundable on return
                    </span>
                  )}
                </div>
                <span className={`font-bold ${isZeroDeposit ? 'text-emerald-600 font-black text-sm' : 'text-slate-900'}`}>
                  {isZeroDeposit ? '₹0' : `₹${(depositAmount * quantity).toLocaleString('en-IN')}`}
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-600">
                <span>Doorstep Delivery & Assembly</span>
                <span className="font-bold text-emerald-600">FREE</span>
              </div>
            </div>

            {/* Upfront Total */}
            <div className="border-t border-slate-100 pt-3 flex items-baseline justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Due Today</span>
                <span className="text-[10px] text-slate-400">1st month rent + deposit</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-slate-950">
                  ₹{((currentMonthlyPrice * quantity) + (depositAmount * quantity)).toLocaleString('en-IN')}
                </span>
                {isZeroDeposit && (
                  <span className="block text-[10px] font-bold text-emerald-600">No deposit required</span>
                )}
              </div>
            </div>
          </div>

          {/* Quantity Stepper & Primary Actions */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {/* Stepper */}
              <div className="flex h-12 items-center rounded-xl border border-slate-200 bg-white px-1 shadow-xs">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 active:scale-95 transition"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-9 text-center text-xs font-bold text-slate-950">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 active:scale-95 transition"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Add to Cart */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-xs font-bold text-slate-800 shadow-xs hover:border-blue-600 hover:text-blue-600 active:scale-[0.99] transition-all duration-200"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Add to Cart</span>
              </button>

              {/* Rent Now */}
              <button
                type="button"
                onClick={handleRentNow}
                className="flex-1 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-xs font-bold text-white shadow-md shadow-blue-500/25 hover:bg-blue-700 active:scale-[0.99] transition-all duration-200"
              >
                <span>Rent Now</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Added Toast Notification */}
            {addedToast && (
              <div
                role="status"
                className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-center text-xs font-bold text-emerald-800 shadow-sm flex items-center justify-center gap-2"
              >
                <Check className="h-4 w-4 text-emerald-600" />
                <span>Added to your rental cart!</span>
                <Link to="/cart" className="underline hover:text-emerald-950 font-bold ml-1">
                  View Cart →
                </Link>
              </div>
            )}
          </div>

          {/* Available Near You / City Chips */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span>Available Near You</span>
              </span>
              <span className="text-[11px] font-semibold text-emerald-600">
                ⚡ 24–48h Delivery Hub
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {serviceCities.map((cityName) => {
                const isProductCity = (product.city || 'Bengaluru').toLowerCase() === cityName.toLowerCase();
                return (
                  <span
                    key={cityName}
                    className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                      isProductCity
                        ? 'bg-blue-50 text-blue-700 border border-blue-200 font-bold'
                        : 'bg-slate-50 text-slate-600 border border-slate-200/70'
                    }`}
                  >
                    {isProductCity && <Check className="h-3 w-3 text-blue-600" />}
                    <span>{cityName}</span>
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Structured Product Information Tabs Section */}
      <div className="rounded-3xl border border-slate-200/85 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        {/* Tabs Navigation */}
        <div className="flex border-b border-slate-200 overflow-x-auto gap-6 sm:gap-8">
          {[
            { id: 'overview', label: 'Overview & Highlights' },
            { id: 'specifications', label: 'Specifications' },
            { id: 'included', label: "What's Included" },
            { id: 'benefits', label: 'Rental Benefits & Policies' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6 text-xs sm:text-sm leading-relaxed text-slate-600">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Product Overview</h3>
              <p>{product.description}</p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 pt-2">
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4">
                <span className="text-xs font-bold text-slate-900 block mb-1">Pristine Hygiene</span>
                <p className="text-xs text-slate-500">
                  3-stage deep cleaning and antimicrobial sanitization before every dispatch.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4">
                <span className="text-xs font-bold text-slate-900 block mb-1">Zero Maintenance Costs</span>
                <p className="text-xs text-slate-500">
                  RentEase covers standard wear, tear, and periodic checkups at zero cost.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4">
                <span className="text-xs font-bold text-slate-900 block mb-1">Easy Upgrades</span>
                <p className="text-xs text-slate-500">
                  Switch or upgrade models anytime when renewing your rental tenure.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Specifications */}
        {activeTab === 'specifications' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Technical Specifications
            </h3>
            <div className="rounded-2xl border border-slate-200/80 overflow-hidden divide-y divide-slate-100 text-xs sm:text-sm">
              {product.specifications ? (
                Object.entries(product.specifications).map(([key, val]) => (
                  <div key={key} className="grid grid-cols-2 p-3.5 sm:px-6 hover:bg-slate-50/60 transition">
                    <span className="text-slate-500 font-medium">{key}</span>
                    <span className="text-slate-900 font-semibold text-right sm:text-left">{val}</span>
                  </div>
                ))
              ) : (
                <>
                  <div className="grid grid-cols-2 p-3.5 sm:px-6 hover:bg-slate-50/60 transition">
                    <span className="text-slate-500 font-medium">Category</span>
                    <span className="text-slate-900 font-semibold text-right sm:text-left">{product.category}</span>
                  </div>
                  <div className="grid grid-cols-2 p-3.5 sm:px-6 hover:bg-slate-50/60 transition">
                    <span className="text-slate-500 font-medium">Subcategory</span>
                    <span className="text-slate-900 font-semibold text-right sm:text-left">{product.subcategory || 'Standard'}</span>
                  </div>
                  <div className="grid grid-cols-2 p-3.5 sm:px-6 hover:bg-slate-50/60 transition">
                    <span className="text-slate-500 font-medium">Condition</span>
                    <span className="text-slate-900 font-semibold text-right sm:text-left">{product.condition || 'Brand New / Like New (Sanitized)'}</span>
                  </div>
                  <div className="grid grid-cols-2 p-3.5 sm:px-6 hover:bg-slate-50/60 transition">
                    <span className="text-slate-500 font-medium">Warranty</span>
                    <span className="text-slate-900 font-semibold text-right sm:text-left">{product.warranty || 'Included for rental duration'}</span>
                  </div>
                  <div className="grid grid-cols-2 p-3.5 sm:px-6 hover:bg-slate-50/60 transition">
                    <span className="text-slate-500 font-medium">Primary Hub</span>
                    <span className="text-slate-900 font-semibold text-right sm:text-left">{product.city || 'All Metro Hubs'}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: What's Included */}
        {activeTab === 'included' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Complimentary Inclusions with RentEase
            </h3>
            <div className="grid sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-700">
              <div className="flex items-start gap-3 rounded-2xl border border-slate-200/70 p-4 bg-slate-50/40">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-bold shrink-0">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <div>
                  <span className="font-bold text-slate-900 block">Tested & Certified Hardware</span>
                  <p className="text-slate-500 mt-0.5 text-xs">100% Genuine, verified, and high-durability unit.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-slate-200/70 p-4 bg-slate-50/40">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-bold shrink-0">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <div>
                  <span className="font-bold text-slate-900 block">Doorstep Assembly & Placement</span>
                  <p className="text-slate-500 mt-0.5 text-xs">Professional technician delivers and installs at your spot.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-slate-200/70 p-4 bg-slate-50/40">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-bold shrink-0">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <div>
                  <span className="font-bold text-slate-900 block">Annual Maintenance & Support</span>
                  <p className="text-slate-500 mt-0.5 text-xs">Zero-cost routine checkups and quick technician visits.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-slate-200/70 p-4 bg-slate-50/40">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-bold shrink-0">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <div>
                  <span className="font-bold text-slate-900 block">Free City Relocation</span>
                  <p className="text-slate-500 mt-0.5 text-xs">Moving homes? We move and reinstall your rentals for free.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Rental Benefits & Policies */}
        {activeTab === 'benefits' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              RentEase Rental Policies
            </h3>
            <div className="grid sm:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-600">
              <div className="rounded-2xl border border-slate-200 p-4 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Security Deposit Policy</span>
                </div>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Plans 6 months and longer qualify for 0₹ security deposit. For 1 and 3-month plans, deposits are 100% refunded to your bank account within 24 hours of return inspection.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Truck className="h-4 w-4 text-blue-600" />
                  <span>Delivery & Installation</span>
                </div>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Scheduled delivery within 48 hours across metro hubs. Our logistics team handles heavy lifting, unboxing, and testing before handoff.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Clock className="h-4 w-4 text-indigo-600" />
                  <span>Extension & Upgrades</span>
                </div>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Extend your tenure with one tap in your Customer Portal to unlock deeper monthly discounts. Upgrades between categories are supported anytime.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <RotateCcw className="h-4 w-4 text-purple-600" />
                  <span>Easy Return Guarantee</span>
                </div>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Done with your rental? Schedule a reverse pickup from your dashboard. We pick it up and inspect it at your convenience.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Related Products Shelf */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6 pt-4 border-t border-slate-200">
          <div className="flex items-baseline justify-between">
            <div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950">
                Similar rentals in {product.category}
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Curated items frequently rented together for balanced living spaces.
              </p>
            </div>
            <Link
              to={`/products?category=${encodeURIComponent(product.category)}`}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1"
            >
              <span>View all in {product.category}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

