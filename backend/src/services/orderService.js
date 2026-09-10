import { getPool } from '../config/database.js';
import { PRODUCTS } from '../../../src/constants/theme.js';

const getProductFallback = (productId) => {
  return PRODUCTS.find((p) => p.id === productId) || null;
};

export const createOrder = async (userId, {
  items = [],
  deliveryAddress,
  deliverySlot = 'Morning (9 AM - 1 PM)',
  paymentMethod = 'UPI',
  totalDueToday = 0,
  monthlySubtotal = 0,
  totalDeposit = 0,
}) => {
  const pool = getPool();
  if (!pool) {
    throw new Error('Database connection pool is not configured');
  }

  if (!items || items.length === 0) {
    const err = new Error('Cart is empty. Please add items to checkout.');
    err.statusCode = 400;
    err.isOperational = true;
    throw err;
  }

  const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
  const trackingNumber = `TRK-${Math.floor(10000000 + Math.random() * 90000000)}`;
  const transactionId = `TXN-${Math.floor(100000000 + Math.random() * 900000000)}`;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Create or save address
    let addressId = null;
    if (typeof deliveryAddress === 'object') {
      const addrRes = await client.query(
        `INSERT INTO addresses (
          user_id, full_name, phone, street_address, landmark, city, state, pincode, is_default
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE)
        RETURNING id`,
        [
          userId,
          deliveryAddress.fullName || 'Valued Customer',
          deliveryAddress.phone || '9876543210',
          deliveryAddress.address || deliveryAddress.streetAddress || 'Bangalore',
          deliveryAddress.landmark || '',
          deliveryAddress.city || 'Bengaluru',
          deliveryAddress.state || 'Karnataka',
          deliveryAddress.pincode || '560001',
        ]
      );
      addressId = addrRes.rows[0].id;
    }

    const formattedAddressStr = typeof deliveryAddress === 'object'
      ? `${deliveryAddress.address || deliveryAddress.streetAddress}, ${deliveryAddress.city} - ${deliveryAddress.pincode}`
      : (deliveryAddress || 'Bengaluru, Karnataka');

    // 2. Insert Order
    const subtotal = monthlySubtotal || items.reduce((s, it) => s + (it.product?.monthlyPrice || 999) * (it.quantity || 1), 0);
    const deposit = totalDeposit || items.reduce((s, it) => s + (it.product?.deposit || 0) * (it.quantity || 1), 0);
    const tax = Math.round(subtotal * 0.18);
    const grandTotal = totalDueToday || (subtotal + deposit + tax);

    const orderRes = await client.query(
      `INSERT INTO orders (
        order_number, user_id, delivery_address_id, status,
        subtotal_monthly, deposit_total, tax_amount, total_amount_due,
        payment_method, delivery_slot
      ) VALUES ($1, $2, $3, 'confirmed', $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        orderNumber,
        userId,
        addressId,
        subtotal,
        deposit,
        tax,
        grandTotal,
        paymentMethod,
        deliverySlot,
      ]
    );
    const order = orderRes.rows[0];

    // 3. Insert Delivery Record
    const scheduledDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    await client.query(
      `INSERT INTO deliveries (
        order_id, tracking_number, scheduled_date, time_slot,
        driver_name, driver_phone, status
      ) VALUES ($1, $2, $3, $4, $5, $6, 'scheduled')`,
      [
        order.id,
        trackingNumber,
        scheduledDate,
        deliverySlot,
        'Ramesh Kumar (RentEase Express)',
        '+91 98450 12345',
      ]
    );

    // 4. Insert Payment Record
    await client.query(
      `INSERT INTO payments (
        transaction_id, order_id, user_id, amount, payment_type,
        payment_method, status
      ) VALUES ($1, $2, $3, $4, 'first_month_rent_deposit', $5, 'completed')`,
      [
        transactionId,
        order.id,
        userId,
        grandTotal,
        paymentMethod,
      ]
    );

    // 5. Insert Order Items and corresponding Active Rentals
    const createdRentals = [];
    const now = new Date();
    const startDate = now.toISOString().split('T')[0];

    for (const item of items) {
      const prodId = item.product?.id || item.productId;
      const tenure = item.tenure || 12;
      const quantity = item.quantity || 1;
      const itemRent = (item.product?.monthlyPrice || 999);
      const itemDeposit = (item.product?.deposit || 0);

      // Order Item
      await client.query(
        `INSERT INTO order_items (
          order_id, product_id, quantity, tenure_months, monthly_price, deposit_amount
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [order.id, prodId, quantity, tenure, itemRent, itemDeposit]
      );

      // Rentals (one subscription record per unit/quantity)
      for (let q = 0; q < quantity; q++) {
        const endDateObj = new Date(now);
        endDateObj.setMonth(endDateObj.getMonth() + tenure);
        const endDate = endDateObj.toISOString().split('T')[0];

        const nextBillObj = new Date(now);
        nextBillObj.setMonth(nextBillObj.getMonth() + 1);
        const nextBillDate = nextBillObj.toISOString().split('T')[0];

        const rentalNumber = `RNT-${Math.floor(100000 + Math.random() * 900000)}`;

        const rentalRes = await client.query(
          `INSERT INTO rentals (
            rental_number, order_id, user_id, product_id, tenure_months,
            monthly_rent, deposit_paid, start_date, end_date, next_billing_date,
            status, delivery_address, delivery_slot, delivery_status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'active', $11, $12, 'scheduled')
          RETURNING *`,
          [
            rentalNumber,
            order.id,
            userId,
            prodId,
            tenure,
            itemRent,
            itemDeposit,
            startDate,
            endDate,
            nextBillDate,
            formattedAddressStr,
            deliverySlot,
          ]
        );

        createdRentals.push(rentalRes.rows[0]);
      }
    }

    await client.query('COMMIT');

    return {
      success: true,
      order: {
        id: order.id,
        orderNumber: order.order_number,
        status: order.status,
        subtotalMonthly: parseFloat(order.subtotal_monthly),
        depositTotal: parseFloat(order.deposit_total),
        taxAmount: parseFloat(order.tax_amount),
        totalAmountDue: parseFloat(order.total_amount_due),
        paymentMethod: order.payment_method,
        deliverySlot: order.delivery_slot,
        trackingNumber,
        scheduledDeliveryDate: scheduledDate,
        createdAt: order.created_at,
      },
      rentals: createdRentals.map((r) => ({
        id: r.id,
        rentalNumber: r.rental_number,
        productId: r.product_id,
        tenureMonths: r.tenure_months,
        monthlyRent: parseFloat(r.monthly_rent),
        depositPaid: parseFloat(r.deposit_paid),
        startDate: r.start_date,
        endDate: r.end_date,
        nextBillingDate: r.next_billing_date,
        status: r.status,
        deliveryAddress: r.delivery_address,
      })),
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const getUserOrders = async (userId, userRole = 'customer') => {
  const pool = getPool();
  if (!pool) {
    throw new Error('Database connection pool is not configured');
  }

  let query = `
    SELECT 
      o.*,
      d.tracking_number,
      d.scheduled_date as delivery_scheduled_date,
      d.time_slot as delivery_time_slot,
      d.status as delivery_status,
      d.driver_name,
      d.driver_phone
    FROM orders o
    LEFT JOIN deliveries d ON d.order_id = o.id
    WHERE 1=1
  `;

  const params = [];
  if (userRole !== 'admin') {
    query += ` AND o.user_id = $1`;
    params.push(userId);
  }

  query += ` ORDER BY o.created_at DESC`;

  const ordersRes = await pool.query(query, params);

  const orders = [];
  for (const o of ordersRes.rows) {
    // Fetch items for each order
    const itemsRes = await pool.query(
      `SELECT oi.*, p.name as product_name, p.image as product_image, p.category as product_category
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [o.id]
    );

    orders.push({
      id: o.id,
      orderNumber: o.order_number,
      userId: o.user_id,
      status: o.status,
      subtotalMonthly: parseFloat(o.subtotal_monthly),
      depositTotal: parseFloat(o.deposit_total),
      taxAmount: parseFloat(o.tax_amount),
      totalAmountDue: parseFloat(o.total_amount_due),
      paymentMethod: o.payment_method,
      deliverySlot: o.delivery_slot,
      createdAt: o.created_at,
      delivery: {
        trackingNumber: o.tracking_number,
        scheduledDate: o.delivery_scheduled_date,
        timeSlot: o.delivery_time_slot,
        status: o.delivery_status || 'scheduled',
        driverName: o.driver_name,
        driverPhone: o.driver_phone,
      },
      items: itemsRes.rows.map((item) => {
        const fallback = !item.product_name ? getProductFallback(item.product_id) : null;
        return {
          id: item.id,
          productId: item.product_id,
          productName: item.product_name || fallback?.name || fallback?.title || 'RentEase Item',
          productImage: item.product_image || fallback?.image || '',
          category: item.product_category || fallback?.category || 'Furniture',
          quantity: item.quantity,
          tenureMonths: item.tenure_months,
          monthlyPrice: parseFloat(item.monthly_price),
          depositAmount: parseFloat(item.deposit_amount),
        };
      }),
    });
  }

  return orders;
};

export const getOrderById = async (orderId, userId, userRole = 'customer') => {
  const pool = getPool();
  if (!pool) {
    throw new Error('Database connection pool is not configured');
  }

  const isNumeric = !isNaN(Number(orderId));
  let whereClause = isNumeric ? 'o.id = $1' : 'o.order_number = $1';
  const params = [isNumeric ? parseInt(orderId, 10) : orderId];

  if (userRole !== 'admin') {
    whereClause += ' AND o.user_id = $2';
    params.push(userId);
  }

  const query = `
    SELECT 
      o.*,
      d.tracking_number,
      d.scheduled_date as delivery_scheduled_date,
      d.time_slot as delivery_time_slot,
      d.status as delivery_status,
      d.driver_name,
      d.driver_phone,
      d.delivered_at,
      a.full_name as address_full_name,
      a.phone as address_phone,
      a.street_address,
      a.city as address_city,
      a.pincode as address_pincode
    FROM orders o
    LEFT JOIN deliveries d ON d.order_id = o.id
    LEFT JOIN addresses a ON o.delivery_address_id = a.id
    WHERE ${whereClause}
  `;

  const result = await pool.query(query, params);
  if (result.rows.length === 0) {
    return null;
  }

  const o = result.rows[0];

  const itemsRes = await pool.query(
    `SELECT oi.*, p.name as product_name, p.image as product_image, p.category as product_category
     FROM order_items oi
     LEFT JOIN products p ON oi.product_id = p.id
     WHERE oi.order_id = $1`,
    [o.id]
  );

  const rentalsRes = await pool.query(
    `SELECT * FROM rentals WHERE order_id = $1`,
    [o.id]
  );

  return {
    id: o.id,
    orderNumber: o.order_number,
    userId: o.user_id,
    status: o.status,
    subtotalMonthly: parseFloat(o.subtotal_monthly),
    depositTotal: parseFloat(o.deposit_total),
    taxAmount: parseFloat(o.tax_amount),
    totalAmountDue: parseFloat(o.total_amount_due),
    paymentMethod: o.payment_method,
    deliverySlot: o.delivery_slot,
    deliveryAddress: o.street_address ? `${o.street_address}, ${o.address_city} - ${o.address_pincode}` : 'Bengaluru',
    createdAt: o.created_at,
    delivery: {
      trackingNumber: o.tracking_number,
      scheduledDate: o.delivery_scheduled_date,
      timeSlot: o.delivery_time_slot,
      status: o.delivery_status || 'scheduled',
      driverName: o.driver_name,
      driverPhone: o.driver_phone,
      deliveredAt: o.delivered_at,
    },
    items: itemsRes.rows.map((item) => {
      const fallback = !item.product_name ? getProductFallback(item.product_id) : null;
      return {
        id: item.id,
        productId: item.product_id,
        productName: item.product_name || fallback?.name || fallback?.title || 'RentEase Item',
        productImage: item.product_image || fallback?.image || '',
        category: item.product_category || fallback?.category || 'Furniture',
        quantity: item.quantity,
        tenureMonths: item.tenure_months,
        monthlyPrice: parseFloat(item.monthly_price),
        depositAmount: parseFloat(item.deposit_amount),
      };
    }),
    rentals: rentalsRes.rows.map((r) => ({
      id: r.id,
      rentalNumber: r.rental_number,
      productId: r.product_id,
      status: r.status,
      startDate: r.start_date,
      endDate: r.end_date,
      monthlyRent: parseFloat(r.monthly_rent),
    })),
  };
};
