import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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

  const favorite = product ? isFavorite(product.id) : false;

  if (!product) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Product Not Found</h2>
        <p className="mt-2 text-sm text-slate-600">The rental item you requested does not exist or has been moved.</p>
        <Link
          to="/products"
          className="mt-6 inline-flex items-center rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700"
        >
          Back to Explore
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

  const galleryImages = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];

  const handleAddToCart = () => {
    addToCart(product, selectedTenure, quantity);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  const handleRentNow = () => {
    addToCart(product, selectedTenure, quantity);
    navigate('/checkout');
  };

  const relatedProducts = PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 4);

  return (
    <div className="space-y-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-blue-600">Explore</Link>
        <span>/</span>
        <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-blue-600">
          {product.category}
        </Link>
        <span>/</span>
        <span className="truncate text-slate-900 font-semibold">{product.name || product.title}</span>
      </nav>

      {/* Main Product Showcase Grid */}
      <div className="grid gap-10 lg:grid-cols-12">
        {/* Left Column: Media Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xs">
            <ProductImage
              src={activeImage || product.image}
              alt={product.name || product.title}
              className="h-[380px] sm:h-[460px] w-full rounded-xl"
              imageClassName="object-cover h-full w-full"
              priority
            />
            {product.badge && (
              <div className="absolute top-4 left-4">
                <Badge variant={product.badgeVariant || 'primary'}>{product.badge}</Badge>
              </div>
            )}
          </div>

          {/* Thumbnail Strip */}
          {galleryImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImage(img)}
                  className={`relative h-20 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                    (activeImage || product.image) === img ? 'border-blue-600 ring-2 ring-blue-100' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Pricing & Configuration */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                {product.category} · {product.subcategory || 'Premium Rental'}
              </span>
              <button
                type="button"
                onClick={() => toggleFavorite(product.id)}
                className={`flex h-9 w-9 items-center justify-center rounded-xl border transition ${
                  favorite ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
                aria-label="Toggle wishlist"
              >
                <svg className="h-5 w-5" fill={favorite ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 leading-tight">
              {product.name || product.title}
            </h1>

            <div className="flex items-center gap-3 text-xs text-slate-600">
              <span className="flex items-center gap-1 font-bold text-amber-500">
                ★ {product.rating || 4.8}
              </span>
              <span>·</span>
              <span>{product.reviewCount || 48} verified ratings</span>
              <span>·</span>
              <span className="font-semibold text-emerald-600">In Stock ({product.city || 'Available'})</span>
            </div>

            <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">
              {product.description}
            </p>

            {/* Rental Tenure Selector */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Select Rental Tenure</span>
                {isZeroDeposit && (
                  <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                    🎉 0₹ Security Deposit
                  </span>
                )}
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[
                  { months: 1, discount: 'Standard' },
                  { months: 3, discount: 'Save 10%' },
                  { months: 6, discount: 'Save 20%' },
                  { months: 12, discount: 'Best Value' },
                ].map((item) => (
                  <button
                    key={item.months}
                    type="button"
                    onClick={() => setSelectedTenure(item.months)}
                    className={`flex flex-col items-center justify-center rounded-xl p-2.5 text-center transition ${
                      selectedTenure === item.months
                        ? 'border-2 border-blue-600 bg-blue-50/60 text-blue-900 font-bold'
                        : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 font-semibold'
                    }`}
                  >
                    <span className="text-sm">{item.months} mo</span>
                    <span className="text-[10px] text-slate-400 font-normal">{item.discount}</span>
                  </button>
                ))}
              </div>

              {/* Price Calculation Box */}
              <div className="mt-4 flex items-baseline justify-between border-t border-slate-100 pt-3">
                <div>
                  <span className="text-2xl font-black text-slate-950">₹{currentMonthlyPrice.toLocaleString()}</span>
                  <span className="text-xs text-slate-500"> / month</span>
                </div>
                <div className="text-right text-xs">
                  <p className="font-semibold text-slate-700">
                    Deposit: {isZeroDeposit ? <span className="text-emerald-600 font-bold">₹0</span> : `₹${depositAmount.toLocaleString()}`}
                  </p>
                  <p className="text-[10px] text-slate-400">100% refundable at end of tenure</p>
                </div>
              </div>
            </div>

            {/* Quantity Stepper & Actions */}
            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  -
                </button>
                <span className="w-8 text-center text-xs font-bold">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-xs font-bold text-slate-900 shadow-xs hover:border-blue-600 hover:text-blue-600 transition"
              >
                Add to Cart
              </button>

              <button
                type="button"
                onClick={handleRentNow}
                className="flex-1 inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-4 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition"
              >
                Rent Now
              </button>
            </div>

            {addedToast && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-center text-xs font-bold text-emerald-800 animate-fadeIn">
                ✓ Added to your rental cart! <Link to="/cart" className="underline ml-1">View Cart →</Link>
              </div>
            )}
          </div>

          {/* Value Props Strip */}
          <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-100 p-3 text-center text-[11px] font-medium text-slate-700">
            <div>🚚 Free 48h Delivery</div>
            <div>🛠️ Free Installation</div>
            <div>🛡️ Free Maintenance</div>
          </div>
        </div>
      </div>

      {/* Specifications & Inclusions */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Specifications */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4">Product Specifications</h3>
          <dl className="divide-y divide-slate-100 text-xs">
            {product.specifications ? (
              Object.entries(product.specifications).map(([key, val]) => (
                <div key={key} className="flex justify-between py-2.5">
                  <dt className="text-slate-500 font-medium">{key}</dt>
                  <dd className="text-slate-900 font-semibold">{val}</dd>
                </div>
              ))
            ) : (
              <>
                <div className="flex justify-between py-2.5">
                  <dt className="text-slate-500 font-medium">Condition</dt>
                  <dd className="text-slate-900 font-semibold">Brand New / Like New (Sanitized)</dd>
                </div>
                <div className="flex justify-between py-2.5">
                  <dt className="text-slate-500 font-medium">Warranty</dt>
                  <dd className="text-slate-900 font-semibold">Included for rental duration</dd>
                </div>
                <div className="flex justify-between py-2.5">
                  <dt className="text-slate-500 font-medium">City Availability</dt>
                  <dd className="text-slate-900 font-semibold">{product.city || 'All 12 Metro Hubs'}</dd>
                </div>
              </>
            )}
          </dl>
        </div>

        {/* What's Included */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4">What&apos;s Included with RentEase</h3>
          <ul className="space-y-3 text-xs text-slate-700">
            <li className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-bold">✓</span>
              <span>100% Genuine, tested, and high-durability unit</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-bold">✓</span>
              <span>Complimentary professional doorstep assembly</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-bold">✓</span>
              <span>Zero-cost annual maintenance & periodic checkups</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-bold">✓</span>
              <span>Free relocation if you move within the same city</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Related Products Shelf */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6 pt-6 border-t border-slate-200">
          <h3 className="text-xl font-black tracking-tight text-slate-950">Similar rentals in {product.category}</h3>
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
