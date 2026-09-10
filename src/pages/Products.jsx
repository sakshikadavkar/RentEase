import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  Layers,
  Armchair,
  Tv,
  Laptop,
  Briefcase,
  Bed,
  Home as HomeIcon,
  Utensils,
  GraduationCap,
  X,
  ChevronDown,
  Star,
  MapPin,
  Clock,
  ArrowRight,
} from 'lucide-react';

import ProductCard from '../components/ProductCard';
import ProductImage from '../components/ProductImage';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { CATEGORIES, PRODUCTS } from '../constants/theme';

const PAGE_SIZE = 24;
const PRICE_FILTERS = [
  { label: 'Any monthly price', value: 'all' },
  { label: 'Under ₹750', value: 'under-750' },
  { label: '₹750 – ₹1,499', value: '750-1499' },
  { label: '₹1,500 – ₹2,499', value: '1500-2499' },
  { label: '₹2,500 and above', value: '2500-plus' },
];
const RATING_FILTERS = [
  { label: 'Any rating', value: 'all' },
  { label: '4.5+ stars', value: '4.5' },
  { label: '4.0+ stars', value: '4' },
];
const CITY_FILTERS = ['all', ...new Set(PRODUCTS.map((product) => product.city))];
const AVAILABILITY_FILTERS = ['all', 'Available now', 'Available in 2 days', 'Limited availability'];

const CATEGORY_ITEMS = [
  { label: 'All rentals', value: 'all', icon: Layers },
  { label: 'Furniture', value: 'Furniture', icon: Armchair },
  { label: 'Appliances', value: 'Appliances', icon: Tv },
  { label: 'Electronics', value: 'Electronics', icon: Laptop },
  { label: 'Office', value: 'Office', icon: Briefcase },
  { label: 'Bedroom', value: 'Bedroom', icon: Bed },
  { label: 'Living Room', value: 'Living Room', icon: HomeIcon },
  { label: 'Kitchen', value: 'Kitchen', icon: Utensils },
  { label: 'Study / WFH', value: 'Study / Work From Home', icon: GraduationCap },
];

