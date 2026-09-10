import { getPool } from '../config/database.js';
import { PRODUCTS } from '../../../src/constants/theme.js';

const getProductFallback = (productId) => {
  return PRODUCTS.find((p) => p.id === productId) || null;
};

export const getUserRentals = async (userId, statusFilter = 'all') => {
  const pool = getPool();
  if (!pool) {
    throw new Error('Database connection pool is not configured');
  }

  let query = `
    SELECT 
      r.id,
      r.rental_number,
      r.order_id,
      r.user_id,
      r.product_id,
      r.tenure_months,
      r.monthly_rent,
      r.deposit_paid,
      r.start_date,
      r.end_date,
      r.next_billing_date,
      r.status,
      r.delivery_address,
      r.delivery_slot,
      r.delivery_status,
      r.created_at,
      r.updated_at,
      p.name as product_name,
      p.category as product_category,
      p.image as product_image,
      p.badge as product_badge,
      ret.id as return_id,
      ret.return_number,
      ret.status as return_status,
      ret.pickup_date,
      ret.pickup_slot,
      ret.deposit_refund_amount,
      ret.deposit_refund_status,
      ret.is_early_termination,
      ret.early_termination_fee,
      ret.damage_deduction,
      ext.id as latest_extension_id,
      ext.additional_months as last_extended_months,
      ext.new_end_date as extended_end_date
    FROM rentals r
    LEFT JOIN products p ON r.product_id = p.id
    LEFT JOIN LATERAL (
      SELECT * FROM returns 
      WHERE rental_id = r.id 
      ORDER BY created_at DESC 
      LIMIT 1
    ) ret ON TRUE
    LEFT JOIN LATERAL (
      SELECT * FROM rental_extensions 
      WHERE rental_id = r.id 
      ORDER BY created_at DESC 
      LIMIT 1
    ) ext ON TRUE
    WHERE r.user_id = $1
  `;

  const params = [userId];

  if (statusFilter && statusFilter !== 'all') {
    if (statusFilter === 'active') {
      query += ` AND r.status IN ('active', 'extended')`;
    } else if (statusFilter === 'extended') {
      query += ` AND r.status = 'extended'`;
    } else if (statusFilter === 'return_requested') {
      query += ` AND (r.status = 'return_requested' OR ret.status = 'requested' OR ret.status = 'pickup_scheduled')`;
    } else if (statusFilter === 'completed') {
      query += ` AND (r.status = 'completed' OR ret.status = 'completed')`;
    } else if (statusFilter === 'cancelled' || statusFilter === 'terminated') {
      query += ` AND r.status IN ('cancelled', 'terminated')`;
    } else {
      query += ` AND r.status = $2`;
      params.push(statusFilter);
    }
  }

  query += ` ORDER BY r.created_at DESC`;

  const result = await pool.query(query, params);

  return result.rows.map((row) => {
    const fallbackProd = !row.product_name ? getProductFallback(row.product_id) : null;
    return {
      id: row.id,
      rentalNumber: row.rental_number,
      orderId: row.order_id,
      userId: row.user_id,
      productId: row.product_id,
      productName: row.product_name || fallbackProd?.name || fallbackProd?.title || 'RentEase Item',
      productCategory: row.product_category || fallbackProd?.category || 'Furniture & Appliances',
      productImage: row.product_image || fallbackProd?.image || '',
      badge: row.product_badge || fallbackProd?.badge || null,
      tenureMonths: row.tenure_months,
      monthlyRent: parseFloat(row.monthly_rent),
      depositPaid: parseFloat(row.deposit_paid),
      startDate: row.start_date,
      endDate: row.end_date,
      nextBillingDate: row.next_billing_date,
      status: row.status,
      deliveryAddress: row.delivery_address,
      deliverySlot: row.delivery_slot,
      deliveryStatus: row.delivery_status || 'delivered',
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      returnDetails: row.return_id ? {
        id: row.return_id,
        returnNumber: row.return_number,
        status: row.return_status,
        pickupDate: row.pickup_date,
        pickupSlot: row.pickup_slot,
        depositRefundAmount: parseFloat(row.deposit_refund_amount || 0),
        depositRefundStatus: row.deposit_refund_status,
        isEarlyTermination: row.is_early_termination,
        earlyTerminationFee: parseFloat(row.early_termination_fee || 0),
        damageDeduction: parseFloat(row.damage_deduction || 0),
      } : null,
      latestExtension: row.latest_extension_id ? {
        id: row.latest_extension_id,
        additionalMonths: row.last_extended_months,
        newEndDate: row.extended_end_date,
      } : null,
    };
  });
};

