import { Fragment, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import ProductCard from '../components/ProductCard';
import ProductImage from '../components/ProductImage';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { CATEGORIES, HERO_IMAGE, PRODUCTS } from '../constants/theme';

const benefits = [
  {
    title: 'Flexible monthly plans',
    description: 'Choose 1 to 12 months with easy month-to-month extensions or early upgrades.',
    tag: 'Flexibility',
  },
  {
    title: 'Free 48h delivery & setup',
    description: 'Our white-glove delivery crew unpacks, installs, and tests every piece in your home.',
    tag: 'Convenience',
  },
  {
    title: '100% Maintenance covered',
    description: 'Periodic servicing, appliance tune-ups, and repairs are included at zero extra cost.',
    tag: 'Worry-free',
  },
  {
    title: 'No ownership commitment',
    description: 'Moving cities or redecorating? Swap or return your items whenever your life changes.',
    tag: 'Freedom',
  },
  {
    title: 'Sanitized & verified quality',
    description: 'Each item passes a rigorous 20-point quality check and steam cleaning before delivery.',
    tag: 'Pristine',
  },
  {
    title: 'Zero-hassle returns & refund',
    description: 'Prompt security deposit refund directly to your bank account within 3 working days.',
    tag: 'Transparent',
  },
];

const steps = [
  {
    number: '01',
    title: 'Choose what you need',
    description: 'Browse 900+ curated furniture, appliances, and electronics for living rooms, bedrooms, or home offices.',
  },
  {
    number: '02',
    title: 'Pick your tenure',
    description: 'Select a 1, 3, 6, or 12-month tenure with deeper monthly discounts on longer flexible plans.',
  },
  {
    number: '03',
    title: 'Free doorstep setup',
    description: 'Our trained technicians deliver and assemble everything at your requested time slot for free.',
  },
  {
    number: '04',
    title: 'Swap, renew or return',
    description: 'Keep your favorites, upgrade to newer models, or schedule a free pickup when you move.',
  },
];

const testimonials = [
  {
    name: 'Ananya Mehta',
    city: 'Bengaluru',
    role: 'Product Designer',
    quote: 'RentEase made furnishing my 2BHK in Indiranagar completely effortless. The sofa and dining set arrived spotless, and the assembly team was in and out in 20 minutes.',
  },
  {
    name: 'Rohan Kapoor',
    city: 'Mumbai',
    role: 'Software Engineer',
    quote: 'I needed an ergonomic workstation and a refrigerator for a 9-month project in Powai. The flexibility is unbeatable, and the zero-deposit plan saved me upfront cash.',
  },
  {
    name: 'Priya Nair',
    city: 'Hyderabad',
    role: 'Marketing Lead',
    quote: 'Knowing full maintenance is included gave me complete peace of mind. When my washing machine needed a filter check, RentEase sent someone over the very next morning.',
  },
];

const QUICK_TRENDING_SEARCHES = [
  'Ergonomic Chairs',
  'Double Door Fridge',
  'King Size Beds',
  '3-BHK Package',
  'Smart TV 55"',
  'Modern Sofa Set',
];

const HOME_COLLECTION_DEFINITIONS = [
  {
    title: 'Trending Now',
    eyebrow: 'Most Popular Rentals',
    description: 'The pieces getting saved, shared, and ordered most this week across India.',
    filter: () => true,
    sort: (a, b) => b.reviewCount - a.reviewCount,
  },
  {
    title: 'Popular Furniture',
    eyebrow: 'Living & Comfort',
    description: 'Sofas, accent chairs, dining tables, and storage that make your space feel complete.',
    category: 'Furniture',
    filter: (product) => product.category === 'Furniture',
    sort: (a, b) => b.reviewCount - a.reviewCount,
  },
  {
    title: 'Appliances People Love',
    eyebrow: 'Kitchen & Utility',
    description: 'Reliable refrigerators, washing machines, microwaves, and air conditioners with free maintenance.',
    category: 'Appliances',
    filter: (product) => product.category === 'Appliances',
    sort: (a, b) => b.rating - a.rating,
  },
  {
    title: 'Electronics Picks',
    eyebrow: 'Tech & Entertainment',
    description: 'High-definition 4K smart TVs, monitors, soundbars, and connectivity essentials.',
    category: 'Electronics',
    filter: (product) => product.category === 'Electronics',
    sort: (a, b) => b.reviewCount - a.reviewCount,
  },
  {
    title: 'Bedroom Essentials',
    eyebrow: 'Rest & Recharge',
    description: 'Solid wood beds, premium orthopaedic mattresses, wardrobes, and bedside tables.',
    category: 'Bedroom',
    filter: (product) => product.category === 'Bedroom',
    sort: (a, b) => b.rating - a.rating,
  },
  {
    title: 'Work From Home',
    eyebrow: 'Productivity & Focus',
    description: 'Ergonomic mesh chairs, motorized standing desks, and dual-monitor home office setups.',
    filter: (product) => ['Office', 'Study / Work From Home'].includes(product.category),
    sort: (a, b) => b.reviewCount - a.reviewCount,
  },
  {
    title: 'Best Rated',
    eyebrow: '5-Star Approved',
    description: 'Highest-reviewed rentals with verified customer ratings above 4.7 stars.',
    filter: () => true,
    sort: (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
  },
  {
    title: 'Kitchen Essentials',
    eyebrow: 'Cooking & Dining',
    description: 'Induction cooktops, smart microwaves, water purifiers, and dining sets for everyday rituals.',
    category: 'Kitchen',
    filter: (product) => product.category === 'Kitchen',
    sort: (a, b) => b.reviewCount - a.reviewCount,
  },
  {
    title: 'Living Room',
    eyebrow: 'Gather & Relax',
    description: 'Plush L-shaped sectionals, coffee tables, entertainment consoles, and floor lamps.',
    category: 'Living Room',
    filter: (product) => product.category === 'Living Room',
    sort: (a, b) => b.rating - a.rating,
  },
  {
    title: 'Recently Added',
    eyebrow: 'Fresh Arrivals',
    description: 'Newest additions to our 900+ curated rental catalog across all categories.',
    filter: () => true,
    sort: (a, b) => (b.newestRank ?? 0) - (a.newestRank ?? 0),
  },
];

const HOME_COLLECTIONS = (() => {
  const usedProductIds = new Set();
  return HOME_COLLECTION_DEFINITIONS.map((definition) => {
    const products = PRODUCTS.filter(definition.filter)
      .sort(definition.sort)
      .filter((product) => !usedProductIds.has(product.id))
      .slice(0, 8);
    products.forEach((product) => usedProductIds.add(product.id));
    return { ...definition, products };
  });
})();

const editorialSections = [
  {
    eyebrow: 'The Furniture Edit',
    title: 'Make your space yours.',
    copy: 'Curated designer furniture crafted for comfort and longevity, without locking you into ownership.',
    cta: 'Explore Furniture',
    to: '/products?category=Furniture',
    image: PRODUCTS.find((product) => product.category === 'Living Room')?.image || HERO_IMAGE,
  },
  {
    eyebrow: 'A Fresh Start',
    title: 'Everything your new home needs.',
    copy: 'Bring together bedroom comfort, kitchen utility, and dependable appliances in one flexible monthly plan.',
    cta: 'Explore Bedroom Essentials',
    to: '/products?category=Bedroom',
    image: PRODUCTS.find((product) => product.category === 'Appliances')?.image || HERO_IMAGE,
  },
  {
    eyebrow: 'The Focus Edit',
    title: 'Build your perfect workspace.',
    copy: 'Thoughtful ergonomic desks, lumbar-support chairs, and connected monitors for high-performance remote work.',
    cta: 'Explore Workspaces',
    to: '/products?category=Office',
    image: PRODUCTS.find((product) => product.category === 'Office')?.image || HERO_IMAGE,
  },
];

function ArrowIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4 10h12m0 0-4-4m4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="h-4.5 w-4.5 text-slate-400" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="10.75" cy="10.75" r="6.25" stroke="currentColor" strokeWidth="1.8" />
      <path d="m16 16 4.25 4.25" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CarouselArrow({ direction, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-xs transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
      aria-label={direction < 0 ? 'See previous products' : 'See next products'}
    >
      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        {direction < 0 ? (
          <path d="M12.5 15l-5-5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M7.5 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    </button>
  );
}

function CollectionSection({ collection }) {
  const carouselRef = useRef(null);
  const scrollCarousel = (direction) => {
    carouselRef.current?.scrollBy({ left: direction * 360, behavior: 'smooth' });
  };

  const categoryName = collection.category || collection.title;

  return (
    <section className="mt-16 sm:mt-20" aria-labelledby={`${collection.title.replace(/\s+/g, '-').toLowerCase()}-heading`}>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-600" />
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
              {collection.eyebrow}
            </p>
          </div>
          <h2
            id={`${collection.title.replace(/\s+/g, '-').toLowerCase()}-heading`}
            className="mt-1.5 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl"
          >
            {collection.title}
          </h2>
          <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
            {collection.description}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/products?category=${encodeURIComponent(categoryName)}`}
            className="hidden items-center gap-1.5 text-xs font-bold text-blue-600 transition hover:text-blue-700 sm:flex"
          >
            <span>View all {collection.title}</span>
            <ArrowIcon />
          </Link>
          <div className="flex items-center gap-1.5">
            <CarouselArrow direction={-1} onClick={() => scrollCarousel(-1)} />
            <CarouselArrow direction={1} onClick={() => scrollCarousel(1)} />
          </div>
        </div>
      </div>

      <div
        ref={carouselRef}
        className="no-scrollbar mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 pt-1"
        tabIndex={0}
        aria-label={`${collection.title} carousel`}
      >
        {collection.products.map((product) => (
          <div
            key={product.id}
            className="w-[280px] shrink-0 snap-start sm:w-[300px] lg:w-[calc((100%-48px)/4)]"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      <div className="mt-2 flex justify-center sm:hidden">
        <Link
          to={`/products?category=${encodeURIComponent(categoryName)}`}
          className="text-xs font-bold text-blue-600 hover:underline"
        >
          View all {collection.title} →
        </Link>
      </div>
    </section>
  );
}

function CategoryTile({ category }) {
  const title = category.title || category.name;
  return (
    <Link
      to={`/products?category=${encodeURIComponent(title)}`}
      className="group relative flex flex-col justify-end overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-900 p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl sm:p-6"
    >
      <ProductImage
        src={category.image}
        alt={`${title} rentals`}
        className="absolute inset-0 h-full w-full"
        imageClassName="transition duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent transition duration-300 group-hover:from-slate-950/95" />

      <div className="relative z-10">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-lg font-bold tracking-tight text-white transition-colors group-hover:text-cyan-200 sm:text-xl">
            {title}
          </h3>
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-xs transition-transform duration-300 group-hover:translate-x-1 group-hover:bg-blue-600">
            <ArrowIcon />
          </span>
        </div>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-300">
          {category.description}
        </p>
        <span className="mt-3 inline-block text-[11px] font-semibold text-cyan-300">
          {category.count || '100+ items'}
        </span>
      </div>
    </Link>
  );
}

function EditorialSection({ section, reverse = false }) {
  return (
    <section
      className={`mt-16 sm:mt-20 grid overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-950 text-white shadow-xl md:grid-cols-2 ${
        reverse ? 'md:[&>*:first-child]:order-2' : ''
      }`}
    >
      <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-14">
        <Badge variant="dark" size="sm" className="w-fit bg-white/10 text-cyan-200 border-white/20">
          {section.eyebrow}
        </Badge>
        <h2 className="mt-4 max-w-md text-3xl font-extrabold tracking-tight sm:text-4xl">
          {section.title}
        </h2>
        <p className="mt-4 max-w-md text-sm leading-7 text-slate-300 sm:text-base">
          {section.copy}
        </p>
        <div className="mt-8">
          <Link
            to={section.to}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-bold text-slate-950 shadow-md transition duration-200 hover:-translate-y-0.5 hover:bg-blue-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
          >
            <span>{section.cta}</span>
            <ArrowIcon />
          </Link>
        </div>
      </div>
      <ProductImage
        src={section.image}
        alt={section.title}
        className="min-h-[280px] md:min-h-full"
        imageClassName="object-cover"
      />
    </section>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('all');
  const [category, setCategory] = useState('all');

  const submitSearch = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set('q', search.trim());
    if (location !== 'all') params.set('city', location);
    if (category !== 'all') params.set('category', category);
    navigate(`/products${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const handleQuickTagClick = (tag) => {
    navigate(`/products?q=${encodeURIComponent(tag)}`);
  };

  return (
    <div className="pb-16 space-y-12 sm:space-y-16">
      {/* Editorial Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 lg:p-10 shadow-xs">
        <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Left Column: Headline, Copy, Trust & Actions */}
          <div className="relative z-10 lg:col-span-7 flex flex-col justify-center">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              <span>Flexible rental living in 12 major cities</span>
            </div>

            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl leading-[1.12]">
              Rent quality furniture & appliances.{' '}
              <span className="text-blue-600">Zero commitment.</span>
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
              Upgrade your home with 900+ curated furniture items and top-tier appliances. Enjoy free 48-hour delivery, professional assembly, and complete maintenance coverage on flexible monthly plans.
            </p>

            {/* CTA Buttons */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                to="/products"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-xs transition duration-150 hover:bg-blue-600 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <span>Explore 900+ Rentals</span>
                <ArrowIcon />
              </Link>
              <Link
                to="/products?tab=categories"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-xs transition duration-150 hover:border-blue-300 hover:text-blue-600 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-100"
              >
                Browse Room Collections
              </Link>
            </div>

            {/* Hero Trust Information (Subtle, integrated 4-pillar grid) */}
            <div className="mt-8 grid grid-cols-2 gap-2.5 sm:gap-3 border-t border-slate-100 pt-6">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-bold text-[11px]">✓</span>
                <span>Zero deposit on 6+ mo</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-bold text-[11px]">✓</span>
                <span>Free 48h delivery & setup</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-bold text-[11px]">✓</span>
                <span>100% maintenance covered</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-bold text-[11px]">✓</span>
                <span>12 major cities supported</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Editorial Visual */}
          <div className="relative lg:col-span-5 h-full">
            <div className="relative h-full min-h-[300px] sm:min-h-[380px] lg:min-h-[440px] overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100 shadow-sm">
              <ProductImage
                src={HERO_IMAGE}
                alt="Bright designer living space furnished with RentEase rental collection"
                className="h-full w-full min-h-[300px] sm:min-h-[380px] lg:min-h-[440px]"
                imageClassName="object-cover h-full w-full"
                priority
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/75 via-slate-950/25 to-transparent p-4 sm:p-5">
                <p className="text-[11px] font-semibold text-slate-300">Curated Designer Living</p>
                <p className="text-xs sm:text-sm font-bold text-white">Monthly rental plans starting at ₹499/mo</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Interactive Search & Filter Bar */}
      <form
        onSubmit={submitSearch}
        className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
      >
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1.1fr_auto]">
          {/* Search Input */}
          <label className="flex items-center gap-3 rounded-xl bg-slate-50/90 px-3.5 py-2.5 transition focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 border border-slate-200/70">
            <SearchIcon />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="What are you looking for? e.g. Sofa, Refrigerator..."
              className="w-full bg-transparent text-xs font-semibold text-slate-950 outline-none placeholder:font-normal placeholder:text-slate-400"
            />
          </label>

          {/* City Dropdown */}
          <label className="flex items-center rounded-xl bg-slate-50/90 px-3.5 py-2.5 border border-slate-200/70">
            <span className="mr-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              City
            </span>
            <select
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              className="w-full bg-transparent text-xs font-bold text-slate-800 outline-none"
            >
              <option value="all">All 12 Cities</option>
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

          {/* Category Dropdown */}
          <label className="flex items-center rounded-xl bg-slate-50/90 px-3.5 py-2.5 border border-slate-200/70">
            <span className="mr-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Type
            </span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full bg-transparent text-xs font-bold text-slate-800 outline-none"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((item) => (
                <option key={item.slug} value={item.title || item.name}>
                  {item.title || item.name}
                </option>
              ))}
            </select>
          </label>

          {/* Search Submit Button */}
          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-xs font-bold text-white shadow-xs transition duration-150 hover:bg-blue-700 active:scale-[0.99]"
          >
            <span>Search Rentals</span>
            <ArrowIcon />
          </button>
        </div>

        {/* Quick Trending Tags */}
        <div className="mt-2.5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-2.5 px-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Trending:
          </span>
          {QUICK_TRENDING_SEARCHES.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleQuickTagClick(tag)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
            >
              {tag}
            </button>
          ))}
        </div>
      </form>

      {/* Category Discovery Grid */}
      <section aria-labelledby="categories-heading">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                Explore By Space
              </p>
            </div>
            <h2 id="categories-heading" className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              Shop by category
            </h2>
          </div>
          <Link
            to="/products?tab=categories"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>See all 8 categories</span>
            <ArrowIcon />
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((category) => (
            <CategoryTile key={category.slug} category={category} />
          ))}
        </div>
      </section>

      {/* Product Shelves & Editorial Interludes */}
      {HOME_COLLECTIONS.map((collection, index) => (
        <Fragment key={collection.title}>
          <CollectionSection collection={collection} index={index} />
          {index === 1 && <EditorialSection section={editorialSections[0]} />}
          {index === 4 && <EditorialSection section={editorialSections[1]} reverse />}
          {index === 6 && <EditorialSection section={editorialSections[2]} />}
        </Fragment>
      ))}

      {/* How RentEase Works (4 Steps) */}
      <section id="how-it-works" className="mt-20 scroll-mt-24 rounded-[2.5rem] bg-slate-950 px-6 py-12 text-white sm:px-10 lg:px-14 shadow-xl">
        <div className="max-w-2xl">
          <Badge variant="dark" size="sm" className="bg-white/10 text-cyan-200 border-white/20">
            How RentEase Works
          </Badge>
          <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
            The easiest part of settling in.
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-300 sm:text-base">
            Everything is engineered to give you flexibility, pristine quality, and zero long-term commitment.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div key={step.number} className="rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-xs">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400 text-sm font-black text-slate-950">
                {step.number}
              </span>
              <h3 className="mt-5 text-base font-bold text-white">{step.title}</h3>
              <p className="mt-2 text-xs leading-6 text-slate-300">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why RentEase / Value Props */}
      <section className="mt-20" aria-labelledby="benefits-heading">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-600" />
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
              Why RentEase
            </p>
          </div>
          <h2 id="benefits-heading" className="mt-1.5 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            More living. Zero friction.
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Enjoy premium furniture and top appliances without spending capital or worrying about resale.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit, index) => (
            <Card
              key={benefit.title}
              padding="md"
              shadow="sm"
              hover
              className="border border-slate-200/80 bg-white"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-xs font-bold text-blue-600">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <Badge variant="primary" size="xs">
                  {benefit.tag}
                </Badge>
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-950">{benefit.title}</h3>
              <p className="mt-2 text-xs leading-6 text-slate-500">{benefit.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Verified Renter Testimonials */}
      <section className="mt-20" aria-labelledby="testimonials-heading">
        <div className="text-center">
          <div className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-600" />
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
              Verified Renter Reviews
            </p>
          </div>
          <h2 id="testimonials-heading" className="mt-1.5 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            Loved by 10,000+ happy homes across India
          </h2>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {testimonials.map((item) => (
            <Card key={item.name} padding="md" shadow="sm" className="border border-slate-200/80 bg-white">
              <div className="flex items-center gap-1 text-amber-400 text-sm">
                ★★★★★
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-700">
                “{item.quote}”
              </p>
              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                <div>
                  <p className="text-xs font-bold text-slate-950">{item.name}</p>
                  <p className="text-[11px] text-slate-400">{item.role}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">
                  {item.city}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Bottom Conversion Banner */}
      <section className="mt-20 overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 px-6 py-12 text-white sm:px-10 sm:py-14 lg:px-14 shadow-xl">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
          <div>
            <Badge variant="glass" size="xs" className="text-slate-950 bg-white/90">
              READY WHEN YOU ARE
            </Badge>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Start your next chapter with RentEase.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-blue-100 sm:text-base">
              Furnish your entire apartment or add that one key work desk in under 5 minutes. Flexible terms, free maintenance, zero hassle.
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-xs font-extrabold text-blue-700 shadow-lg transition duration-200 hover:-translate-y-0.5 hover:bg-blue-50 active:translate-y-0"
          >
            <span>Explore 900+ Rentals</span>
            <ArrowIcon />
          </Link>
        </div>
      </section>
    </div>
  );
}
