import { getPool } from '../config/database.js';
import { PRODUCTS } from '../../../src/constants/theme.js';

const getProductFallback = (productId) => {
  return PRODUCTS.find((p) => p.id === productId) || null;
};

// ==========================================
// 1. DASHBOARD & HIGH LEVEL METRICS
// ==========================================
export const getAdminDashboardMetrics = async () => {
  const pool = getPool();
  if (!pool) {
    throw new Error('Database connection is required for Admin Dashboard');
  }

  // Execute aggregated metric queries in parallel
  const [
    usersRes,
    productsRes,
    rentalsRes,
    ordersRes,
    deliveriesRes,
    maintenanceRes,
    returnsRes,
    mrrRes,
    inventoryRes,
    recentOrdersRes,
    recentRentalsRes,
    recentTicketsRes,
    recentReturnsRes,
  ] = await Promise.all([
    pool.query(`SELECT count(*) AS count FROM users`),
    pool.query(`SELECT count(*) AS count FROM products WHERE is_active = true`),
    pool.query(`SELECT count(*) AS count FROM rentals WHERE status IN ('active', 'extended')`),
    pool.query(`
      SELECT 
        count(*) FILTER (WHERE status IN ('confirmed', 'processing')) AS pending_count,
        count(*) FILTER (WHERE status = 'delivered') AS completed_count,
        count(*) AS total_count
      FROM orders
    `),
    pool.query(`SELECT count(*) AS count FROM deliveries WHERE status != 'delivered'`),
    pool.query(`SELECT count(*) AS count FROM maintenance_tickets WHERE status IN ('open', 'assigned', 'in_progress')`),
    pool.query(`SELECT count(*) AS count FROM returns WHERE status IN ('requested', 'pickup_scheduled', 'claim_pending')`),
    pool.query(`SELECT COALESCE(SUM(monthly_rent), 0) AS mrr FROM rentals WHERE status IN ('active', 'extended')`),
    pool.query(`
      SELECT 
        count(*) AS total_units,
        count(*) FILTER (WHERE status = 'available') AS available_units,
        count(*) FILTER (WHERE status = 'rented') AS rented_units,
        count(*) FILTER (WHERE status = 'in_maintenance') AS maintenance_units,
        count(*) FILTER (WHERE status = 'in_transit') AS transit_units
      FROM inventory_units
    `),
    pool.query(`
      SELECT o.id, o.order_number, o.status, o.total_amount_due, o.created_at, u.name AS user_name, u.email AS user_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 6
    `),
    pool.query(`
      SELECT r.id, r.rental_number, r.product_id, r.monthly_rent, r.status, r.start_date, r.end_date, u.name AS user_name, p.name AS product_name
      FROM rentals r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN products p ON r.product_id = p.id
      ORDER BY r.created_at DESC
      LIMIT 6
    `),
    pool.query(`
      SELECT t.id, t.ticket_number, t.issue_category, t.urgency, t.status, t.created_at, u.name AS user_name
      FROM maintenance_tickets t
      LEFT JOIN users u ON t.user_id = u.id
      ORDER BY t.created_at DESC
      LIMIT 6
    `),
    pool.query(`
      SELECT ret.id, ret.return_number, ret.pickup_date, ret.status, ret.deposit_refund_status, ret.deposit_refund_amount, u.name AS user_name
      FROM returns ret
      LEFT JOIN users u ON ret.user_id = u.id
      ORDER BY ret.created_at DESC
      LIMIT 6
    `),
  ]);

  const totalUnits = parseInt(inventoryRes.rows[0]?.total_units || 0, 10);
  const rentedUnits = parseInt(inventoryRes.rows[0]?.rented_units || 0, 10);
  const utilizationRate = totalUnits > 0 ? Math.round((rentedUnits / totalUnits) * 100) : 0;

  return {
    metrics: {
      totalUsers: parseInt(usersRes.rows[0]?.count || 0, 10),
      totalProducts: parseInt(productsRes.rows[0]?.count || 0, 10),
      activeRentals: parseInt(rentalsRes.rows[0]?.count || 0, 10),
      pendingOrders: parseInt(ordersRes.rows[0]?.pending_count || 0, 10),
      completedOrders: parseInt(ordersRes.rows[0]?.completed_count || 0, 10),
      totalOrders: parseInt(ordersRes.rows[0]?.total_count || 0, 10),
      activeDeliveries: parseInt(deliveriesRes.rows[0]?.count || 0, 10),
      openMaintenanceTickets: parseInt(maintenanceRes.rows[0]?.count || 0, 10),
      pendingReturns: parseInt(returnsRes.rows[0]?.count || 0, 10),
      mrr: parseFloat(mrrRes.rows[0]?.mrr || 0),
      inventory: {
        total: totalUnits,
        available: parseInt(inventoryRes.rows[0]?.available_units || 0, 10),
        rented: rentedUnits,
        maintenance: parseInt(inventoryRes.rows[0]?.maintenance_units || 0, 10),
        transit: parseInt(inventoryRes.rows[0]?.transit_units || 0, 10),
        utilizationRate,
      },
    },
    recentOrders: recentOrdersRes.rows,
    recentRentals: recentRentalsRes.rows.map((r) => ({
      ...r,
      product_name: r.product_name || getProductFallback(r.product_id)?.name || 'RentEase Item',
    })),
    recentTickets: recentTicketsRes.rows,
    recentReturns: recentReturnsRes.rows,
  };
};

