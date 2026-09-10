import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Star,
  ArrowRight,
  Plus,
  Check,
  ShieldCheck,
} from 'lucide-react';

import Badge from './ui/Badge';
import Card from './ui/Card';
import ProductImage from './ProductImage';
import { useRental } from '../context/useRental';

export default function ProductCard({ product, compact = false }) {
  const { addToCart, isFavorite, toggleFavorite } = useRental();
  const favorite = isFavorite(product.id);
  const [added, setAdded] = useState(false);

  const discountPercent =
    product.originalPrice > product.monthlyPrice
      ? Math.round(((product.originalPrice - product.monthlyPrice) / product.originalPrice) * 100)
      : null;

  const depositAmount = product.deposit ?? product.securityDeposit ?? product.monthlyPrice ?? 1999;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 3, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  return (
    <Card
      hover
      padding="none"
      shadow="sm"
      className={`group relative flex flex-col overflow-hidden rounded-[22px] border border-slate-200/85 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-300/80 hover:shadow-xl hover:shadow-slate-900/6 ${
        compact ? '' : 'h-full'
      }`}
    >
      {/* 1. PRODUCT IMAGE CONTAINER */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 rounded-t-[21px]">
        <Link to={`/products/${product.id}`} tabIndex={-1} className="block h-full w-full">
          <ProductImage
            src={product.image}
            alt={`${product.name} rental`}
            className="h-full w-full"
            imageClassName="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        </Link>

        {/* Top Badges */}
        <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-1.5 z-10">
          {product.badge && (
            <Badge
              variant={product.badgeVariant || 'primary'}
              size="xs"
              className="shadow-2xs backdrop-blur-md bg-white/95 font-bold text-slate-900 border-white/80"
            >
              {product.badge}
            </Badge>
          )}
          {discountPercent && discountPercent > 0 && (
            <span className="inline-flex items-center rounded-full bg-emerald-600/95 px-2 py-0.5 text-[10px] font-bold text-white shadow-2xs backdrop-blur-md">
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
          className={`absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border shadow-sm backdrop-blur-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 active:scale-90 ${
            favorite
              ? 'border-rose-200 bg-rose-50 text-rose-600 scale-105 shadow-rose-200/50'
              : 'border-white/90 bg-white/85 text-slate-500 hover:border-slate-200 hover:bg-white hover:text-rose-500'
          }`}
        >
          <Heart
            className={`h-4 w-4 transition-transform duration-200 ${
              favorite ? 'fill-current scale-110' : ''
            }`}
          />
        </button>

        {/* City & Live Availability Indicator (Bottom overlay) */}
        <div className="pointer-events-none absolute bottom-2.5 left-3 right-3 flex items-center justify-between z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-950/80 px-2.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-md border border-white/15 shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {product.city}
          </span>
          <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-semibold text-slate-700 backdrop-blur-md shadow-2xs border border-slate-200/60">
            {product.availability || 'Available now'}
          </span>
        </div>
      </div>

      {/* 2. CARD INFORMATION - HIERARCHICAL STRUCTURE */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {/* Category & Subcategory Tag */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="inline-flex items-center rounded-md bg-blue-50/90 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-blue-700 border border-blue-200/60">
            {product.category}
          </span>
          {product.subcategory && (
            <span className="truncate text-[11px] font-medium text-slate-400">
              {product.subcategory}
            </span>
          )}
        </div>

        {/* Product Name */}
        <h3 className="mt-2.5 line-clamp-1 text-base font-bold text-slate-950 transition-colors group-hover:text-blue-600 sm:text-base">
          <Link to={`/products/${product.id}`} className="focus:outline-none focus:underline">
            {product.name}
          </Link>
        </h3>

        {/* Rating */}
        <div className="mt-1.5 flex items-center gap-1.5 text-xs">
          <div className="flex items-center gap-1 font-bold text-amber-600">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span>{typeof product.rating === 'number' ? product.rating.toFixed(1) : product.rating || '4.8'}</span>
          </div>
          <span className="text-slate-400">
            ({product.reviewCount || 48} reviews)
          </span>
        </div>

        {/* RENTAL PRICING - VISUAL ANCHOR */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-baseline justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black tracking-tight text-slate-950">
                ₹{product.monthlyPrice?.toLocaleString('en-IN')}
              </span>
              <span className="text-xs font-bold text-slate-500">/month</span>
            </div>
            {product.originalPrice > product.monthlyPrice && (
              <p className="text-[11px] font-medium text-slate-400 line-through">
                ₹{product.originalPrice?.toLocaleString('en-IN')}/month
              </p>
            )}
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Refundable deposit
            </span>
            <span className="text-xs font-bold text-slate-700">
              ₹{depositAmount.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Tenure Information */}
        <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
          <span className="font-medium text-slate-600">Plans from 1–12 months</span>
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
            <ShieldCheck className="h-3 w-3" />
            <span>Free delivery</span>
          </span>
        </div>

        {/* PRIMARY ACTION CTA */}
        <div className="mt-4 flex items-center gap-2">
          <Link
            to={`/products/${product.id}`}
            className="group/btn flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-950 px-3.5 py-2.5 text-xs font-bold text-white shadow-xs transition-all duration-200 hover:bg-blue-600 hover:shadow-md active:translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <span>View details</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
          </Link>
          <button
            type="button"
            onClick={handleQuickAdd}
            className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-bold shadow-2xs transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
              added
                ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                : 'border-slate-200/90 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50/60 hover:text-blue-700'
            }`}
            aria-label={`Add ${product.name} to cart`}
            title="Add to cart (3-month plan)"
          >
            {added ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-700">Added</span>
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" />
                <span>Rent</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Card>
  );
}
