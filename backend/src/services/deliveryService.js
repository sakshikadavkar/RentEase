import { getPool } from '../config/database.js';

export const getUserDeliveries = async (userId, userRole = 'customer') => {
  const pool = getPool();
  if (!pool) {
    throw new Error('Database connection pool is not configured');
  }

  let query = `
    SELECT 
      d.*,
      o.order_number,
      o.created_at as order_created_at,
      o.total_amount_due,
      o.user_id,
      a.full_name,
      a.phone,
      a.street_address,
      a.city,
      a.pincode
    FROM deliveries d
    JOIN orders o ON d.order_id = o.id
    LEFT JOIN addresses a ON o.delivery_address_id = a.id
    WHERE 1=1
  `;

  const params = [];
  if (userRole !== 'admin') {
    query += ` AND o.user_id = $1`;
    params.push(userId);
  }

  query += ` ORDER BY d.created_at DESC`;

  const result = await pool.query(query, params);

  return result.rows.map((row) => ({
    id: row.id,
    orderId: row.order_id,
    orderNumber: row.order_number,
    trackingNumber: row.tracking_number,
    scheduledDate: row.scheduled_date,
    timeSlot: row.time_slot,
    driverName: row.driver_name,
    driverPhone: row.driver_phone,
    status: row.status,
    deliveredAt: row.delivered_at,
    createdAt: row.created_at,
    customerName: row.full_name,
    customerPhone: row.phone,
    deliveryAddress: row.street_address ? `${row.street_address}, ${row.city} - ${row.pincode}` : 'Bengaluru',
    city: row.city || 'Bengaluru',
  }));
};