// ==========================================
// 2. ANALYTICS & REVENUE INTELLIGENCE
// ==========================================
export const getAdminAnalytics = async () => {
  const pool = getPool();
  if (!pool) throw new Error('Database connection required');

  const [
    revenueRes,
    rentalsByStatusRes,
    categoriesRes,
    topProductsRes,
    ticketsByCategoryRes,
    ticketsByUrgencyRes,
    inventoryByCityRes,
    extensionsCountRes,
  ] = await Promise.all([
    pool.query(`
      SELECT 
        (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'completed') AS total_revenue,
        (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE payment_type = 'rent' AND status = 'completed') AS rent_revenue,
        (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE payment_type = 'deposit' AND status = 'completed') AS deposit_revenue,
        (SELECT COALESCE(SUM(deposit_refund_amount), 0) FROM returns WHERE deposit_refund_status = 'refunded') AS total_refunded
    `),
    pool.query(`SELECT status, count(*) AS count FROM rentals GROUP BY status`),
    pool.query(`
      SELECT p.category, count(r.id) AS rental_count, COALESCE(SUM(r.monthly_rent), 0) AS total_mrr
      FROM products p
      LEFT JOIN rentals r ON p.id = r.product_id AND r.status IN ('active', 'extended')
      GROUP BY p.category
      ORDER BY rental_count DESC
    `),
    pool.query(`
      SELECT p.id, p.name, p.category, p.image, p.monthly_price, count(r.id) AS active_count
      FROM products p
      JOIN rentals r ON p.id = r.product_id
      GROUP BY p.id, p.name, p.category, p.image, p.monthly_price
      ORDER BY active_count DESC
      LIMIT 8
    `),
    pool.query(`SELECT issue_category, count(*) AS count FROM maintenance_tickets GROUP BY issue_category`),
    pool.query(`SELECT urgency, count(*) AS count FROM maintenance_tickets GROUP BY urgency`),
    pool.query(`SELECT city, count(*) AS total_units, count(*) FILTER (WHERE status = 'available') AS available_units FROM inventory_units GROUP BY city`),
    pool.query(`SELECT count(*) AS extensions_count FROM rental_extensions`),
  ]);

  const activeRentalsCount = rentalsByStatusRes.rows.find((r) => r.status === 'active')?.count || 0;
  const totalRentalsCount = rentalsByStatusRes.rows.reduce((sum, r) => sum + parseInt(r.count, 10), 0);
  const extensionsCount = parseInt(extensionsCountRes.rows[0]?.extensions_count || 0, 10);
  const extensionRate = totalRentalsCount > 0 ? Math.round((extensionsCount / totalRentalsCount) * 100) : 0;

  return {
    revenue: {
      totalRevenue: parseFloat(revenueRes.rows[0]?.total_revenue || 0),
      rentRevenue: parseFloat(revenueRes.rows[0]?.rent_revenue || 0),
      depositRevenue: parseFloat(revenueRes.rows[0]?.deposit_revenue || 0),
      totalRefunded: parseFloat(revenueRes.rows[0]?.total_refunded || 0),
    },
    rentals: {
      byStatus: rentalsByStatusRes.rows,
      totalCount: totalRentalsCount,
      activeCount: parseInt(activeRentalsCount, 10),
      extensionsCount,
      extensionRate,
    },
    categories: categoriesRes.rows.map((c) => ({
      category: c.category,
      rentalCount: parseInt(c.rental_count || 0, 10),
      totalMrr: parseFloat(c.total_mrr || 0),
    })),
    topProducts: topProductsRes.rows,
    maintenance: {
      byCategory: ticketsByCategoryRes.rows,
      byUrgency: ticketsByUrgencyRes.rows,
    },
    inventoryByCity: inventoryByCityRes.rows,
  };
};