function categoryKey(value) {
  return decodeURIComponent(String(value)).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function matchesCategory(product, category) {
  if (category === 'all') return true;
  return categoryKey(product.category) === categoryKey(category);
}

function matchesPrice(price, filter) {
  if (filter === 'all') return true;
  if (filter === 'under-750') return price < 750;
  if (filter === '750-1499') return price >= 750 && price < 1500;
  if (filter === '1500-2499') return price >= 1500 && price < 2500;
  return price >= 2500;
}

function SelectFilter({ label, value, onChange, options, icon: Icon }) {
  return (
    <label className="block">
      <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
        {Icon && <Icon className="h-3.5 w-3.5 text-slate-400" />}
        {label}
      </span>
      <div className="relative mt-2">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="block w-full appearance-none rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 pr-8 text-xs sm:text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        >
          {options.map((option) => (
            <option key={option.value || option} value={option.value || option}>
              {option.label || (option === 'all' ? `Any ${label.toLowerCase()}` : option)}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
    </label>
  );
}

function FilterPanel({ filters, options, onChange, onReset }) {
  const { category, subcategory, price, rating, city, availability } = filters;

  return (
    <div className="space-y-6">
      {/* Category List */}
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Category</h3>
          <span className="text-[11px] font-medium text-slate-400">9 Categories</span>
        </div>
        <div className="mt-2.5 space-y-1">
          {CATEGORY_ITEMS.map((item) => {
            const isSelected = categoryKey(category) === categoryKey(item.value);
            const Icon = item.icon;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => onChange('category', item.value)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs sm:text-sm font-semibold transition ${
                  isSelected
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Subcategory */}
      {options.subcategories && options.subcategories.length > 0 && (
        <div className="border-t border-slate-100 pt-5">
          <SelectFilter
            label="Subcategory"
            value={subcategory}
            onChange={(value) => onChange('subcategory', value)}
            options={[{ label: 'All subcategories', value: 'all' }, ...options.subcategories.map((value) => ({ label: value, value }))]}
          />
        </div>
      )}

      {/* City & Availability */}
      <div className="space-y-4 border-t border-slate-100 pt-5">
        <SelectFilter
          label="City"
          icon={MapPin}
          value={city}
          onChange={(value) => onChange('city', value)}
          options={CITY_FILTERS.map((value) => ({ label: value === 'all' ? 'All 12 cities' : value, value }))}
        />
        <SelectFilter
          label="Availability"
          icon={Clock}
          value={availability}
          onChange={(value) => onChange('availability', value)}
          options={AVAILABILITY_FILTERS.map((value) => ({ label: value === 'all' ? 'Any availability' : value, value }))}
        />
      </div>

      {/* Monthly Price Radios */}
      <div className="border-t border-slate-100 pt-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Monthly price</h3>
        <div className="mt-2.5 space-y-1">
          {PRICE_FILTERS.map((item) => (
            <label
              key={item.value}
              className={`flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-xs sm:text-sm transition ${
                price === item.value
                  ? 'bg-blue-50/70 text-blue-700 font-bold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="radio"
                  name="price-filter"
                  value={item.value}
                  checked={price === item.value}
                  onChange={() => onChange('price', item.value)}
                  className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>{item.label}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Rating Radios */}
      <div className="border-t border-slate-100 pt-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Customer rating</h3>
        <div className="mt-2.5 space-y-1">
          {RATING_FILTERS.map((item) => (
            <label
              key={item.value}
              className={`flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-xs sm:text-sm transition ${
                rating === item.value
                  ? 'bg-blue-50/70 text-blue-700 font-bold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="radio"
                  name="rating-filter"
                  value={item.value}
                  checked={rating === item.value}
                  onChange={() => onChange('rating', item.value)}
                  className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>{item.label}</span>
              </div>
              {item.value !== 'all' && (
                <span className="flex items-center text-amber-500 text-xs font-bold">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 mr-0.5" />
                  {item.value}
                </span>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Reset Filter Button */}
      <Button variant="outline" size="sm" onClick={onReset} className="w-full gap-1.5 font-bold">
        <RotateCcw className="h-3.5 w-3.5" />
        <span>Reset all filters</span>
      </Button>
    </div>
  );
}

function CategoryLanding() {
  return (
    <div className="pb-16 space-y-10">
      <section className="relative overflow-hidden rounded-[2.5rem] border border-slate-200/90 bg-[#faf9f6] bg-gradient-to-br from-[#faf9f6] via-[#f8f9fe] to-[#f5f4fc] p-6 sm:p-8 md:p-10 lg:p-12 shadow-sm">
        <div className="pointer-events-none absolute -top-24 -left-24 h-[420px] w-[420px] rounded-full bg-blue-300/15 blur-[85px]" />
        <div className="pointer-events-none absolute top-1/4 -right-20 h-[450px] w-[450px] rounded-full bg-indigo-300/15 blur-[95px]" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-white/90 px-3.5 py-1 text-xs font-bold text-blue-700 shadow-2xs backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>The RentEase Edit • {PRODUCTS.length} curated pieces</span>
          </div>

          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl leading-[1.12]">
            Shop the rooms and routines you’re building.
          </h1>

          <p className="mt-3.5 max-w-2xl text-sm sm:text-base leading-relaxed text-slate-600">
            Explore curated rentals by room category, with maintenance coverage, free 48-hour delivery, and zero commitment.
          </p>

          <div className="mt-6 flex items-center gap-3">
            <Link
              to="/products"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-950 px-5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-blue-600 transition-colors"
            >
              <span>Browse all {PRODUCTS.length} products</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="category-landing-heading">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">Browse by need</p>
            <h2 id="category-landing-heading" className="mt-1 text-2xl font-black tracking-tight text-slate-950">
              Curated room collections
            </h2>
          </div>
          <span className="hidden text-xs font-semibold text-slate-400 sm:block">
            Every collection opens the filtered catalog
          </span>
        </div>

        <div className="mt-6 grid auto-rows-[180px] grid-cols-2 gap-4 sm:auto-rows-[220px] sm:gap-5 lg:grid-cols-4">
          {CATEGORIES.map((category, index) => (
            <Link
              key={category.slug}
              to={`/products?category=${encodeURIComponent(category.title)}`}
              className={`group relative overflow-hidden rounded-[24px] border border-slate-200/80 bg-slate-900 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10 ${
                index < 2 ? 'lg:col-span-2 lg:row-span-2' : index < 4 ? 'lg:col-span-2' : ''
              }`}
            >
              <ProductImage
                src={category.image}
                alt={`${category.title} rentals`}
                className="absolute inset-0 h-full w-full"
                imageClassName="transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-transparent transition duration-300 group-hover:from-slate-950/95" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 text-white transition duration-300 group-hover:-translate-y-1 sm:p-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 block mb-1">
                    {category.count || '100+ rentals'}
                  </span>
                  <h3 className="text-lg font-black sm:text-2xl">{category.title}</h3>
                  <p className="mt-1 max-w-xs text-xs leading-relaxed text-slate-200 sm:text-sm">
                    {category.description}
                  </p>
                </div>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/10 opacity-80 transition duration-300 group-hover:opacity-100 group-hover:bg-blue-600 group-hover:border-blue-600">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get('q') || '');
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || 'all',
    subcategory: 'all',
    price: 'all',
    rating: 'all',
    city: searchParams.get('city') || 'all',
    availability: 'all',
  });
  const [sortBy, setSortBy] = useState('recommended');
  const [pagination, setPagination] = useState({ key: '', count: PAGE_SIZE });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const isCategoriesLanding = searchParams.get('tab') === 'categories';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [searchParams]);

  const subcategories = useMemo(() => {
    const categoryProducts = PRODUCTS.filter((product) => matchesCategory(product, filters.category));
    return [...new Set(categoryProducts.map((product) => product.subcategory))].sort();
  }, [filters.category]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = PRODUCTS.filter((product) => {
      const searchable = `${product.name} ${product.category} ${product.subcategory} ${product.city} ${product.description}`.toLowerCase();
      return (
        matchesCategory(product, filters.category) &&
        (filters.subcategory === 'all' || product.subcategory === filters.subcategory) &&
        matchesPrice(product.monthlyPrice, filters.price) &&
        (filters.rating === 'all' || product.rating >= Number(filters.rating)) &&
        (filters.city === 'all' || product.city === filters.city) &&
        (filters.availability === 'all' || product.availability === filters.availability) &&
        (!query || searchable.includes(query))
      );
    });

    return [...filtered].sort((first, second) => {
      if (sortBy === 'price-low') return first.monthlyPrice - second.monthlyPrice;
      if (sortBy === 'price-high') return second.monthlyPrice - first.monthlyPrice;
      if (sortBy === 'rating') return second.rating - first.rating;
      if (sortBy === 'newest') return (second.newestRank ?? 0) - (first.newestRank ?? 0);
      if (sortBy === 'popular') return second.reviewCount - first.reviewCount;
      return PRODUCTS.indexOf(first) - PRODUCTS.indexOf(second);
    });
  }, [filters, search, sortBy]);

  const hasFilters = Boolean(search.trim() || Object.values(filters).some((value) => value !== 'all'));
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (search.trim()) count++;
    if (filters.category !== 'all') count++;
    if (filters.subcategory !== 'all') count++;
    if (filters.price !== 'all') count++;
    if (filters.rating !== 'all') count++;
    if (filters.city !== 'all') count++;
    if (filters.availability !== 'all') count++;
    return count;
  }, [filters, search]);

  const filterKey = JSON.stringify({ filters, search, sortBy });
  const visibleCount = pagination.key === filterKey ? pagination.count : PAGE_SIZE;
  const shownProducts = filteredProducts.slice(0, visibleCount);

  const updateFilter = (field, value) => {
    setFilters((current) => ({
      ...current,
      [field]: value,
      ...(field === 'category' ? { subcategory: 'all' } : {}),
    }));
    if (field === 'category') {
      setSearchParams(value === 'all' ? {} : { category: value });
      setMobileFiltersOpen(false);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setFilters({
      category: 'all',
      subcategory: 'all',
      price: 'all',
      rating: 'all',
      city: 'all',
      availability: 'all',
    });
    setSortBy('recommended');
    setSearchParams({});
    setMobileFiltersOpen(false);
  };

  if (isCategoriesLanding) return <CategoryLanding />;

  return (
    <div className="pb-16 space-y-8 sm:space-y-10">
      {/* 1. PREMIUM CATALOG HEADER */}
      <section className="relative overflow-hidden rounded-[2.5rem] border border-slate-200/90 bg-[#faf9f6] bg-gradient-to-br from-[#faf9f6] via-[#f8f9fe] to-[#f5f4fc] p-6 sm:p-8 md:p-10 lg:p-12 shadow-sm">
        {/* Layered subtle radial gradient lights (soft blue, indigo, lavender - no neon) */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-[420px] w-[420px] rounded-full bg-blue-300/15 blur-[85px]" />
        <div className="pointer-events-none absolute top-1/4 -right-20 h-[450px] w-[450px] rounded-full bg-indigo-300/15 blur-[95px]" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-[380px] w-[380px] rounded-full bg-purple-200/15 blur-[85px]" />

        <div className="relative z-10 max-w-3xl">
          {/* Small real-data indicator */}
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-white/90 px-3.5 py-1 text-xs font-bold text-blue-700 shadow-2xs backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>{PRODUCTS.length}+ curated products</span>
          </div>

          {/* Title */}
          <h1 className="mt-3.5 sm:mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl leading-[1.12]">
            Explore Rentals
          </h1>

          {/* Supporting text */}
          <p className="mt-3 max-w-xl text-sm sm:text-base leading-relaxed text-slate-600">
            Furniture, appliances and electronics for flexible monthly living.
          </p>

          {/* Large Premium Search Field */}
          <div className="mt-6 sm:mt-7 relative max-w-2xl">
            <div className="relative flex items-center rounded-2xl border border-slate-200/90 bg-white/95 p-1.5 shadow-sm shadow-slate-900/5 backdrop-blur-sm transition-all focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100">
              <div className="flex items-center pl-3.5 text-slate-400">
                <Search className="h-5 w-5" />
              </div>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search sofas, beds, refrigerators, workstations..."
                className="w-full bg-transparent px-3 py-2 text-sm sm:text-base font-medium text-slate-900 placeholder:text-slate-400 outline-none"
              />
              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="mr-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100 active:scale-95"
                >
                  Clear
                </button>
              ) : null}
              <button
                type="button"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-blue-600"
              >
                <span>Search</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY DISCOVERY - HORIZONTAL ICON CHIP SECTION */}
      <section>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">Browse by need</p>
            <h2 className="mt-1 text-xl sm:text-2xl font-black tracking-tight text-slate-950">
              Shop by category
            </h2>
          </div>
          {filters.category !== 'all' && (
            <button
              type="button"
              onClick={() => updateFilter('category', 'all')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              View all categories
            </button>
          )}
        </div>

        {/* Horizontal category scroll chip section with icons */}
        <div className="mt-4 flex gap-2.5 overflow-x-auto pb-2 pt-1 [scrollbar-width:none] -mx-1 px-1">
          {CATEGORY_ITEMS.map((item) => {
            const Icon = item.icon;
            const isSelected = categoryKey(filters.category) === categoryKey(item.value);
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => updateFilter('category', item.value)}
                className={`group flex shrink-0 items-center gap-2 rounded-2xl border px-4 py-2.5 text-xs sm:text-sm font-bold transition-all duration-200 active:scale-95 ${
                  isSelected
                    ? 'border-slate-950 bg-slate-950 text-white shadow-md shadow-slate-950/15'
                    : 'border-slate-200/85 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50/60 hover:text-blue-700 shadow-2xs'
                }`}
                aria-pressed={isSelected}
              >
                <Icon
                  className={`h-4 w-4 transition-transform duration-200 group-hover:scale-110 ${
                    isSelected ? 'text-blue-300' : 'text-slate-400 group-hover:text-blue-600'
                  }`}
                />
                <span>{item.label}</span>
                {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />}
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. PRODUCT RESULT HEADER & ACTIVE FILTERS */}
      <section className="space-y-4">
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'rental' : 'rentals'}
              </h2>
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 border border-blue-100">
                {filters.category === 'all' ? 'All categories' : filters.category}
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              {filters.city !== 'all' ? `Filtered for ${filters.city} • ` : 'Available across 12 cities • '}
              Verified quality with free 48h doorstep delivery
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Mobile filter button */}
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-slate-200/90 bg-slate-50 px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-700 transition-colors hover:border-blue-300 hover:bg-white hover:text-blue-700 lg:hidden shadow-2xs"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Sort dropdown */}
            <label className="flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 shadow-2xs transition-colors hover:border-blue-300">
              <span className="text-slate-400 text-xs hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="bg-transparent font-bold text-slate-900 outline-none cursor-pointer pr-1"
              >
                <option value="recommended">Recommended</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top rated</option>
                <option value="newest">Newest</option>
                <option value="popular">Most popular</option>
              </select>
            </label>

            {hasFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Filter Dismissible Pills */}
        {hasFilters && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-xs font-bold text-slate-400 mr-1">Active filters:</span>
            {search.trim() && (
              <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                Search: "{search}"
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="hover:text-blue-950"
                  aria-label="Clear search"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.category !== 'all' && (
              <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                Category: {filters.category}
                <button
                  type="button"
                  onClick={() => updateFilter('category', 'all')}
                  className="hover:text-blue-950"
                  aria-label="Clear category filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.subcategory !== 'all' && (
              <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                Subcategory: {filters.subcategory}
                <button
                  type="button"
                  onClick={() => updateFilter('subcategory', 'all')}
                  className="hover:text-blue-950"
                  aria-label="Clear subcategory filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.city !== 'all' && (
              <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                City: {filters.city}
                <button
                  type="button"
                  onClick={() => updateFilter('city', 'all')}
                  className="hover:text-blue-950"
                  aria-label="Clear city filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.price !== 'all' && (
              <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                Price: {PRICE_FILTERS.find((p) => p.value === filters.price)?.label}
                <button
                  type="button"
                  onClick={() => updateFilter('price', 'all')}
                  className="hover:text-blue-950"
                  aria-label="Clear price filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.rating !== 'all' && (
              <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                Rating: {filters.rating}★+
                <button
                  type="button"
                  onClick={() => updateFilter('rating', 'all')}
                  className="hover:text-blue-950"
                  aria-label="Clear rating filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.availability !== 'all' && (
              <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                Availability: {filters.availability}
                <button
                  type="button"
                  onClick={() => updateFilter('availability', 'all')}
                  className="hover:text-blue-950"
                  aria-label="Clear availability filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 underline ml-1"
            >
              Clear all
            </button>
          </div>
        )}

        {/* 4. MAIN LAYOUT: SIDEBAR FILTER + PRODUCT GRID */}
        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)]">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block">
            <Card
              padding="md"
              shadow="sm"
              className="sticky top-24 rounded-[22px] border-slate-200/90 bg-white"
            >
              <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 font-bold text-slate-950">
                  <SlidersHorizontal className="h-4 w-4 text-blue-600" />
                  <span>Refine Catalog</span>
                </div>
                {activeFilterCount > 0 && (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-700">
                    {activeFilterCount} active
                  </span>
                )}
              </div>
              <FilterPanel
                filters={filters}
                options={{ subcategories }}
                onChange={updateFilter}
                onReset={resetFilters}
              />
            </Card>
          </aside>

          {/* Product Cards Grid & Large Catalog Pagination */}
          <div className="space-y-8">
            {shownProducts.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {shownProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <Card className="border-dashed py-16 text-center rounded-[24px]" shadow="sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Search className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-xl font-bold text-slate-950">
                  No rentals match those filters
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
                  Try adjusting your price range, searching with fewer terms, or clearing some filters to explore more of our {PRODUCTS.length} curated products.
                </p>
                <Button variant="outline" className="mt-6 font-bold" onClick={resetFilters}>
                  <RotateCcw className="h-4 w-4 mr-1.5" />
                  Reset all filters
                </Button>
              </Card>
            )}

            {/* Pagination & Catalog Progress Bar */}
            {filteredProducts.length > 0 && (
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 text-center shadow-xs space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>
                    Showing <strong className="text-slate-950">{shownProducts.length}</strong> of{' '}
                    <strong className="text-slate-950">{filteredProducts.length}</strong> rentals
                  </span>
                  <span>{Math.round((shownProducts.length / filteredProducts.length) * 100)}% viewed</span>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300"
                    style={{
                      width: `${Math.min(100, Math.round((shownProducts.length / filteredProducts.length) * 100))}%`,
                    }}
                  />
                </div>

                {shownProducts.length < filteredProducts.length ? (
                  <div className="pt-2 flex items-center justify-center gap-3">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setPagination({ key: filterKey, count: visibleCount + PAGE_SIZE })
                      }
                      className="gap-2 font-bold hover:border-blue-400 hover:bg-blue-50/60"
                    >
                      <span>Load more rentals</span>
                      <span className="text-xs font-semibold text-slate-400">
                        ({filteredProducts.length - shownProducts.length} remaining)
                      </span>
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs font-medium text-slate-400 pt-1">
                    You've reached the end of the filtered collection.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. MOBILE FILTER DRAWER */}
      {mobileFiltersOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-end bg-slate-950/40 p-0 backdrop-blur-sm lg:hidden"
          role="presentation"
          onClick={() => setMobileFiltersOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-filter-heading"
            onClick={(event) => event.stopPropagation()}
            className="max-h-[85vh] w-full overflow-y-auto rounded-t-[2rem] bg-white p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-blue-600" />
                <h2 id="mobile-filter-heading" className="text-lg font-bold text-slate-950">
                  Filter Rentals ({filteredProducts.length})
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
                aria-label="Close filters"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <FilterPanel
              filters={filters}
              options={{ subcategories }}
              onChange={updateFilter}
              onReset={resetFilters}
            />

            <div className="mt-6 pt-4 border-t border-slate-100">
              <Button
                variant="primary"
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full font-bold h-11"
              >
                View {filteredProducts.length} rentals
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}