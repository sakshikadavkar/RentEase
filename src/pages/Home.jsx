import { Fragment, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ArrowRight,
  Truck,
  ShieldCheck,
  Wrench,
  Calendar,
  MapPin,
  RotateCcw,
  Check,
  Sparkles,
  Building2,
  ChevronLeft,
  ChevronRight,
  Compass,
} from 'lucide-react';

import ProductCard from '../components/ProductCard';
import ProductImage from '../components/ProductImage';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { CATEGORIES, HERO_IMAGE, PRODUCTS } from '../constants/theme';

const benefits = [
  {
    icon: Calendar,
    title: 'Flexible Monthly Plans',
    description: 'Choose 1 to 12 months with easy month-to-month extensions, upgrades, or swaps anytime.',
    tag: '1–12 Months',
    color: 'text-blue-600 bg-blue-50 border-blue-100',
  },
  {
    icon: Truck,
    title: 'Free 48h Delivery & Setup',
    description: 'Our white-glove delivery crew unpacks, installs, and inspects every piece in your home for free.',
    tag: 'White-Glove',
    color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
  },
  {
    icon: Wrench,
    title: '100% Maintenance Covered',
    description: 'Periodic servicing, appliance tune-ups, and repair visits are included at zero extra cost.',
    tag: 'Zero Hassle',
    color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
  },
  {
    icon: MapPin,
    title: '12 Major Cities Supported',
    description: 'Local delivery hubs with rapid 48-hour SLAs across Bengaluru, Mumbai, Delhi NCR, and 9 more.',
    tag: 'Pan-India',
    color: 'text-purple-600 bg-purple-50 border-purple-100',
  },
];

const steps = [
  {
    number: '01',
    icon: Compass,
    title: 'Browse 900+ Rentals',
    description: 'Discover designer living rooms, ergonomic work offices, and energy-smart appliances tailored for your space.',
  },
  {
    number: '02',
    icon: Calendar,
    title: 'Choose Your Plan',
    description: 'Select a 1, 3, 6, or 12-month tenure with ₹0 security deposit on plans of 6 months or longer.',
  },
  {
    number: '03',
    icon: Truck,
    title: 'Get 48h Doorstep Setup',
    description: 'Our certified technicians unpack, assemble, and position everything at your scheduled time slot for free.',
  },
  {
    number: '04',
    icon: RotateCcw,
    title: 'Enjoy, Renew or Return',
    description: 'Keep your favorites, upgrade to newer models, or schedule free doorstep pickup whenever you move.',
  },
];

const SUPPORTED_CITIES = [
  { name: 'Bengaluru', state: 'Karnataka', popular: 'HSR, Indiranagar, Whitefield' },
  { name: 'Mumbai', state: 'Maharashtra', popular: 'Bandra, Powai, Andheri' },
  { name: 'Delhi NCR', state: 'Delhi', popular: 'Connaught Place, Saket, Dwarka' },
  { name: 'Hyderabad', state: 'Telangana', popular: 'Gachibowli, Madhapur, Hitec City' },
  { name: 'Pune', state: 'Maharashtra', popular: 'Koregaon Park, Hinjawadi, Baner' },
  { name: 'Chennai', state: 'Tamil Nadu', popular: 'OMR, Adyar, Anna Nagar' },
  { name: 'Kolkata', state: 'West Bengal', popular: 'Salt Lake, New Town, Park Street' },
  { name: 'Jaipur', state: 'Rajasthan', popular: 'Malviya Nagar, Vaishali Nagar' },
  { name: 'Ahmedabad', state: 'Gujarat', popular: 'SG Highway, Bodakdev, Satellite' },
  { name: 'Noida', state: 'Uttar Pradesh', popular: 'Sector 62, Sector 137, Expressway' },
  { name: 'Gurgaon', state: 'Haryana', popular: 'Cyber City, Golf Course Rd, Sohna Rd' },
  { name: 'Chandigarh', state: 'Punjab', popular: 'Sector 17, Sector 35, Mohali Hub' },
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
    title: 'Make your space uniquely yours.',
    copy: 'Curated designer furniture crafted for comfort and longevity, without locking your capital into depreciating ownership.',
    cta: 'Explore Furniture',
    to: '/products?category=Furniture',
    image: PRODUCTS.find((product) => product.category === 'Living Room')?.image || HERO_IMAGE,
  },
  {
    eyebrow: 'A Fresh Chapter',
    title: 'Everything your home needs in one place.',
    copy: 'Bring together bedroom serenity, kitchen utility, and dependable appliances under one predictable, flexible monthly plan.',
    cta: 'Explore Bedroom Essentials',
    to: '/products?category=Bedroom',
    image: PRODUCTS.find((product) => product.category === 'Appliances')?.image || HERO_IMAGE,
  },
  {
    eyebrow: 'The Productivity Edit',
    title: 'Build your focused home workspace.',
    copy: 'Thoughtful ergonomic desks, lumbar-support task chairs, and dual monitors engineered for healthy, high-performance work.',
    cta: 'Explore Workspaces',
    to: '/products?category=Office',
    image: PRODUCTS.find((product) => product.category === 'Office')?.image || HERO_IMAGE,
  },
];