// ==========================================
// 3. USER MANAGEMENT (PART C)
// ==========================================
export const getAdminUsers = async ({ search = '', role = '', is_active, page = 1, limit = 20 }) => {
  const pool = getPool();
  if (!pool) throw new Error('Database connection required');

  const offset = (page - 1) * limit;
  const params = [];
  let where = 'WHERE 1=1';

  if (search) {
    params.push(`%${search.trim().toLowerCase()}%`);
    where += ` AND (LOWER(u.name) LIKE $${params.length} OR LOWER(u.email) LIKE $${params.length} OR LOWER(u.city) LIKE $${params.length})`;
  }

  if (role) {
    params.push(role);
    where += ` AND u.role = $${params.length}`;
  }

  if (is_active !== undefined && is_active !== '') {
    params.push(is_active === 'true' || is_active === true);
    where += ` AND u.is_active = $${params.length}`;
  }

  const countQuery = `SELECT count(*) AS total FROM users u ${where}`;
  const countRes = await pool.query(countQuery, params);
  const total = parseInt(countRes.rows[0]?.total || 0, 10);

  const dataQuery = `
    SELECT 
      u.id, u.name, u.email, u.phone, u.role, u.city, u.is_active, u.created_at, u.updated_at,
      count(DISTINCT r.id) AS rental_count,
      count(DISTINCT o.id) AS order_count
    FROM users u
    LEFT JOIN rentals r ON u.id = r.user_id
    LEFT JOIN orders o ON u.id = o.user_id
    ${where}
    GROUP BY u.id
    ORDER BY u.created_at DESC
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;

  const dataRes = await pool.query(dataQuery, [...params, limit, offset]);

  return {
    users: dataRes.rows.map((row) => ({
      ...row,
      rental_count: parseInt(row.rental_count, 10),
      order_count: parseInt(row.order_count, 10),
    })),
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getAdminUserDetail = async (userId) => {
  const pool = getPool();
  if (!pool) throw new Error('Database connection required');

  const [userRes, rentalsRes, ordersRes, ticketsRes, addressesRes] = await Promise.all([
    pool.query('SELECT id, name, email, phone, role, city, is_active, created_at, updated_at FROM users WHERE id = $1', [userId]),
    pool.query(`
      SELECT r.*, p.name AS product_name, p.image AS product_image
      FROM rentals r
      LEFT JOIN products p ON r.product_id = p.id
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC
    `, [userId]),
    pool.query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [userId]),
    pool.query('SELECT * FROM maintenance_tickets WHERE user_id = $1 ORDER BY created_at DESC', [userId]),
    pool.query('SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC', [userId]),
  ]);

  if (userRes.rows.length === 0) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  const user = userRes.rows[0];
  return {
    user,
    rentals: rentalsRes.rows.map((r) => ({
      ...r,
      product_name: r.product_name || getProductFallback(r.product_id)?.name || 'RentEase Item',
    })),
    orders: ordersRes.rows,
    maintenanceTickets: ticketsRes.rows,
    addresses: addressesRes.rows,
  };
};

export const updateAdminUserStatus = async (userId, isActive) => {
  const pool = getPool();
  if (!pool) throw new Error('Database connection required');

  // Safety constraint: Prevent deactivating the last remaining administrator
  if (!isActive) {
    const adminCheck = await pool.query(
      `SELECT count(*) FROM users WHERE role = 'admin' AND is_active = true AND id != $1`,
      [userId]
    );
    const targetUser = await pool.query(`SELECT role FROM users WHERE id = $1`, [userId]);
    if (targetUser.rows[0]?.role === 'admin' && parseInt(adminCheck.rows[0].count, 10) === 0) {
      const err = new Error('Cannot deactivate the last active administrator.');
      err.statusCode = 400;
      throw err;
    }
  }

  const result = await pool.query(
    `UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, name, email, role, is_active`,
    [isActive, userId]
  );

  if (result.rows.length === 0) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  return result.rows[0];
};

export const updateAdminUserRole = async (userId, newRole) => {
  const pool = getPool();
  if (!pool) throw new Error('Database connection required');

  const validRoles = ['customer', 'admin', 'technician', 'logistics'];
  if (!validRoles.includes(newRole)) {
    const err = new Error(`Invalid role. Valid options: ${validRoles.join(', ')}`);
    err.statusCode = 400;
    throw err;
  }

  // Safety check: Prevent demoting the last admin
  const targetUser = await pool.query(`SELECT role FROM users WHERE id = $1`, [userId]);
  if (targetUser.rows[0]?.role === 'admin' && newRole !== 'admin') {
    const adminCheck = await pool.query(
      `SELECT count(*) FROM users WHERE role = 'admin' AND is_active = true AND id != $1`,
      [userId]
    );
    if (parseInt(adminCheck.rows[0].count, 10) === 0) {
      const err = new Error('Cannot change the role of the last active administrator.');
      err.statusCode = 400;
      throw err;
    }
  }

  const result = await pool.query(
    `UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, name, email, role, is_active`,
    [newRole, userId]
  );

  if (result.rows.length === 0) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  return result.rows[0];
};

// ==========================================
// 4. PRODUCT MANAGEMENT (PART D)
// ==========================================
export const getAdminProducts = async ({ search = '', category = '', city = '', is_active, page = 1, limit = 20 }) => {
  const pool = getPool();
  if (!pool) throw new Error('Database connection required');

  const offset = (page - 1) * limit;
  const params = [];
  let where = 'WHERE 1=1';

  if (search) {
    params.push(`%${search.trim().toLowerCase()}%`);
    where += ` AND (LOWER(p.name) LIKE $${params.length} OR LOWER(p.id) LIKE $${params.length} OR LOWER(p.category) LIKE $${params.length})`;
  }

  if (category) {
    params.push(category);
    where += ` AND p.category = $${params.length}`;
  }

  if (city) {
    params.push(city);
    where += ` AND (p.city = $${params.length} OR p.city IS NULL OR p.city = 'All')`;
  }

  if (is_active !== undefined && is_active !== '') {
    params.push(is_active === 'true' || is_active === true);
    where += ` AND p.is_active = $${params.length}`;
  }

  const countRes = await pool.query(`SELECT count(*) AS total FROM products p ${where}`, params);
  const total = parseInt(countRes.rows[0]?.total || 0, 10);

  const dataQuery = `
    SELECT 
      p.*,
      count(DISTINCT r.id) FILTER (WHERE r.status IN ('active', 'extended')) AS active_rentals_count,
      count(DISTINCT inv.id) AS inventory_units_count
    FROM products p
    LEFT JOIN rentals r ON p.id = r.product_id
    LEFT JOIN inventory_units inv ON p.id = inv.product_id
    ${where}
    GROUP BY p.id
    ORDER BY p.name ASC
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;

  const dataRes = await pool.query(dataQuery, [...params, limit, offset]);

  return {
    products: dataRes.rows.map((p) => ({
      ...p,
      monthly_price: parseFloat(p.monthly_price),
      deposit: parseFloat(p.deposit || 0),
      active_rentals_count: parseInt(p.active_rentals_count, 10),
      inventory_units_count: parseInt(p.inventory_units_count, 10),
    })),
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getAdminProductDetail = async (productId) => {
  const pool = getPool();
  if (!pool) throw new Error('Database connection required');

  const [prodRes, unitsRes, activeRentalsRes] = await Promise.all([
    pool.query(`SELECT * FROM products WHERE id = $1`, [productId]),
    pool.query(`SELECT * FROM inventory_units WHERE product_id = $1 ORDER BY id ASC`, [productId]),
    pool.query(`
      SELECT r.*, u.name AS user_name, u.email AS user_email
      FROM rentals r
      JOIN users u ON r.user_id = u.id
      WHERE r.product_id = $1 AND r.status IN ('active', 'extended')
      ORDER BY r.created_at DESC
    `, [productId]),
  ]);

  if (prodRes.rows.length === 0) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }

  return {
    product: {
      ...prodRes.rows[0],
      monthly_price: parseFloat(prodRes.rows[0].monthly_price),
      deposit: parseFloat(prodRes.rows[0].deposit || 0),
    },
    inventoryUnits: unitsRes.rows,
    activeRentals: activeRentalsRes.rows,
  };
};

export const createAdminProduct = async (data) => {
  const pool = getPool();
  if (!pool) throw new Error('Database connection required');

  const {
    id,
    name,
    category,
    subcategory = '',
    description = '',
    monthly_price,
    original_price = null,
    deposit = 0,
    city = 'Bengaluru',
    badge = null,
    delivery_days = '3–5 days',
    condition = 'Brand New',
    warranty = '1 Year',
    rental_durations = [1, 3, 6, 12],
    image,
    features = [],
    included_items = [],
    specifications = {},
  } = data;

  if (!name || !category || !monthly_price || !image) {
    const err = new Error('Product name, category, monthly_price, and image are required.');
    err.statusCode = 400;
    throw err;
  }

  const productId = id || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);

  const query = `
    INSERT INTO products (
      id, name, category, subcategory, description, monthly_price, original_price,
      deposit, city, badge, delivery_days, condition, warranty, rental_durations,
      image, features, included_items, specifications, is_active
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, true
    ) RETURNING *
  `;

  const result = await pool.query(query, [
    productId,
    name.trim(),
    category,
    subcategory,
    description,
    monthly_price,
    original_price,
    deposit,
    city,
    badge,
    delivery_days,
    condition,
    warranty,
    JSON.stringify(rental_durations),
    image,
    JSON.stringify(features),
    JSON.stringify(included_items),
    JSON.stringify(specifications),
  ]);

  return result.rows[0];
};

