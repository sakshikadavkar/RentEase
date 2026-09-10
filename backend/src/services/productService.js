import { PRODUCTS } from '../../../src/constants/theme.js';
import { getPool } from '../config/database.js';

export const formatProductRow = (row) => {
  if (!row) return null;
  return {
    ...row,
    monthlyPrice: row.monthly_price !== undefined ? row.monthly_price : row.monthlyPrice,
    originalPrice: row.original_price !== undefined ? row.original_price : row.originalPrice,
    securityDeposit: row.deposit !== undefined ? row.deposit : (row.securityDeposit || 0),
    reviewCount: row.review_count !== undefined ? row.review_count : row.reviewCount,
    badgeVariant: row.badge_variant !== undefined ? row.badge_variant : row.badgeVariant,
    deliveryDays: row.delivery_days !== undefined ? row.delivery_days : row.deliveryDays,
    rentalDurations: row.rental_durations !== undefined ? row.rental_durations : (row.rentalDurations || [1, 3, 6, 12]),
    includedItems: row.included_items !== undefined ? row.included_items : (row.includedItems || []),
  };
};

export const getProducts = async ({
  search = '',
  category = '',
  subcategory = '',
  city = '',
  minPrice,
  maxPrice,
  sort = 'featured',
  page = 1,
  limit = 24,
}) => {
  const pool = getPool();
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 24));
  const offset = (pageNum - 1) * limitNum;

  if (pool) {
    // 1. PostgreSQL DB Query
    let query = 'SELECT * FROM products WHERE is_active = TRUE';
    const params = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR category ILIKE $${paramIndex} OR subcategory ILIKE $${paramIndex})`;
      params.push(`%${search.trim()}%`);
      paramIndex++;
    }

    if (category) {
      query += ` AND category ILIKE $${paramIndex}`;
      params.push(category.trim());
      paramIndex++;
    }

    if (subcategory) {
      query += ` AND subcategory ILIKE $${paramIndex}`;
      params.push(subcategory.trim());
      paramIndex++;
    }

    if (city) {
      query += ` AND city ILIKE $${paramIndex}`;
      params.push(city.trim());
      paramIndex++;
    }

    if (minPrice !== undefined && !isNaN(Number(minPrice))) {
      query += ` AND monthly_price >= $${paramIndex}`;
      params.push(Number(minPrice));
      paramIndex++;
    }

    if (maxPrice !== undefined && !isNaN(Number(maxPrice))) {
      query += ` AND monthly_price <= $${paramIndex}`;
      params.push(Number(maxPrice));
      paramIndex++;
    }

    // Sorting
    switch (sort) {
      case 'price_asc':
      case 'price-asc':
        query += ' ORDER BY monthly_price ASC';
        break;
      case 'price_desc':
      case 'price-desc':
        query += ' ORDER BY monthly_price DESC';
        break;
      case 'rating_desc':
      case 'rating-desc':
      case 'highest-rated':
        query += ' ORDER BY rating DESC, review_count DESC';
        break;
      case 'newest':
        query += ' ORDER BY created_at DESC';
        break;
      case 'featured':
      default:
        query += ' ORDER BY rating DESC';
        break;
    }

    // Count total matching
    const countQuery = `SELECT COUNT(*) FROM (${query}) AS filtered_products`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count, 10);

    // Apply pagination
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limitNum, offset);

    const result = await pool.query(query, params);

    return {
      products: result.rows.map(formatProductRow),
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  } else {
    // 2. Verified 903-Product In-Memory Fallback
    let filtered = [...PRODUCTS];

    if (search) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.title?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.subcategory?.toLowerCase().includes(q)
      );
    }

    if (category) {
      const cat = category.toLowerCase().trim();
      filtered = filtered.filter((p) => p.category?.toLowerCase() === cat);
    }

    if (subcategory) {
      const sub = subcategory.toLowerCase().trim();
      filtered = filtered.filter((p) => p.subcategory?.toLowerCase() === sub);
    }

    if (city) {
      const c = city.toLowerCase().trim();
      filtered = filtered.filter((p) => p.city?.toLowerCase() === c);
    }

    if (minPrice !== undefined && !isNaN(Number(minPrice))) {
      const min = Number(minPrice);
      filtered = filtered.filter((p) => (p.monthlyPrice ?? 0) >= min);
    }

    if (maxPrice !== undefined && !isNaN(Number(maxPrice))) {
      const max = Number(maxPrice);
      filtered = filtered.filter((p) => (p.monthlyPrice ?? 0) <= max);
    }

    // Sorting
    switch (sort) {
      case 'price_asc':
      case 'price-asc':
      case 'price-low':
        filtered.sort((a, b) => (a.monthlyPrice ?? 0) - (b.monthlyPrice ?? 0));
        break;
      case 'price_desc':
      case 'price-desc':
      case 'price-high':
        filtered.sort((a, b) => (b.monthlyPrice ?? 0) - (a.monthlyPrice ?? 0));
        break;
      case 'rating_desc':
      case 'rating-desc':
      case 'highest-rated':
        filtered.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case 'featured':
      default:
        // preserve natural curated featured order
        break;
    }

    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limitNum);

    return {
      products: paginated,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }
};

export const getProductById = async (id) => {
  const pool = getPool();

  if (pool) {
    const result = await pool.query('SELECT * FROM products WHERE id = $1 AND is_active = TRUE', [id]);
    if (result.rows.length === 0) {
      return null;
    }
    return formatProductRow(result.rows[0]);
  } else {
    const product = PRODUCTS.find((p) => p.id === id);
    return product || null;
  }
};