function CarouselArrow({ direction, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-xs transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
      aria-label={direction < 0 ? 'See previous products' : 'See next products'}
    >
      {direction < 0 ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
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
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <div className="flex items-center gap-1.5">
            <CarouselArrow direction={-1} onClick={() => scrollCarousel(-1)} />
            <CarouselArrow direction={1} onClick={() => scrollCarousel(1)} />
          </div>
        </div>
      </div>

      <div
        ref={carouselRef}
        className="no-scrollbar mt-6 flex snap-x snap-mandatory gap-4.5 overflow-x-auto pb-4 pt-1"
        tabIndex={0}
        aria-label={`${collection.title} carousel`}
      >
        {collection.products.map((product) => (
          <div
            key={product.id}
            className="w-[280px] shrink-0 snap-start sm:w-[300px] lg:w-[calc((100%-54px)/4)]"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      <div className="mt-2 flex justify-center sm:hidden">
        <Link
          to={`/products?category=${encodeURIComponent(categoryName)}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
        >
          <span>View all {collection.title}</span>
          <ArrowRight className="h-3.5 w-3.5" />
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
      className="group relative flex flex-col justify-end overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-900 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-900/10 sm:p-6"
    >
      <ProductImage
        src={category.image}
        alt={`${title} rentals`}
        className="absolute inset-0 h-full w-full"
        imageClassName="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent transition-opacity duration-300 group-hover:from-slate-950/95" />

      <div className="relative z-10">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-lg font-bold tracking-tight text-white transition-colors group-hover:text-blue-200 sm:text-xl">
            {title}
          </h3>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-all duration-300 group-hover:translate-x-1 group-hover:bg-blue-600">
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-300">
          {category.description}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <span className="inline-flex items-center rounded-md bg-blue-500/20 px-2 py-0.5 text-[11px] font-semibold text-cyan-200 backdrop-blur-xs border border-cyan-400/20">
            {category.count || '100+ items'}
          </span>
          <span className="text-[11px] font-semibold text-slate-400 group-hover:text-white transition-colors">
            Browse collection →
          </span>
        </div>
      </div>
    </Link>
  );
}

function EditorialSection({ section, reverse = false }) {
  return (
    <section
      className={`mt-16 sm:mt-20 grid overflow-hidden rounded-[2.5rem] border border-slate-800 bg-slate-950 text-white shadow-2xl md:grid-cols-2 ${
        reverse ? 'md:[&>*:first-child]:order-2' : ''
      }`}
    >
      <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-14">
        <Badge variant="dark" size="sm" className="w-fit bg-white/10 text-blue-200 border-white/20 font-bold">
          {section.eyebrow}
        </Badge>
        <h2 className="mt-4 max-w-md text-3xl font-extrabold tracking-tight sm:text-4xl leading-tight">
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
            <ArrowRight className="h-4 w-4" />
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
    <div className="pb-16 space-y-14 sm:space-y-20">
      {/* 1. UPGRADED PREMIUM HERO SECTION (ABOVE-THE-FOLD COMPOSITION) */}
      <section className="relative overflow-hidden rounded-[2.5rem] border border-slate-200/90 bg-[#faf9f6] bg-gradient-to-br from-[#faf9f6] via-[#f7f8fd] to-[#f5f4fc] p-5 sm:p-7 md:p-8 lg:p-10 shadow-sm animate-hero-fade">
        {/* Layered subtle radial gradient lights (soft blue, indigo, lavender - no neon) */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-[420px] w-[420px] rounded-full bg-blue-300/15 blur-[85px]" />
        <div className="pointer-events-none absolute top-1/4 -right-20 h-[450px] w-[450px] rounded-full bg-indigo-300/15 blur-[95px]" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-[380px] w-[380px] rounded-full bg-purple-200/15 blur-[85px]" />

        {/* Primary Hero Composition: Left 50% Text & CTAs, Right 50% Large Lifestyle Image */}
        <div className="grid items-center gap-8 md:grid-cols-2 lg:gap-10 xl:gap-12">
          {/* LEFT ~50%: Eyebrow, Headline, Description, Coordinated CTAs & Trust Line */}
          <div className="relative z-10 flex flex-col justify-center">
            {/* Eyebrow Pill */}
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-200/80 bg-white/90 px-3.5 py-1 text-xs font-bold text-blue-700 shadow-2xs backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
              <span>Flexible rental living in 12 major cities</span>
            </div>

            {/* RentEase Headline */}
            <h1 className="mt-3.5 sm:mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-[2.65rem] xl:text-5xl leading-[1.12]">
              Rent quality furniture & appliances.{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
                Zero commitment.
              </span>
            </h1>

            {/* Description */}
            <p className="mt-3 sm:mt-3.5 max-w-lg text-sm sm:text-base leading-relaxed text-slate-600">
              Upgrade your home with 900+ curated furniture items and top-tier appliances. Enjoy free 48-hour delivery, professional assembly, and complete maintenance coverage on flexible monthly plans.
            </p>

            {/* Coordinated Primary & Secondary CTAs */}
            <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                to="/products"
                className="group inline-flex h-11 sm:h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 sm:px-6 text-xs sm:text-sm font-bold text-white shadow-sm shadow-slate-950/15 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-600 hover:shadow-md hover:shadow-blue-600/20 active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <span>Explore 900+ Rentals</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
              <Link
                to="/products?tab=categories"
                className="inline-flex h-11 sm:h-12 items-center justify-center rounded-xl border border-slate-200/90 bg-white/80 px-5 sm:px-6 text-xs sm:text-sm font-semibold text-slate-700 shadow-2xs backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-white hover:text-blue-700 active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
              >
                <span>Browse Room Collections</span>
              </Link>
            </div>

            {/* Small Trust Line */}
            <p className="mt-4 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-semibold text-slate-500">
              <span>900+ curated products</span>
              <span className="text-slate-300">•</span>
              <span>12 cities</span>
              <span className="text-slate-300">•</span>
              <span>Flexible 1–12 month plans</span>
            </p>
          </div>

          {/* RIGHT ~50%: ONE LARGE Premium Lifestyle Visual & 3 Balanced Floating Glass Cards */}
          <div className="relative flex items-center justify-center w-full py-2 sm:py-3 md:py-4">
            {/* Soft Blue Radial Glow & Subtle Lavender Glow Behind Image */}
            <div className="pointer-events-none absolute -inset-2 sm:-inset-3 rounded-[36px] bg-gradient-to-tr from-blue-400/20 via-indigo-300/15 to-purple-300/15 blur-xl -z-10 animate-pulse-glow" />

            {/* Large Lifestyle Image Shell (420-490px tall on desktop, rounded 28-32px, pristine & uncluttered) */}
            <div className="relative h-[300px] sm:h-[360px] md:h-[420px] lg:h-[460px] xl:h-[490px] w-full overflow-hidden rounded-[28px] sm:rounded-[32px] border border-slate-200/85 bg-slate-100 shadow-xl shadow-slate-900/8">
              <img
                src={HERO_IMAGE}
                alt="Modern furnished living room with contemporary sofa and curated RentEase furniture"
                className="h-full w-full object-cover transition-transform duration-700 ease-out hover:scale-105 animate-hero-image"
                loading="eager"
                fetchPriority="high"
                decoding="async"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=85';
                }}
              />
            </div>

            {/* Floating Glass Card 1: 48h Free Delivery (Top Left Edge) */}
            <div className="animate-float-card-1 absolute top-1 left-2 sm:top-2 sm:left-3 md:-top-1 md:-left-2 lg:top-3 lg:-left-3 z-20 flex items-center gap-2 sm:gap-2.5 rounded-2xl border border-white/85 bg-white/90 p-2 sm:p-2.5 shadow-lg shadow-slate-900/10 backdrop-blur-md transition-all hover:bg-white">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
                <Truck className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              </div>
              <div className="pr-1">
                <span className="text-xs sm:text-sm font-black tracking-tight text-slate-950 leading-tight block">
                  48h
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 leading-tight block whitespace-nowrap">
                  Free Delivery
                </span>
              </div>
            </div>

            {/* Floating Glass Card 2: ₹0 Deposit on 6+ months (Bottom Left Edge) */}
            <div className="animate-float-card-2 absolute bottom-2 left-2 sm:bottom-3 sm:left-3 md:bottom-2 md:-left-2 lg:bottom-4 lg:-left-3 z-20 flex items-center gap-2 sm:gap-2.5 rounded-2xl border border-white/85 bg-white/90 p-2 sm:p-2.5 shadow-lg shadow-slate-900/10 backdrop-blur-md transition-all hover:bg-white">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                <ShieldCheck className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              </div>
              <div className="pr-1">
                <span className="text-xs sm:text-sm font-black tracking-tight text-slate-950 leading-tight block">
                  ₹0
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 leading-tight block whitespace-nowrap">
                  Deposit on 6+ months
                </span>
              </div>
            </div>

            {/* Floating Glass Card 3: 900+ Curated Rentals (Top Right Edge) */}
            <div className="animate-float-card-3 absolute top-1 right-2 sm:top-2 sm:right-3 md:-top-1 md:-right-2 lg:top-3 lg:-right-3 z-20 flex items-center gap-2 sm:gap-2.5 rounded-2xl border border-white/85 bg-white/90 p-2 sm:p-2.5 shadow-lg shadow-slate-900/10 backdrop-blur-md transition-all hover:bg-white">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
                <Sparkles className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              </div>
              <div className="pr-1">
                <span className="text-xs sm:text-sm font-black tracking-tight text-slate-950 leading-tight block">
                  900+
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 leading-tight block whitespace-nowrap">
                  Curated Rentals
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Search & Discovery Panel: Positioned cleanly BELOW primary composition */}
        <div className="mt-8 rounded-2xl border border-slate-200/80 bg-white/95 p-3 sm:p-3.5 shadow-xs backdrop-blur-md">
          <form
            onSubmit={submitSearch}
            className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_auto]"
          >
            <label className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50/90 px-3 py-2 transition focus-within:border-blue-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search furniture, appliances..."
                className="w-full bg-transparent text-xs font-semibold text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-400"
              />
            </label>

            <label className="flex items-center rounded-xl border border-slate-200/80 bg-slate-50/90 px-3 py-2 focus-within:border-blue-400 focus-within:bg-white">
              <span className="mr-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                City
              </span>
              <select
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                className="w-full bg-transparent text-xs font-bold text-slate-800 outline-none truncate"
              >
                <option value="all">All 12 Cities</option>
                {SUPPORTED_CITIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center rounded-xl border border-slate-200/80 bg-slate-50/90 px-3 py-2 focus-within:border-blue-400 focus-within:bg-white">
              <span className="mr-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Type
              </span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="w-full bg-transparent text-xs font-bold text-slate-800 outline-none truncate"
              >
                <option value="all">All Rooms</option>
                {CATEGORIES.map((item) => (
                  <option key={item.slug} value={item.title || item.name}>
                    {item.title || item.name}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="submit"
              className="inline-flex h-9 sm:h-auto items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-5 text-xs font-bold text-white shadow-xs transition duration-150 hover:bg-blue-700 active:scale-[0.98]"
            >
              <span>Search</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>

          {/* Quick Trending Tags */}
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-2 px-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Trending:
            </span>
            {QUICK_TRENDING_SEARCHES.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleQuickTagClick(tag)}
                className="rounded-md border border-slate-200/70 bg-slate-50/80 px-2 py-0.5 text-[11px] font-medium text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 active:scale-95"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. UPGRADED BENEFITS: 4 ELEGANT CARDS */}
      <section aria-labelledby="benefits-heading">
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
            Enjoy curated designer furniture and certified energy-efficient appliances with total peace of mind.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b) => {
            const Icon = b.icon;
            return (
              <Card
                key={b.title}
                padding="md"
                shadow="sm"
                hover
                className="group border border-slate-200/80 bg-white transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-900/5 rounded-2xl"
              >
                <div className="flex items-center justify-between">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${b.color} transition-transform duration-300 group-hover:scale-110 shadow-2xs`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <Badge variant="primary" size="xs" className="font-bold">
                    {b.tag}
                  </Badge>
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-950 group-hover:text-blue-600 transition-colors">
                  {b.title}
                </h3>
                <p className="mt-2 text-xs leading-6 text-slate-500">
                  {b.description}
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 3. UPGRADED IMAGE-BASED CATEGORY DISCOVERY GRID */}
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
              Shop by room & category
            </h2>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Explore 900+ curated items designed for comfortable everyday living.
            </p>
          </div>
          <Link
            to="/products?tab=categories"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
          >
            <span>See all 8 room categories</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((cat) => (
            <CategoryTile key={cat.slug} category={cat} />
          ))}
        </div>
      </section>

      {/* 4. PRODUCT SHELVES & EDITORIAL INTERLUDES */}
      {HOME_COLLECTIONS.map((collection, index) => (
        <Fragment key={collection.title}>
          <CollectionSection collection={collection} />
          {index === 1 && <EditorialSection section={editorialSections[0]} />}
          {index === 4 && <EditorialSection section={editorialSections[1]} reverse />}
          {index === 6 && <EditorialSection section={editorialSections[2]} />}
        </Fragment>
      ))}

      {/* 5. UPGRADED HOW IT WORKS (4 STEPS VISUAL SECTION) */}
      <section id="how-it-works" className="mt-20 scroll-mt-24 rounded-[2.5rem] bg-slate-950 px-6 py-12 text-white sm:px-10 lg:px-14 shadow-2xl relative overflow-hidden border border-slate-800">
        {/* Ambient background glow */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-blue-600/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-indigo-600/15 blur-3xl" />

        <div className="relative z-10 max-w-2xl">
          <Badge variant="dark" size="sm" className="bg-white/10 text-blue-200 border-white/20 font-bold">
            How RentEase Works
          </Badge>
          <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
            The easiest part of settling into your new home.
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-300 sm:text-base">
            Everything is engineered to give you complete flexibility, pristine quality, and zero long-term commitment.
          </p>
        </div>

        <div className="relative z-10 mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => {
            const StepIcon = step.icon;
            return (
              <div
                key={step.number}
                className="group relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all duration-300 hover:border-blue-400/40 hover:bg-white/10 hover:-translate-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-sm font-black text-white shadow-md shadow-blue-600/30">
                    {step.number}
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-blue-300">
                    <StepIcon className="h-4 w-4" />
                  </div>
                </div>
                <h3 className="mt-5 text-base font-bold text-white transition-colors group-hover:text-blue-200">
                  {step.title}
                </h3>
                <p className="mt-2 text-xs leading-6 text-slate-300">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. UPGRADED VALUE PROPOSITION: SPLIT SECTION */}
      <section className="mt-20 overflow-hidden rounded-[2.5rem] border border-slate-200/90 bg-gradient-to-br from-white via-slate-50 to-blue-50/30 shadow-md">
        <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12 p-6 sm:p-10 lg:p-14">
          {/* Left Column: Visual with Ambient Glow & Floating Badge */}
          <div className="relative lg:col-span-6 order-2 lg:order-1">
            <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-blue-500/10 blur-xl -z-10" />
            <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-100 shadow-lg aspect-[4/3]">
              <ProductImage
                src={PRODUCTS.find((p) => p.category === 'Living Room')?.image || HERO_IMAGE}
                alt="RentEase designer living room setup"
                className="h-full w-full"
                imageClassName="object-cover h-full w-full"
              />
              <div className="absolute top-4 left-4 rounded-xl bg-slate-950/85 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md border border-white/10 shadow-md">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                  Zero Capital Locked
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Value Propositions */}
          <div className="lg:col-span-6 order-1 lg:order-2 flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                The RentEase Advantage
              </p>
            </div>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl lg:text-4xl leading-tight">
              Why purchase when you can live flexibly?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Purchasing furniture locks heavy upfront capital, entails moving depreciation, and creates resale friction. RentEase gives you verified designer quality, free assembly, and ongoing care without the commitment.
            </p>

            <ul className="mt-6 space-y-3">
              <li className="flex items-start gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs mt-0.5">
                  <Check className="h-3 w-3" />
                </span>
                <span className="text-xs sm:text-sm font-medium text-slate-700">
                  Save up to 70% upfront compared to retail purchasing costs.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs mt-0.5">
                  <Check className="h-3 w-3" />
                </span>
                <span className="text-xs sm:text-sm font-medium text-slate-700">
                  100% free scheduled maintenance, steam-cleaning tune-ups, and repairs.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs mt-0.5">
                  <Check className="h-3 w-3" />
                </span>
                <span className="text-xs sm:text-sm font-medium text-slate-700">
                  Free doorstep relocation support when moving within our 12 service cities.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs mt-0.5">
                  <Check className="h-3 w-3" />
                </span>
                <span className="text-xs sm:text-sm font-medium text-slate-700">
                  Zero security deposit on 6+ month plans with instant bank refunds.
                </span>
              </li>
            </ul>

            <div className="mt-8 flex items-center gap-3">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-xs font-bold text-white shadow-xs transition hover:bg-blue-600 hover:shadow-md active:scale-95"
              >
                <span>Explore All 900+ Rentals</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. UPGRADED CITIES SECTION (12 Supported Cities) */}
      <section aria-labelledby="cities-heading" className="mt-20">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                Pan-India Service Network
              </p>
            </div>
            <h2 id="cities-heading" className="mt-1.5 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              Delivering across 12 major Indian cities
            </h2>
            <p className="mt-1 max-w-xl text-sm text-slate-500">
              Each city hub operates dedicated logistics vans and certified technicians with guaranteed 48-hour delivery SLAs.
            </p>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
          >
            <span>Browse all cities</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 sm:gap-4">
          {SUPPORTED_CITIES.map((c) => (
            <Link
              key={c.name}
              to={`/products?city=${encodeURIComponent(c.name)}`}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-md hover:shadow-blue-900/5"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    48h SLA
                  </span>
                </div>
                <h3 className="mt-3 text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {c.name}
                </h3>
                <p className="text-[11px] font-medium text-slate-400">
                  {c.state}
                </p>
              </div>

              <div className="mt-3 border-t border-slate-100 pt-2 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 truncate max-w-[140px]">{c.popular}</span>
                <span className="text-blue-600 font-bold group-hover:translate-x-0.5 transition-transform">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 8. VERIFIED RENTER TESTIMONIALS */}
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
          <p className="mt-2 text-sm text-slate-500">
            Real experiences from professionals, creators, and families who furnished with RentEase.
          </p>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {testimonials.map((item) => (
            <Card key={item.name} padding="md" shadow="sm" className="rounded-2xl border border-slate-200/80 bg-white">
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

      {/* 9. UPGRADED FINAL CONVERSION CTA BANNER */}
      <section className="mt-20 overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 px-6 py-12 text-white sm:px-10 sm:py-16 lg:px-14 shadow-2xl relative border border-blue-900/40">
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-8 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <Badge variant="glass" size="xs" className="text-slate-950 bg-white/95 font-bold">
              READY WHEN YOU ARE
            </Badge>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl leading-tight">
              Start your next chapter with RentEase.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-blue-100 sm:text-base">
              Furnish your entire apartment or rent that one key ergonomic workstation in under 5 minutes. Flexible terms, free 48h delivery, zero deposit, and 100% maintenance.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-semibold text-blue-200">
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-400" />
                48h Free Delivery
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-400" />
                0₹ Deposit on 6+ mo
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-400" />
                Instant Security Refund
              </span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <Link
              to="/products"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 py-4 text-xs font-extrabold text-blue-700 shadow-xl transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-50 active:translate-y-0"
            >
              <span>Explore 900+ Rentals</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/products?tab=categories"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-4 text-xs font-bold text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/20"
            >
              <span>View Categories</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