export const updateAdminProduct = async (productId, data) => {
  const pool = getPool();
  if (!pool) throw new Error('Database connection required');

  const {
    name,
    category,
    subcategory,
    description,
    monthly_price,
    original_price,
    deposit,
    city,
    badge,
    delivery_days,
    condition,
    warranty,
    rental_durations,
    image,
    is_active,
  } = data;

  const query = `
    UPDATE products SET
      name = COALESCE($1, name),
      category = COALESCE($2, category),
      subcategory = COALESCE($3, subcategory),
      description = COALESCE($4, description),
      monthly_price = COALESCE($5, monthly_price),
      original_price = COALESCE($6, original_price),
      deposit = COALESCE($7, deposit),
      city = COALESCE($8, city),
      badge = COALESCE($9, badge),
      delivery_days = COALESCE($10, delivery_days),
      condition = COALESCE($11, condition),
      warranty = COALESCE($12, warranty),
      rental_durations = CASE WHEN $13::jsonb IS NOT NULL THEN $13::jsonb ELSE rental_durations END,
      image = COALESCE($14, image),
      is_active = COALESCE($15, is_active),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $16
    RETURNING *
  `;

  const result = await pool.query(query, [
    name,
    category,
    subcategory,
    description,
    monthly_price,
    original_price,
    deposit,
    city,
    badge,
    delivery_days,
    condition,
    warranty,
    rental_durations ? JSON.stringify(rental_durations) : null,
    image,
    is_active,
    productId,
  ]);

  if (result.rows.length === 0) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }

  return result.rows[0];
};

export const updateAdminProductStatus = async (productId, isActive) => {
  const pool = getPool();
  if (!pool) throw new Error('Database connection required');

  const result = await pool.query(
    `UPDATE products SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, name, is_active`,
    [isActive, productId]
  );

  if (result.rows.length === 0) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }

  return result.rows[0];
};