export const getRentalById = async (rentalId, userId, userRole = 'customer') => {
  const pool = getPool();
  if (!pool) {
    throw new Error('Database connection pool is not configured');
  }

  const isNumeric = !isNaN(Number(rentalId));
  let whereClause = isNumeric ? 'r.id = $1' : 'r.rental_number = $1';
  const params = [isNumeric ? parseInt(rentalId, 10) : rentalId];

  if (userRole !== 'admin') {
    whereClause += ` AND r.user_id = $2`;
    params.push(userId);
  }

  const rentalQuery = `
    SELECT 
      r.*,
      p.name as product_name,
      p.category as product_category,
      p.subcategory as product_subcategory,
      p.description as product_description,
      p.image as product_image,
      p.gallery as product_gallery,
      p.specifications as product_specifications,
      p.features as product_features,
      p.rating as product_rating,
      u.name as user_name,
      u.email as user_email,
      u.phone as user_phone
    FROM rentals r
    LEFT JOIN products p ON r.product_id = p.id
    LEFT JOIN users u ON r.user_id = u.id
    WHERE ${whereClause}
  `;

  const rentalRes = await pool.query(rentalQuery, params);
  if (rentalRes.rows.length === 0) {
    return null;
  }

  const r = rentalRes.rows[0];
  const actualRentalId = r.id;

  // 1. Fetch extensions history
  const extensionsRes = await pool.query(
    `SELECT * FROM rental_extensions WHERE rental_id = $1 ORDER BY created_at DESC`,
    [actualRentalId]
  );

  // 2. Fetch return records
  const returnsRes = await pool.query(
    `SELECT * FROM returns WHERE rental_id = $1 ORDER BY created_at DESC`,
    [actualRentalId]
  );

  // 3. Fetch damage claims if any
  const damageRes = await pool.query(
    `SELECT * FROM damage_claims WHERE rental_id = $1 ORDER BY created_at DESC`,
    [actualRentalId]
  );

  // 4. Fetch maintenance tickets
  const ticketsRes = await pool.query(
    `SELECT * FROM maintenance_tickets WHERE rental_id = $1 ORDER BY created_at DESC`,
    [actualRentalId]
  );

  // 5. Fetch delivery details from order
  let deliveryInfo = null;
  if (r.order_id) {
    const deliveryRes = await pool.query(
      `SELECT * FROM deliveries WHERE order_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [r.order_id]
    );
    if (deliveryRes.rows.length > 0) {
      deliveryInfo = deliveryRes.rows[0];
    }
  }

  const fallbackProd = !r.product_name ? getProductFallback(r.product_id) : null;

  return {
    id: r.id,
    rentalNumber: r.rental_number,
    orderId: r.order_id,
    userId: r.user_id,
    userName: r.user_name,
    userEmail: r.user_email,
    productId: r.product_id,
    product: {
      id: r.product_id,
      name: r.product_name || fallbackProd?.name || fallbackProd?.title || 'RentEase Item',
      category: r.product_category || fallbackProd?.category || 'Furniture',
      subcategory: r.product_subcategory || fallbackProd?.subcategory || '',
      description: r.product_description || fallbackProd?.description || '',
      image: r.product_image || fallbackProd?.image || '',
      gallery: r.product_gallery || fallbackProd?.gallery || [],
      specifications: r.product_specifications || fallbackProd?.specifications || {},
      features: r.product_features || fallbackProd?.features || [],
      rating: parseFloat(r.product_rating || fallbackProd?.rating || 4.5),
    },
    tenureMonths: r.tenure_months,
    monthlyRent: parseFloat(r.monthly_rent),
    depositPaid: parseFloat(r.deposit_paid),
    startDate: r.start_date,
    endDate: r.end_date,
    nextBillingDate: r.next_billing_date,
    status: r.status,
    deliveryAddress: r.delivery_address,
    deliverySlot: r.delivery_slot,
    deliveryStatus: r.delivery_status || 'delivered',
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    delivery: deliveryInfo ? {
      id: deliveryInfo.id,
      trackingNumber: deliveryInfo.tracking_number,
      scheduledDate: deliveryInfo.scheduled_date,
      timeSlot: deliveryInfo.time_slot,
      driverName: deliveryInfo.driver_name,
      driverPhone: deliveryInfo.driver_phone,
      status: deliveryInfo.status,
      deliveredAt: deliveryInfo.delivered_at,
    } : null,
    extensions: extensionsRes.rows.map((ext) => ({
      id: ext.id,
      previousEndDate: ext.previous_end_date,
      newEndDate: ext.new_end_date,
      additionalMonths: ext.additional_months,
      adjustedMonthlyRent: parseFloat(ext.adjusted_monthly_rent),
      createdAt: ext.created_at,
    })),
    returns: returnsRes.rows.map((ret) => ({
      id: ret.id,
      returnNumber: ret.return_number,
      pickupDate: ret.pickup_date,
      pickupSlot: ret.pickup_slot,
      status: ret.status,
      returnReason: ret.return_reason,
      isEarlyTermination: ret.is_early_termination,
      earlyTerminationFee: parseFloat(ret.early_termination_fee || 0),
      damageDeduction: parseFloat(ret.damage_deduction || 0),
      depositRefundAmount: parseFloat(ret.deposit_refund_amount || 0),
      depositRefundStatus: ret.deposit_refund_status,
      notes: ret.notes,
      inspectionNotes: ret.inspection_notes,
      createdAt: ret.created_at,
      updatedAt: ret.updated_at,
    })),
    damageClaims: damageRes.rows.map((dmg) => ({
      id: dmg.id,
      claimNumber: dmg.claim_number,
      damageDescription: dmg.damage_description,
      assessedRepairCost: parseFloat(dmg.assessed_repair_cost),
      depositDeductionAmount: parseFloat(dmg.deposit_deduction_amount),
      customerDisputeNotes: dmg.customer_dispute_notes,
      createdAt: dmg.created_at,
    })),
    maintenanceTickets: ticketsRes.rows.map((tkt) => ({
      id: tkt.id,
      ticketNumber: tkt.ticket_number,
      issueCategory: tkt.issue_category,
      description: tkt.description,
      urgency: tkt.urgency,
      status: tkt.status,
      resolutionNotes: tkt.resolution_notes,
      createdAt: tkt.created_at,
      resolvedAt: tkt.resolved_at,
    })),
  };
};

export const extendRental = async (rentalId, userId, { additionalMonths = 3, userRole = 'customer' }) => {
  const pool = getPool();
  if (!pool) {
    throw new Error('Database connection pool is not configured');
  }

  const monthsToAdd = parseInt(additionalMonths, 10);
  if (isNaN(monthsToAdd) || monthsToAdd < 1 || monthsToAdd > 24) {
    const err = new Error('Invalid extension duration. Please select between 1 and 24 months.');
    err.statusCode = 400;
    err.isOperational = true;
    throw err;
  }

  const isNumeric = !isNaN(Number(rentalId));
  let findQuery = isNumeric ? 'SELECT * FROM rentals WHERE id = $1' : 'SELECT * FROM rentals WHERE rental_number = $1';
  const params = [isNumeric ? parseInt(rentalId, 10) : rentalId];

  if (userRole !== 'admin') {
    findQuery += ' AND user_id = $2';
    params.push(userId);
  }

  const rentalRes = await pool.query(findQuery, params);
  if (rentalRes.rows.length === 0) {
    const err = new Error('Rental not found or access denied');
    err.statusCode = 404;
    err.isOperational = true;
    throw err;
  }

  const rental = rentalRes.rows[0];

  if (!['active', 'extended'].includes(rental.status)) {
    const err = new Error(`Cannot extend a rental with status '${rental.status}'. Only active rentals can be extended.`);
    err.statusCode = 400;
    err.isOperational = true;
    throw err;
  }

  // Calculate new end date
  const prevEndDate = new Date(rental.end_date);
  const newEndDate = new Date(prevEndDate);
  newEndDate.setMonth(newEndDate.getMonth() + monthsToAdd);

  const currentRent = parseFloat(rental.monthly_rent);
  // Apply a tenure loyalty discount if extending for >= 6 months
  const adjustedRent = monthsToAdd >= 6 ? Math.round(currentRent * 0.95) : currentRent;

  // Begin Transaction
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Insert extension record
    const extInsert = await client.query(
      `INSERT INTO rental_extensions (
        rental_id, previous_end_date, new_end_date, additional_months, adjusted_monthly_rent
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [rental.id, rental.end_date, newEndDate.toISOString().split('T')[0], monthsToAdd, adjustedRent]
    );

    // 2. Update rental record
    const newTotalTenure = (rental.tenure_months || 0) + monthsToAdd;
    await client.query(
      `UPDATE rentals SET 
        end_date = $1,
        tenure_months = $2,
        monthly_rent = $3,
        status = 'extended',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4`,
      [newEndDate.toISOString().split('T')[0], newTotalTenure, adjustedRent, rental.id]
    );

    await client.query('COMMIT');

    const extension = extInsert.rows[0];
    return {
      success: true,
      message: `Rental subscription successfully extended by ${monthsToAdd} months until ${newEndDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}.`,
      rentalId: rental.id,
      rentalNumber: rental.rental_number,
      previousEndDate: rental.end_date,
      newEndDate: newEndDate.toISOString().split('T')[0],
      additionalMonths: monthsToAdd,
      monthlyRent: adjustedRent,
      extensionId: extension.id,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const requestRentalReturn = async (rentalId, userId, {
  returnReason = 'Tenure complete / No longer required',
  pickupDate,
  pickupSlot = 'Morning (9 AM - 1 PM)',
  notes = '',
  userRole = 'customer'
}) => {
  const pool = getPool();
  if (!pool) {
    throw new Error('Database connection pool is not configured');
  }

  const isNumeric = !isNaN(Number(rentalId));
  let findQuery = isNumeric ? 'SELECT * FROM rentals WHERE id = $1' : 'SELECT * FROM rentals WHERE rental_number = $1';
  const params = [isNumeric ? parseInt(rentalId, 10) : rentalId];

  if (userRole !== 'admin') {
    findQuery += ' AND user_id = $2';
    params.push(userId);
  }

  const rentalRes = await pool.query(findQuery, params);
  if (rentalRes.rows.length === 0) {
    const err = new Error('Rental not found or access denied');
    err.statusCode = 404;
    err.isOperational = true;
    throw err;
  }

  const rental = rentalRes.rows[0];

  if (rental.status === 'cancelled' || rental.status === 'completed' || rental.status === 'terminated') {
    const err = new Error(`Rental is already ${rental.status}`);
    err.statusCode = 400;
    err.isOperational = true;
    throw err;
  }

  // Check for duplicate active return request
  const existingReturn = await pool.query(
    `SELECT id, return_number, status FROM returns WHERE rental_id = $1 AND status IN ('requested', 'pickup_scheduled')`,
    [rental.id]
  );

  if (existingReturn.rows.length > 0) {
    const err = new Error(`A return request (${existingReturn.rows[0].return_number}) is already pending for this rental.`);
    err.statusCode = 409;
    err.isOperational = true;
    throw err;
  }

  // Calculate pickup date
  const targetPickupDate = pickupDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const returnNumber = `RET-${Math.floor(100000 + Math.random() * 900000)}`;
  const depositRefund = parseFloat(rental.deposit_paid || 0);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Insert return record
    const returnInsert = await client.query(
      `INSERT INTO returns (
        return_number, rental_id, user_id, pickup_date, pickup_slot,
        return_reason, notes, status, deposit_refund_amount, deposit_refund_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'requested', $8, 'pending')
      RETURNING *`,
      [returnNumber, rental.id, rental.user_id, targetPickupDate, pickupSlot, returnReason, notes, depositRefund]
    );

    // 2. Update rental status
    await client.query(
      `UPDATE rentals SET status = 'return_requested', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [rental.id]
    );

    await client.query('COMMIT');

    const retRecord = returnInsert.rows[0];
    return {
      success: true,
      message: 'Return request submitted successfully. Our logistics team will arrive for pickup on the scheduled date.',
      returnId: retRecord.id,
      returnNumber: retRecord.return_number,
      rentalId: rental.id,
      rentalNumber: rental.rental_number,
      pickupDate: targetPickupDate,
      pickupSlot,
      depositRefundAmount: depositRefund,
      depositRefundStatus: 'pending',
      returnStatus: 'requested',
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const terminateRentalEarly = async (rentalId, userId, {
  reason = 'Relocating city / Early lease cancellation',
  pickupDate,
  pickupSlot = 'Morning (9 AM - 1 PM)',
  notes = '',
  userRole = 'customer'
}) => {
  const pool = getPool();
  if (!pool) {
    throw new Error('Database connection pool is not configured');
  }

  const isNumeric = !isNaN(Number(rentalId));
  let findQuery = isNumeric ? 'SELECT * FROM rentals WHERE id = $1' : 'SELECT * FROM rentals WHERE rental_number = $1';
  const params = [isNumeric ? parseInt(rentalId, 10) : rentalId];

  if (userRole !== 'admin') {
    findQuery += ' AND user_id = $2';
    params.push(userId);
  }

  const rentalRes = await pool.query(findQuery, params);
  if (rentalRes.rows.length === 0) {
    const err = new Error('Rental not found or access denied');
    err.statusCode = 404;
    err.isOperational = true;
    throw err;
  }

  const rental = rentalRes.rows[0];

  if (!['active', 'extended'].includes(rental.status)) {
    const err = new Error(`Cannot terminate a rental with status '${rental.status}'`);
    err.statusCode = 400;
    err.isOperational = true;
    throw err;
  }

  // Simple, transparent early termination calculation:
  // Standard early closure fee: ₹499 (or 50% of 1 month's rent, capped at ₹999)
  const monthlyRent = parseFloat(rental.monthly_rent || 0);
  const earlyFee = Math.min(999, Math.max(499, Math.round(monthlyRent * 0.3)));
  const depositPaid = parseFloat(rental.deposit_paid || 0);
  const expectedRefund = Math.max(0, depositPaid - earlyFee);

  const targetPickupDate = pickupDate || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const returnNumber = `TRM-${Math.floor(100000 + Math.random() * 900000)}`;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Insert return record marked as early termination
    const returnInsert = await client.query(
      `INSERT INTO returns (
        return_number, rental_id, user_id, pickup_date, pickup_slot,
        return_reason, notes, is_early_termination, early_termination_fee,
        deposit_refund_amount, deposit_refund_status, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE, $8, $9, 'pending', 'requested')
      RETURNING *`,
      [
        returnNumber,
        rental.id,
        rental.user_id,
        targetPickupDate,
        pickupSlot,
        `[Early Termination] ${reason}`,
        notes,
        earlyFee,
        expectedRefund,
      ]
    );

    // 2. Update rental status to terminated
    await client.query(
      `UPDATE rentals SET status = 'terminated', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [rental.id]
    );

    await client.query('COMMIT');

    const retRecord = returnInsert.rows[0];
    return {
      success: true,
      message: 'Early termination request initiated successfully.',
      returnId: retRecord.id,
      returnNumber: retRecord.return_number,
      rentalId: rental.id,
      rentalNumber: rental.rental_number,
      pickupDate: targetPickupDate,
      pickupSlot,
      depositPaid,
      earlyTerminationFee: earlyFee,
      expectedDepositRefund: expectedRefund,
      refundStatus: 'pending',
      status: 'terminated',
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};
