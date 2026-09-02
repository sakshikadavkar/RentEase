import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

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
  { label: '4+ stars', value: '4' },
];
const CITY_FILTERS = ['all', ...new Set(PRODUCTS.map((product) => product.city))];
const AVAILABILITY_FILTERS = ['all', 'Available now', 'Available in 2 days', 'Limited availability'];

function SearchIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="10.75" cy="10.75" r="6.25" stroke="currentColor" strokeWidth="1.8" />
      <path d="m16 16 4.25 4.25" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M4 17h16M8 4v6m8 4v6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="8" cy="7" r="2" fill="white" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="16" cy="17" r="2" fill="white" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

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

function SelectFilter({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100">
        {options.map((option) => <option key={option.value || option} value={option.value || option}>{option.label || (option === 'all' ? `Any ${label.toLowerCase()}` : option)}</option>)}
      </select>
    </label>
  );
}

function FilterPanel({ filters, options, onChange, onReset }) {
  const { category, subcategory, price, rating, city, availability } = filters;
  return (
    <div className="space-y-7">
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-950">Category</h2>
          <span className="text-xs text-slate-400">Browse</span>
        </div>
        <div className="mt-3 space-y-1">
          {[{ label: 'All rentals', value: 'all' }, ...CATEGORIES.map(({ title }) => ({ label: title, value: title }))].map((item) => (
            <button key={item.value} type="button" onClick={() => onChange('category', item.value)} className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${categoryKey(category) === categoryKey(item.value) ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'}`}>
              {item.label}
              {categoryKey(category) === categoryKey(item.value) ? <span className="h-1.5 w-1.5 rounded-full bg-blue-600" /> : null}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-4 border-t border-slate-100 pt-6">
        <SelectFilter label="Subcategory" value={subcategory} onChange={(value) => onChange('subcategory', value)} options={[{ label: 'Any subcategory', value: 'all' }, ...options.subcategories.map((value) => ({ label: value, value }))]} />
        <SelectFilter label="City" value={city} onChange={(value) => onChange('city', value)} options={CITY_FILTERS.map((value) => ({ label: value === 'all' ? 'Any city' : value, value }))} />
        <SelectFilter label="Availability" value={availability} onChange={(value) => onChange('availability', value)} options={AVAILABILITY_FILTERS.map((value) => ({ label: value === 'all' ? 'Any availability' : value, value }))} />
      </div>
      <div className="border-t border-slate-100 pt-6">
        <h2 className="text-sm font-bold text-slate-950">Monthly price</h2>
        <div className="mt-3 space-y-1">
          {PRICE_FILTERS.map((item) => <label key={item.value} className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50"><input type="radio" name="price-filter" value={item.value} checked={price === item.value} onChange={() => onChange('price', item.value)} className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500" />{item.label}</label>)}
        </div>
      </div>
      <div className="border-t border-slate-100 pt-6">
        <h2 className="text-sm font-bold text-slate-950">Rating</h2>
        <div className="mt-3 space-y-1">
          {RATING_FILTERS.map((item) => <label key={item.value} className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50"><input type="radio" name="rating-filter" value={item.value} checked={rating === item.value} onChange={() => onChange('rating', item.value)} className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500" />{item.label}</label>)}
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={onReset} className="w-full">Reset filters</Button>
    </div>
  );
}

function CategoryLanding() {
  return (
    <div className="pb-10">
      <section className="border-b border-slate-200 pb-10">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">The RentEase edit</p>
        <div className="mt-4 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">Shop the rooms and routines you’re building.</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-500">Explore considered rentals by category, then filter the collection down to exactly what works for your space.</p>
          </div>
          <p className="text-sm font-semibold text-slate-500">903 pieces across India</p>
        </div>
      </section>
      <section className="mt-10" aria-labelledby="category-landing-heading">
        <div className="flex items-end justify-between gap-4">
          <div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Browse by need</p><h2 id="category-landing-heading" className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Shop by category</h2></div>
          <span className="hidden text-sm text-slate-500 sm:block">Every tile opens the filtered marketplace</span>
        </div>
        <div className="mt-7 grid auto-rows-[170px] grid-cols-2 gap-4 sm:auto-rows-[210px] sm:gap-5 lg:grid-cols-4">
          {CATEGORIES.map((category, index) => (
            <Link key={category.slug} to={`/products?category=${encodeURIComponent(category.title)}`} className={`group relative overflow-hidden rounded-[1.5rem] bg-slate-900 ${index < 2 ? 'lg:col-span-2 lg:row-span-2' : index < 4 ? 'lg:col-span-2' : ''}`}>
              <ProductImage src={category.image} alt={`${category.title} rentals`} className="absolute inset-0 h-full w-full" imageClassName="transition duration-500 group-hover:scale-[1.04]" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent transition duration-300 group-hover:from-slate-950/95" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 text-white transition duration-300 group-hover:-translate-y-1 sm:p-6">
                <div><h3 className="text-xl font-bold sm:text-2xl">{category.title}</h3><p className="mt-1 max-w-xs text-xs leading-5 text-slate-200 sm:text-sm">{category.description}</p></div>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/10 opacity-0 transition duration-300 group-hover:opacity-100"><span aria-hidden="true">→</span></span>
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
      return matchesCategory(product, filters.category)
        && (filters.subcategory === 'all' || product.subcategory === filters.subcategory)
        && matchesPrice(product.monthlyPrice, filters.price)
        && (filters.rating === 'all' || product.rating >= Number(filters.rating))
        && (filters.city === 'all' || product.city === filters.city)
        && (filters.availability === 'all' || product.availability === filters.availability)
        && (!query || searchable.includes(query));
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
  const filterKey = JSON.stringify({ filters, search, sortBy });
  const visibleCount = pagination.key === filterKey ? pagination.count : PAGE_SIZE;
  const shownProducts = filteredProducts.slice(0, visibleCount);
  const updateFilter = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value, ...(field === 'category' ? { subcategory: 'all' } : {}) }));
    if (field === 'category') {
      setSearchParams(value === 'all' ? {} : { category: value });
      setMobileFiltersOpen(false);
    }
  };
  const resetFilters = () => {
    setSearch('');
    setFilters({ category: 'all', subcategory: 'all', price: 'all', rating: 'all', city: 'all', availability: 'all' });
    setSortBy('recommended');
    setSearchParams({});
    setMobileFiltersOpen(false);
  };

  if (isCategoriesLanding) return <CategoryLanding />;

  return (
    <div className="pb-10">
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-12 text-white shadow-xl shadow-slate-200/70 sm:px-10 sm:py-16 lg:px-14">
        <div className="absolute -right-20 -top-28 h-80 w-80 rounded-full bg-blue-500/25 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="relative max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">The RentEase collection</p>
          <h1 className="mt-5 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">Find what you need. Rent what you love.</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">Explore 900+ thoughtfully selected rentals with flexible monthly plans that fit the way you live today.</p>
          <label className="mt-8 flex max-w-2xl items-center gap-3 rounded-2xl border border-white/10 bg-white px-4 py-2 text-slate-950 shadow-2xl shadow-slate-950/30 focus-within:ring-4 focus-within:ring-blue-300/30">
            <SearchIcon />
            <span className="sr-only">Search rentals</span>
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search sofas, fridges, laptops..." className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-slate-400 sm:text-base" />
            {search ? <button type="button" onClick={() => setSearch('')} className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100">Clear</button> : null}
          </label>
        </div>
      </section>

      <section className="mt-10">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Curated for you</p><h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Shop by category</h2></div><p className="max-w-md text-sm leading-6 text-slate-500">Jump straight into a room, appliance, or device and discover a broader collection.</p></div>
        <div className="mt-5 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none]">{[{ label: 'All rentals', value: 'all' }, ...CATEGORIES.map(({ title }) => ({ label: title, value: title }))].map((category) => <button key={category.value} type="button" onClick={() => updateFilter('category', category.value)} className={`shrink-0 rounded-full border px-4 py-2.5 text-sm font-semibold transition ${categoryKey(filters.category) === categoryKey(category.value) ? 'border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700'}`} aria-pressed={categoryKey(filters.category) === categoryKey(category.value)}>{category.label}</button>)}</div>
      </section>

      <section className="mt-7">
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div><h2 className="text-lg font-bold text-slate-950">{filteredProducts.length} {filteredProducts.length === 1 ? 'rental' : 'rentals'} to explore</h2><p className="mt-1 text-sm text-slate-500">Flexible plans, transparent pricing, and delivery across India.</p></div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => setMobileFiltersOpen(true)} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700 lg:hidden"><FilterIcon />Filters</button>
            <label className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600"><span className="sr-only">Sort rentals</span><select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="bg-transparent font-medium outline-none"><option value="recommended">Recommended</option><option value="price-low">Price: Low to High</option><option value="price-high">Price: High to Low</option><option value="rating">Top rated</option><option value="newest">Newest</option><option value="popular">Most popular</option></select></label>
            {hasFilters ? <Button variant="ghost" size="sm" onClick={resetFilters}>Reset filters</Button> : null}
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="hidden lg:block"><Card padding="md" shadow="sm" className="sticky top-24"><FilterPanel filters={filters} options={{ subcategories }} onChange={updateFilter} onReset={resetFilters} /></Card></aside>
          <div>
            {shownProducts.length ? <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{shownProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <Card className="border-dashed py-16 text-center" shadow="sm"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><SearchIcon /></div><h3 className="mt-5 text-xl font-bold text-slate-950">No rentals match those filters</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Try a different search or broaden your filters to see more of the RentEase collection.</p><Button variant="outline" className="mt-6" onClick={resetFilters}>Reset all filters</Button></Card>}
            {shownProducts.length < filteredProducts.length ? <div className="mt-8 text-center"><Button variant="outline" onClick={() => setPagination({ key: filterKey, count: visibleCount + PAGE_SIZE })}>Load more rentals <span className="ml-1 text-slate-400">({filteredProducts.length - shownProducts.length} left)</span></Button></div> : null}
          </div>
        </div>
      </section>

      {mobileFiltersOpen ? <div className="fixed inset-0 z-[60] flex items-end bg-slate-950/40 p-0 backdrop-blur-sm lg:hidden" role="presentation" onClick={() => setMobileFiltersOpen(false)}><div role="dialog" aria-modal="true" aria-labelledby="mobile-filter-heading" onClick={(event) => event.stopPropagation()} className="max-h-[85vh] w-full overflow-y-auto rounded-t-[2rem] bg-white p-6 shadow-2xl"><div className="mb-6 flex items-center justify-between"><h2 id="mobile-filter-heading" className="text-xl font-bold text-slate-950">Filter rentals</h2><button type="button" onClick={() => setMobileFiltersOpen(false)} className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-600">Close</button></div><FilterPanel filters={filters} options={{ subcategories }} onChange={updateFilter} onReset={resetFilters} /></div></div> : null}
    </div>
  );
}