// ==========================================
// 5. INVENTORY MANAGEMENT (PART E)
// ==========================================
export const getAdminInventoryUnits = async ({ search = '', city = '', status = '', condition_grade = '', product_id = '', page = 1, limit = 25 }) => {
  const pool = getPool();
  if (!pool) throw new Error('Database connection required');

  const offset = (page - 1) * limit;
  const params = [];
  let where = 'WHERE 1=1';

  if (search) {
    params.push(`%${search.trim().toLowerCase()}%`);
    where += ` AND (LOWER(inv.serial_number) LIKE $${params.length} OR LOWER(p.name) LIKE $${params.length} OR LOWER(inv.warehouse_location) LIKE $${params.length})`;
  }

  if (city) {
    params.push(city);
    where += ` AND inv.city = $${params.length}`;
  }

  if (status) {
    params.push(status);
    where += ` AND inv.status = $${params.length}`;
  }

  if (condition_grade) {
    params.push(condition_grade);
    where += ` AND inv.condition_grade = $${params.length}`;
  }

  if (product_id) {
    params.push(product_id);
    where += ` AND inv.product_id = $${params.length}`;
  }

  const countRes = await pool.query(
    `SELECT count(*) AS total FROM inventory_units inv LEFT JOIN products p ON inv.product_id = p.id ${where}`,
    params
  );
  const total = parseInt(countRes.rows[0]?.total || 0, 10);

  const dataQuery = `
    SELECT 
      inv.*,
      p.name AS product_name,
      p.image AS product_image,
      p.category AS product_category,
      r.rental_number,
      u.name AS active_renter_name
    FROM inventory_units inv
    LEFT JOIN products p ON inv.product_id = p.id
    LEFT JOIN rentals r ON inv.id = r.inventory_unit_id AND r.status IN ('active', 'extended')
    LEFT JOIN users u ON r.user_id = u.id
    ${where}
    ORDER BY inv.created_at DESC
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;

  const dataRes = await pool.query(dataQuery, [...params, limit, offset]);

  // Inventory summary stats
  const summaryRes = await pool.query(`
    SELECT 
      count(*) AS total,
      count(*) FILTER (WHERE status = 'available') AS available,
      count(*) FILTER (WHERE status = 'rented') AS rented,
      count(*) FILTER (WHERE status = 'in_maintenance') AS in_maintenance,
      count(*) FILTER (WHERE status = 'in_transit') AS in_transit,
      count(*) FILTER (WHERE status = 'retired') AS retired
    FROM inventory_units
  `);

  return {
    units: dataRes.rows.map((u) => ({
      ...u,
      product_name: u.product_name || getProductFallback(u.product_id)?.name || 'RentEase Item',
    })),
    summary: summaryRes.rows[0],
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const createAdminInventoryUnit = async (data) => {
  const pool = getPool();
  if (!pool) throw new Error('Database connection required');

  const { product_id, serial_number, city = 'Bengaluru', warehouse_location = 'Central Hub', status = 'available', condition_grade = 'Grade A' } = data;
  if (!product_id || !serial_number) {
    const err = new Error('product_id and serial_number are required.');
    err.statusCode = 400;
    throw err;
  }

  const result = await pool.query(
    `INSERT INTO inventory_units (product_id, serial_number, city, warehouse_location, status, condition_grade, last_inspected_at)
     VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
     RETURNING *`,
    [product_id, serial_number.trim(), city, warehouse_location, status, condition_grade]
  );

  return result.rows[0];
};

export const updateAdminInventoryUnit = async (unitId, data) => {
  const pool = getPool();
  if (!pool) throw new Error('Database connection required');

  const { status, condition_grade, warehouse_location, city } = data;

  const result = await pool.query(
    `UPDATE inventory_units SET
      status = COALESCE($1, status),
      condition_grade = COALESCE($2, condition_grade),
      warehouse_location = COALESCE($3, warehouse_location),
      city = COALESCE($4, city),
      last_inspected_at = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
     WHERE id = $5
     RETURNING *`,
    [status, condition_grade, warehouse_location, city, unitId]
  );

  if (result.rows.length === 0) {
    const err = new Error('Inventory unit not found');
    err.statusCode = 404;
    throw err;
  }

  return result.rows[0];
};

// ==========================================
// 6. ORDER MANAGEMENT (PART F)
// ==========================================
export const getAdminOrders = async ({ search = '', status = '', city = '', page = 1, limit = 20 }) => {
  const pool = getPool();
  if (!pool) throw new Error('Database connection required');

  const offset = (page - 1) * limit;
  const params = [];
  let where = 'WHERE 1=1';

  if (search) {
    params.push(`%${search.trim().toLowerCase()}%`);
    where += ` AND (LOWER(o.order_number) LIKE $${params.length} OR LOWER(u.name) LIKE $${params.length} OR LOWER(u.email) LIKE $${params.length})`;
  }

  if (status) {
    params.push(status);
    where += ` AND o.status = $${params.length}`;
  }

  if (city) {
    params.push(city);
    where += ` AND a.city = $${params.length}`;
  }

  const countRes = await pool.query(`
    SELECT count(*) AS total 
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    LEFT JOIN addresses a ON o.delivery_address_id = a.id
    ${where}
  `, params);

  const total = parseInt(countRes.rows[0]?.total || 0, 10);

  const dataQuery = `
    SELECT 
      o.*,
      u.name AS customer_name,
      u.email AS customer_email,
      u.phone AS customer_phone,
      a.street_address,
      a.city AS delivery_city,
      a.pincode,
      d.tracking_number,
      d.status AS delivery_status,
      d.driver_name
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    LEFT JOIN addresses a ON o.delivery_address_id = a.id
    LEFT JOIN deliveries d ON o.id = d.order_id
    ${where}
    ORDER BY o.created_at DESC
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;

  const dataRes = await pool.query(dataQuery, [...params, limit, offset]);

  return {
    orders: dataRes.rows,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getAdminOrderDetail = async (orderId) => {
  const pool = getPool();
  if (!pool) throw new Error('Database connection required');

  const [orderRes, itemsRes, deliveryRes, paymentsRes, rentalsRes] = await Promise.all([
    pool.query(`
      SELECT o.*, u.name AS customer_name, u.email AS customer_email, u.phone AS customer_phone,
             a.street_address, a.landmark, a.city AS delivery_city, a.state AS delivery_state, a.pincode
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN addresses a ON o.delivery_address_id = a.id
      WHERE o.id = $1 OR o.order_number = $1
    `, [orderId]),
    pool.query(`
      SELECT oi.*, p.name AS product_name, p.image AS product_image, p.category AS product_category
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = (SELECT id FROM orders WHERE id = $1 OR order_number = $1 LIMIT 1)
    `, [orderId]),
    pool.query(`
      SELECT * FROM deliveries WHERE order_id = (SELECT id FROM orders WHERE id = $1 OR order_number = $1 LIMIT 1)
    `, [orderId]),
    pool.query(`
      SELECT * FROM payments WHERE order_id = (SELECT id FROM orders WHERE id = $1 OR order_number = $1 LIMIT 1)
    `, [orderId]),
    pool.query(`
      SELECT r.*, p.name AS product_name FROM rentals r LEFT JOIN products p ON r.product_id = p.id
      WHERE r.order_id = (SELECT id FROM orders WHERE id = $1 OR order_number = $1 LIMIT 1)
    `, [orderId]),
  ]);

  if (orderRes.rows.length === 0) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }

  return {
    order: orderRes.rows[0],
    items: itemsRes.rows.map((item) => ({
      ...item,
      product_name: item.product_name || getProductFallback(item.product_id)?.name || 'RentEase Item',
    })),
    delivery: deliveryRes.rows[0] || null,
    payments: paymentsRes.rows,
    rentals: rentalsRes.rows,
  };
};

export const updateAdminOrderStatus = async (orderId, newStatus) => {
  const pool = getPool();
  if (!pool) throw new Error('Database connection required');

  const validStatuses = ['pending', 'confirmed', 'processing', 'out_for_delivery', 'delivered', 'cancelled'];
  if (!validStatuses.includes(newStatus)) {
    const err = new Error(`Invalid order status. Allowed: ${validStatuses.join(', ')}`);
    err.statusCode = 400;
    throw err;
  }

  const result = await pool.query(
    `UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 OR order_number = $2 RETURNING *`,
    [newStatus, orderId]
  );

  if (result.rows.length === 0) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }

  // If order status is marked as delivered, ensure delivery is updated too
  if (newStatus === 'delivered') {
    await pool.query(
      `UPDATE deliveries SET status = 'delivered', delivered_at = CURRENT_TIMESTAMP WHERE order_id = $1`,
      [result.rows[0].id]
    );
  }

  return result.rows[0];
};

