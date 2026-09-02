import { Link } from 'react-router-dom';

import Badge from './ui/Badge';
import Card from './ui/Card';
import ProductImage from './ProductImage';
import { useRental } from '../context/useRental';

function HeartIcon({ filled }) {
  return (
    <svg
      className="h-4.5 w-4.5 transition-transform active:scale-125"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      aria-hidden="true"
    >
      <path
        d="M20.25 8.25c0 5.25-8.25 10-8.25 10s-8.25-4.75-8.25-10A4.5 4.5 0 0 1 12 5.7a4.5 4.5 0 0 1 8.25 2.55Z"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg className="h-3.5 w-3.5 fill-amber-400 text-amber-400" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg className="h-3.5 w-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4.167 10h11.666m0 0-4.166-4.167M15.833 10l-4.166 4.167" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 4.167v11.666M4.167 10h11.666" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ProductCard({ product, compact = false }) {
  const { addToCart, isFavorite, toggleFavorite } = useRental();
  const favorite = isFavorite(product.id);

  const discountPercent =
    product.originalPrice > product.monthlyPrice
      ? Math.round(((product.originalPrice - product.monthlyPrice) / product.originalPrice) * 100)
      : null;

  return (
    <Card
      hover
      padding="none"
      shadow="sm"
      className={`group relative flex flex-col overflow-hidden border border-slate-200/80 bg-white transition-all duration-300 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/70 ${
        compact ? '' : 'h-full'
      }`}
    >
      {/* Product Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <Link to={`/products/${product.id}`} tabIndex={-1} className="block h-full w-full">
          <ProductImage
            src={product.image}
            alt={`${product.name} rental`}
            className="h-full w-full"
            imageClassName="object-cover"
          />
        </Link>

        {/* Top Badges */}
        <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-1.5">
          {product.badge && (
            <Badge variant={product.badgeVariant || 'primary'} size="xs" className="shadow-xs backdrop-blur-xs">
              {product.badge}
            </Badge>
          )}
          {discountPercent && discountPercent > 0 && (
            <span className="inline-flex items-center rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(product.id);
          }}
          aria-label={`${favorite ? 'Remove' : 'Add'} ${product.name} ${favorite ? 'from' : 'to'} wishlist`}
          aria-pressed={favorite}
          className={`absolute right-3 top-3 flex h-8.5 w-8.5 items-center justify-center rounded-full border shadow-sm backdrop-blur-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
            favorite
              ? 'border-red-200 bg-red-50 text-red-600 scale-105'
              : 'border-white/80 bg-white/90 text-slate-500 hover:border-slate-200 hover:bg-white hover:text-red-500'
          }`}
        >
          <HeartIcon filled={favorite} />
        </button>

        {/* City & Live Availability Tag */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-950/75 px-2 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {product.city}
          </span>
          <span className="rounded-md bg-white/85 px-2 py-0.5 text-[10px] font-medium text-slate-700 backdrop-blur-sm">
            {product.availability}
          </span>
        </div>
      </div>

      {/* Product Information */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {/* Category & Rating */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="font-semibold uppercase tracking-wider text-blue-600 truncate">
            {product.category}
          </span>
          <span className="flex shrink-0 items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 font-semibold text-slate-800 border border-amber-200/60 text-[11px]">
            <StarIcon />
            {product.rating}
            <span className="font-normal text-slate-400">({product.reviewCount})</span>
          </span>
        </div>

        {/* Product Title */}
        <h3 className="mt-2 line-clamp-2 text-sm font-bold leading-snug text-slate-900 transition-colors group-hover:text-blue-600 sm:text-base">
          <Link to={`/products/${product.id}`} className="focus:outline-none focus:underline">
            {product.name}
          </Link>
        </h3>

        {/* Price & Deposit Section */}
        <div className="mt-auto pt-4 border-t border-slate-100 flex items-end justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-extrabold tracking-tight text-slate-950 sm:text-xl">
                ₹{product.monthlyPrice.toLocaleString('en-IN')}
              </span>
              <span className="text-xs font-medium text-slate-500">/mo</span>
            </div>
            {product.originalPrice > product.monthlyPrice && (
              <p className="text-[11px] text-slate-400 line-through">
                ₹{product.originalPrice.toLocaleString('en-IN')}/mo
              </p>
            )}
          </div>
          <div className="text-right">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">Deposit</span>
            <span className="text-xs font-semibold text-slate-700">₹{(product.deposit || product.monthlyPrice).toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex items-center gap-2 pt-1">
          <Link
            to={`/products/${product.id}`}
            className="group/btn flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white shadow-xs transition-all duration-200 hover:bg-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <span>View details</span>
            <ArrowRightIcon />
          </Link>
          <button
            type="button"
            onClick={() => addToCart(product.id, 3, 1)}
            className="inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 active:bg-blue-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            aria-label={`Add ${product.name} to cart`}
            title="Add to cart (3 month plan)"
          >
            <PlusIcon />
            <span>Add</span>
          </button>
        </div>
      </div>
    </Card>
  );
}