// ==========================================
// 7. RENTAL MANAGEMENT (PART G)
// ==========================================
export const getAdminRentals = async ({ search = '', status = '', city = '', page = 1, limit = 20 }) => {
  const pool = getPool();
  if (!pool) throw new Error('Database connection required');

  const offset = (page - 1) * limit;
  const params = [];
  let where = 'WHERE 1=1';

  if (search) {
    params.push(`%${search.trim().toLowerCase()}%`);
    where += ` AND (LOWER(r.rental_number) LIKE $${params.length} OR LOWER(u.name) LIKE $${params.length} OR LOWER(p.name) LIKE $${params.length})`;
  }

  if (status) {
    params.push(status);
    where += ` AND r.status = $${params.length}`;
  }

  if (city) {
    params.push(`%${city.trim().toLowerCase()}%`);
    where += ` AND LOWER(r.delivery_address) LIKE $${params.length}`;
  }

  const countRes = await pool.query(`
    SELECT count(*) AS total
    FROM rentals r
    LEFT JOIN users u ON r.user_id = u.id
    LEFT JOIN products p ON r.product_id = p.id
    ${where}
  `, params);

  const total = parseInt(countRes.rows[0]?.total || 0, 10);

  const dataQuery = `
    SELECT 
      r.*,
      u.name AS user_name,
      u.email AS user_email,
      u.phone AS user_phone,
      p.name AS product_name,
      p.image AS product_image,
      p.category AS product_category,
      count(DISTINCT ext.id) AS extension_count
    FROM rentals r
    LEFT JOIN users u ON r.user_id = u.id
    LEFT JOIN products p ON r.product_id = p.id
    LEFT JOIN rental_extensions ext ON r.id = ext.rental_id
    ${where}
    GROUP BY r.id, u.name, u.email, u.phone, p.name, p.image, p.category
    ORDER BY r.created_at DESC
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;

  const dataRes = await pool.query(dataQuery, [...params, limit, offset]);

  return {
    rentals: dataRes.rows.map((r) => ({
      ...r,
      product_name: r.product_name || getProductFallback(r.product_id)?.name || 'RentEase Item',
      monthly_rent: parseFloat(r.monthly_rent),
      deposit_paid: parseFloat(r.deposit_paid || 0),
      extension_count: parseInt(r.extension_count, 10),
    })),
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getAdminRentalDetail = async (rentalId) => {
  const pool = getPool();
  if (!pool) throw new Error('Database connection required');

  const [rentalRes, extRes, returnRes, ticketsRes] = await Promise.all([
    pool.query(`
      SELECT r.*, u.name AS user_name, u.email AS user_email, u.phone AS user_phone,
             p.name AS product_name, p.image AS product_image, p.category AS product_category,
             inv.serial_number, inv.condition_grade
      FROM rentals r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN products p ON r.product_id = p.id
      LEFT JOIN inventory_units inv ON r.inventory_unit_id = inv.id
      WHERE r.id = $1 OR r.rental_number = $1
    `, [rentalId]),
    pool.query(`
      SELECT * FROM rental_extensions 
      WHERE rental_id = (SELECT id FROM rentals WHERE id = $1 OR rental_number = $1 LIMIT 1)
      ORDER BY created_at DESC
    `, [rentalId]),
    pool.query(`
      SELECT * FROM returns 
      WHERE rental_id = (SELECT id FROM rentals WHERE id = $1 OR rental_number = $1 LIMIT 1)
      ORDER BY created_at DESC LIMIT 1
    `, [rentalId]),
    pool.query(`
      SELECT * FROM maintenance_tickets 
      WHERE rental_id = (SELECT id FROM rentals WHERE id = $1 OR rental_number = $1 LIMIT 1)
      ORDER BY created_at DESC
    `, [rentalId]),
  ]);

  if (rentalRes.rows.length === 0) {
    const err = new Error('Rental subscription not found');
    err.statusCode = 404;
    throw err;
  }

  const rental = rentalRes.rows[0];
  return {
    rental: {
      ...rental,
      product_name: rental.product_name || getProductFallback(rental.product_id)?.name || 'RentEase Item',
      monthly_rent: parseFloat(rental.monthly_rent),
      deposit_paid: parseFloat(rental.deposit_paid || 0),
    },
    extensions: extRes.rows,
    returnInfo: returnRes.rows[0] || null,
    maintenanceTickets: ticketsRes.rows,
  };
};

export const updateAdminRentalStatus = async (rentalId, status) => {
  const pool = getPool();
  if (!pool) throw new Error('Database connection required');

  const validStatuses = ['active', 'extended', 'completed', 'cancelled', 'overdue', 'return_requested', 'terminated'];
  if (!validStatuses.includes(status)) {
    const err = new Error(`Invalid status. Allowed: ${validStatuses.join(', ')}`);
    err.statusCode = 400;
    throw err;
  }

  const result = await pool.query(
    `UPDATE rentals SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 OR rental_number = $2 RETURNING *`,
    [status, rentalId]
  );

  if (result.rows.length === 0) {
    const err = new Error('Rental subscription not found');
    err.statusCode = 404;
    throw err;
  }

  return result.rows[0];
};

// ==========================================
// 8. DELIVERY MANAGEMENT (PART H)
// ==========================================
export const getAdminDeliveries = async ({ search = '', status = '', date = '', page = 1, limit = 20 }) => {
  const pool = getPool();
  if (!pool) throw new Error('Database connection required');

  const offset = (page - 1) * limit;
  const params = [];
  let where = 'WHERE 1=1';

  if (search) {
    params.push(`%${search.trim().toLowerCase()}%`);
    where += ` AND (LOWER(d.tracking_number) LIKE $${params.length} OR LOWER(d.driver_name) LIKE $${params.length} OR LOWER(o.order_number) LIKE $${params.length} OR LOWER(u.name) LIKE $${params.length})`;
  }

  if (status) {
    params.push(status);
    where += ` AND d.status = $${params.length}`;
  }

  if (date) {
    params.push(date);
    where += ` AND d.scheduled_date = $${params.length}`;
  }

  const countRes = await pool.query(`
    SELECT count(*) AS total 
    FROM deliveries d
    LEFT JOIN orders o ON d.order_id = o.id
    LEFT JOIN users u ON o.user_id = u.id
    ${where}
  `, params);

  const total = parseInt(countRes.rows[0]?.total || 0, 10);

  const dataQuery = `
    SELECT 
      d.*,
      o.order_number,
      o.delivery_slot AS order_slot,
      u.name AS customer_name,
      u.phone AS customer_phone,
      a.street_address,
      a.city,
      a.pincode
    FROM deliveries d
    LEFT JOIN orders o ON d.order_id = o.id
    LEFT JOIN users u ON o.user_id = u.id
    LEFT JOIN addresses a ON o.delivery_address_id = a.id
    ${where}
    ORDER BY d.created_at DESC
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;

  const dataRes = await pool.query(dataQuery, [...params, limit, offset]);

  return {
    deliveries: dataRes.rows,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const updateAdminDelivery = async (deliveryId, data) => {
  const pool = getPool();
  if (!pool) throw new Error('Database connection required');

  const { tracking_number, scheduled_date, time_slot, driver_name, driver_phone, status } = data;

  const result = await pool.query(`
    UPDATE deliveries SET
      tracking_number = COALESCE($1, tracking_number),
      scheduled_date = COALESCE($2, scheduled_date),
      time_slot = COALESCE($3, time_slot),
      driver_name = COALESCE($4, driver_name),
      driver_phone = COALESCE($5, driver_phone),
      status = COALESCE($6, status),
      delivered_at = CASE WHEN $6 = 'delivered' THEN CURRENT_TIMESTAMP ELSE delivered_at END
    WHERE id = $7 OR tracking_number = $7
    RETURNING *
  `, [tracking_number, scheduled_date, time_slot, driver_name, driver_phone, status, deliveryId]);

  if (result.rows.length === 0) {
    const err = new Error('Delivery record not found');
    err.statusCode = 404;
    throw err;
  }

  return result.rows[0];
};

// ==========================================
// 9. MAINTENANCE MANAGEMENT (PART I)
// ==========================================
export const getAdminMaintenanceTickets = async ({ search = '', category = '', urgency = '', status = '', page = 1, limit = 20 }) => {
  const pool = getPool();
  if (!pool) throw new Error('Database connection required');

  const offset = (page - 1) * limit;
  const params = [];
  let where = 'WHERE 1=1';

  if (search) {
    params.push(`%${search.trim().toLowerCase()}%`);
    where += ` AND (LOWER(t.ticket_number) LIKE $${params.length} OR LOWER(u.name) LIKE $${params.length} OR LOWER(t.description) LIKE $${params.length})`;
  }

  if (category) {
    params.push(category);
    where += ` AND t.issue_category = $${params.length}`;
  }

  if (urgency) {
    params.push(urgency);
    where += ` AND t.urgency = $${params.length}`;
  }

  if (status) {
    params.push(status);
    where += ` AND t.status = $${params.length}`;
  }

  const countRes = await pool.query(`
    SELECT count(*) AS total 
    FROM maintenance_tickets t
    LEFT JOIN users u ON t.user_id = u.id
    ${where}
  `, params);

  const total = parseInt(countRes.rows[0]?.total || 0, 10);

  const dataQuery = `
    SELECT 
      t.*,
      u.name AS customer_name,
      u.email AS customer_email,
      u.phone AS customer_account_phone,
      r.rental_number,
      r.product_id,
      p.name AS product_name,
      tech.name AS technician_name,
      tech.phone AS technician_phone
    FROM maintenance_tickets t
    LEFT JOIN users u ON t.user_id = u.id
    LEFT JOIN rentals r ON t.rental_id = r.id
    LEFT JOIN products p ON r.product_id = p.id
    LEFT JOIN users tech ON t.technician_id = tech.id
    ${where}
    ORDER BY t.created_at DESC
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;

  const dataRes = await pool.query(dataQuery, [...params, limit, offset]);

  return {
    tickets: dataRes.rows.map((t) => ({
      ...t,
      product_name: t.product_name || getProductFallback(t.product_id)?.name || 'RentEase Item',
    })),
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const updateAdminMaintenanceTicket = async (ticketId, data) => {
  const pool = getPool();
  if (!pool) throw new Error('Database connection required');

  const { technician_id, status, resolution_notes, scheduled_at } = data;

  const result = await pool.query(`
    UPDATE maintenance_tickets SET
      technician_id = COALESCE($1, technician_id),
      status = COALESCE($2, status),
      resolution_notes = COALESCE($3, resolution_notes),
      scheduled_at = COALESCE($4, scheduled_at),
      resolved_at = CASE WHEN $2 IN ('resolved', 'closed') THEN CURRENT_TIMESTAMP ELSE resolved_at END,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $5 OR ticket_number = $5
    RETURNING *
  `, [technician_id, status, resolution_notes, scheduled_at, ticketId]);

  if (result.rows.length === 0) {
    const err = new Error('Maintenance ticket not found');
    err.statusCode = 404;
    throw err;
  }

  return result.rows[0];
};

// ==========================================
// 10. RETURNS & DAMAGE CLAIMS (PART J)
// ==========================================
export const getAdminReturns = async ({ search = '', status = '', page = 1, limit = 20 }) => {
  const pool = getPool();
  if (!pool) throw new Error('Database connection required');

  const offset = (page - 1) * limit;
  const params = [];
  let where = 'WHERE 1=1';

  if (search) {
    params.push(`%${search.trim().toLowerCase()}%`);
    where += ` AND (LOWER(ret.return_number) LIKE $${params.length} OR LOWER(u.name) LIKE $${params.length} OR LOWER(r.rental_number) LIKE $${params.length})`;
  }

  if (status) {
    params.push(status);
    where += ` AND ret.status = $${params.length}`;
  }

  const countRes = await pool.query(`
    SELECT count(*) AS total FROM returns ret
    LEFT JOIN users u ON ret.user_id = u.id
    LEFT JOIN rentals r ON ret.rental_id = r.id
    ${where}
  `, params);

  const total = parseInt(countRes.rows[0]?.total || 0, 10);

  const dataQuery = `
    SELECT 
      ret.*,
      u.name AS customer_name,
      u.email AS customer_email,
      u.phone AS customer_phone,
      r.rental_number,
      r.deposit_paid,
      r.monthly_rent,
      p.name AS product_name,
      p.image AS product_image,
      claim.claim_number,
      claim.assessed_repair_cost,
      claim.deposit_deduction_amount
    FROM returns ret
    LEFT JOIN users u ON ret.user_id = u.id
    LEFT JOIN rentals r ON ret.rental_id = r.id
    LEFT JOIN products p ON r.product_id = p.id
    LEFT JOIN damage_claims claim ON ret.id = claim.return_id
    ${where}
    ORDER BY ret.created_at DESC
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;

  const dataRes = await pool.query(dataQuery, [...params, limit, offset]);

  return {
    returns: dataRes.rows.map((ret) => ({
      ...ret,
      product_name: ret.product_name || getProductFallback(ret.product_id)?.name || 'RentEase Item',
      deposit_paid: parseFloat(ret.deposit_paid || 0),
      deposit_refund_amount: parseFloat(ret.deposit_refund_amount || 0),
      damage_deduction: parseFloat(ret.damage_deduction || 0),
      early_termination_fee: parseFloat(ret.early_termination_fee || 0),
    })),
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const updateAdminReturn = async (returnId, data) => {
  const pool = getPool();
  if (!pool) throw new Error('Database connection required');

  const {
    status,
    inspection_passed,
    inspection_notes,
    damage_deduction,
    early_termination_fee,
    deposit_refund_amount,
    deposit_refund_status,
  } = data;

  const result = await pool.query(`
    UPDATE returns SET
      status = COALESCE($1, status),
      inspection_passed = COALESCE($2, inspection_passed),
      inspection_notes = COALESCE($3, inspection_notes),
      damage_deduction = COALESCE($4, damage_deduction),
      early_termination_fee = COALESCE($5, early_termination_fee),
      deposit_refund_amount = COALESCE($6, deposit_refund_amount),
      deposit_refund_status = COALESCE($7, deposit_refund_status),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $8 OR return_number = $8
    RETURNING *
  `, [
    status,
    inspection_passed,
    inspection_notes,
    damage_deduction,
    early_termination_fee,
    deposit_refund_amount,
    deposit_refund_status,
    returnId,
  ]);

  if (result.rows.length === 0) {
    const err = new Error('Return record not found');
    err.statusCode = 404;
    throw err;
  }

  // If refund status changed to refunded, record payment/refund entry
  if (deposit_refund_status === 'refunded') {
    const ret = result.rows[0];
    await pool.query(`
      INSERT INTO payments (transaction_id, user_id, amount, payment_type, payment_method, status)
      VALUES ($1, $2, $3, 'refund', 'Bank Transfer', 'refunded')
      ON CONFLICT (transaction_id) DO NOTHING
    `, [`REF-${ret.return_number}`, ret.user_id, ret.deposit_refund_amount || 0]);
  }

  return result.rows[0];
};

export const createAdminDamageClaim = async (returnId, data) => {
  const pool = getPool();
  if (!pool) throw new Error('Database connection required');

  const { damage_description, assessed_repair_cost, deposit_deduction_amount, photo_urls = [] } = data;
  if (!damage_description || assessed_repair_cost === undefined) {
    const err = new Error('damage_description and assessed_repair_cost are required.');
    err.statusCode = 400;
    throw err;
  }

  const retRes = await pool.query('SELECT id, rental_id, user_id FROM returns WHERE id = $1 OR return_number = $1', [returnId]);
  if (retRes.rows.length === 0) {
    const err = new Error('Return record not found');
    err.statusCode = 404;
    throw err;
  }

  const ret = retRes.rows[0];
  const claimNum = `CLM-${Date.now().toString().slice(-6)}`;

  const claimRes = await pool.query(`
    INSERT INTO damage_claims (
      claim_number, return_id, rental_id, damage_description, photo_urls, assessed_repair_cost, deposit_deduction_amount
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `, [
    claimNum,
    ret.id,
    ret.rental_id,
    damage_description,
    JSON.stringify(photo_urls),
    assessed_repair_cost,
    deposit_deduction_amount || assessed_repair_cost,
  ]);

  // Update return deduction amount
  await pool.query(`
    UPDATE returns SET 
      damage_deduction = $1,
      status = 'claim_pending',
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
  `, [deposit_deduction_amount || assessed_repair_cost, ret.id]);

  return claimRes.rows[0];
};

// ==========================================
// 11. SERVICE AREAS (PART K)
// ==========================================
export const getAdminServiceAreas = async () => {
  const pool = getPool();
  if (!pool) throw new Error('Database connection required');

  const result = await pool.query(`
    SELECT 
      sa.*,
      count(DISTINCT inv.id) AS inventory_units_count,
      count(DISTINCT r.id) FILTER (WHERE r.status IN ('active', 'extended')) AS active_rentals_count
    FROM service_areas sa
    LEFT JOIN inventory_units inv ON sa.city_name = inv.city
    LEFT JOIN rentals r ON LOWER(r.delivery_address) LIKE LOWER('%' || sa.city_name || '%')
    GROUP BY sa.id
    ORDER BY sa.city_name ASC
  `);

  return result.rows.map((row) => ({
    ...row,
    inventory_units_count: parseInt(row.inventory_units_count, 10),
    active_rentals_count: parseInt(row.active_rentals_count, 10),
  }));
};

export const createAdminServiceArea = async (data) => {
  const pool = getPool();
  if (!pool) throw new Error('Database connection required');

  const { city_name, state_name = '', pincodes = [] } = data;
  if (!city_name) {
    const err = new Error('city_name is required');
    err.statusCode = 400;
    throw err;
  }

  const result = await pool.query(
    `INSERT INTO service_areas (city_name, state_name, pincodes, is_active)
     VALUES ($1, $2, $3, true)
     ON CONFLICT (city_name) DO UPDATE SET is_active = true
     RETURNING *`,
    [city_name.trim(), state_name.trim(), JSON.stringify(pincodes)]
  );

  return result.rows[0];
};

export const updateAdminServiceArea = async (id, data) => {
  const pool = getPool();
  if (!pool) throw new Error('Database connection required');

  const { is_active, pincodes, state_name } = data;

  const result = await pool.query(`
    UPDATE service_areas SET
      is_active = COALESCE($1, is_active),
      state_name = COALESCE($2, state_name),
      pincodes = CASE WHEN $3::jsonb IS NOT NULL THEN $3::jsonb ELSE pincodes END
    WHERE id = $4
    RETURNING *
  `, [is_active, state_name, pincodes ? JSON.stringify(pincodes) : null, id]);

  if (result.rows.length === 0) {
    const err = new Error('Service area not found');
    err.statusCode = 404;
    throw err;
  }

  return result.rows[0];
};
