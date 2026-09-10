import { getPool } from '../config/database.js';
import { PRODUCTS } from '../../../src/constants/theme.js';

const getProductFallback = (productId) => {
  return PRODUCTS.find((p) => p.id === productId) || null;
};

export const createTicket = async (userId, {
  rentalId,
  issueCategory = 'Appliance issue',
  description,
  urgency = 'medium',
  preferredTimeSlot = 'Morning (9 AM - 1 PM)',
  customerPhone = ''
}) => {
  const pool = getPool();
  if (!pool) {
    throw new Error('Database connection pool is not configured');
  }

  if (!description || description.trim().length < 5) {
    const err = new Error('Please describe the issue in at least 5 characters');
    err.statusCode = 400;
    err.isOperational = true;
    throw err;
  }

  // Validate rental exists and belongs to user
  const isNumeric = !isNaN(Number(rentalId));
  const rentalQuery = isNumeric
    ? 'SELECT id, rental_number, product_id, user_id, status FROM rentals WHERE id = $1 AND user_id = $2'
    : 'SELECT id, rental_number, product_id, user_id, status FROM rentals WHERE rental_number = $1 AND user_id = $2';
  
  const rentalRes = await pool.query(rentalQuery, [isNumeric ? parseInt(rentalId, 10) : rentalId, userId]);
  
  if (rentalRes.rows.length === 0) {
    const err = new Error('Active rental not found or access denied');
    err.statusCode = 404;
    err.isOperational = true;
    throw err;
  }

  const rental = rentalRes.rows[0];
  const ticketNumber = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;

  const result = await pool.query(
    `INSERT INTO maintenance_tickets (
      ticket_number, rental_id, user_id, issue_category, description,
      urgency, preferred_time_slot, customer_phone, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'open')
    RETURNING *`,
    [
      ticketNumber,
      rental.id,
      userId,
      issueCategory,
      description.trim(),
      ['low', 'medium', 'high', 'critical'].includes(urgency.toLowerCase()) ? urgency.toLowerCase() : 'medium',
      preferredTimeSlot,
      customerPhone,
    ]
  );

  const ticket = result.rows[0];
  return {
    id: ticket.id,
    ticketNumber: ticket.ticket_number,
    rentalId: ticket.rental_id,
    rentalNumber: rental.rental_number,
    productId: rental.product_id,
    issueCategory: ticket.issue_category,
    description: ticket.description,
    urgency: ticket.urgency,
    status: ticket.status,
    preferredTimeSlot: ticket.preferred_time_slot,
    createdAt: ticket.created_at,
    timeline: [
      {
        stage: 'Submitted',
        title: 'Service Request Submitted',
        description: 'Your maintenance ticket has been registered in the system.',
        completed: true,
        timestamp: ticket.created_at,
      },
      {
        stage: 'Acknowledged',
        title: 'Diagnostics Review',
        description: 'RentEase service coordinator is reviewing issue category & spare parts.',
        completed: false,
        timestamp: null,
      },
      {
        stage: 'Technician Assigned',
        title: 'Technician Assignment',
        description: 'Certified brand technician will be scheduled for your slot.',
        completed: false,
        timestamp: null,
      },
      {
        stage: 'In Progress',
        title: 'On-Site Repair / Service',
        description: 'Technician visit and doorstep maintenance.',
        completed: false,
        timestamp: null,
      },
      {
        stage: 'Resolved',
        title: 'Resolved & Closed',
        description: 'Issue verified and resolved with 100% free warranty coverage.',
        completed: false,
        timestamp: null,
      },
    ],
  };
};

export const getUserTickets = async (userId, { rentalId, status, userRole = 'customer' } = {}) => {
  const pool = getPool();
  if (!pool) {
    throw new Error('Database connection pool is not configured');
  }

  let query = `
    SELECT 
      t.*,
      r.rental_number,
      r.product_id,
      r.delivery_address,
      p.name as product_name,
      p.category as product_category,
      p.image as product_image,
      tech.name as technician_name,
      tech.phone as technician_phone
    FROM maintenance_tickets t
    JOIN rentals r ON t.rental_id = r.id
    LEFT JOIN products p ON r.product_id = p.id
    LEFT JOIN users tech ON t.technician_id = tech.id
    WHERE 1=1
  `;

  const params = [];
  let paramIdx = 1;

  if (userRole !== 'admin') {
    query += ` AND t.user_id = $${paramIdx++}`;
    params.push(userId);
  }

  if (rentalId) {
    const isNumeric = !isNaN(Number(rentalId));
    if (isNumeric) {
      query += ` AND t.rental_id = $${paramIdx++}`;
      params.push(parseInt(rentalId, 10));
    } else {
      query += ` AND r.rental_number = $${paramIdx++}`;
      params.push(rentalId);
    }
  }

  if (status) {
    query += ` AND t.status = $${paramIdx}`;
    params.push(status);
  }

  query += ` ORDER BY t.created_at DESC`;

  const result = await pool.query(query, params);

  return result.rows.map((row) => {
    const fallbackProd = !row.product_name ? getProductFallback(row.product_id) : null;
    return {
      id: row.id,
      ticketNumber: row.ticket_number,
      rentalId: row.rental_id,
      rentalNumber: row.rental_number,
      productId: row.product_id,
      productName: row.product_name || fallbackProd?.name || fallbackProd?.title || 'RentEase Item',
      productCategory: row.product_category || fallbackProd?.category || 'Furniture & Appliances',
      productImage: row.product_image || fallbackProd?.image || '',
      issueCategory: row.issue_category,
      description: row.description,
      urgency: row.urgency,
      status: row.status,
      preferredTimeSlot: row.preferred_time_slot,
      technicianName: row.technician_name,
      technicianPhone: row.technician_phone,
      resolutionNotes: row.resolution_notes,
      resolvedAt: row.resolved_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  });
};

export const getTicketById = async (ticketId, userId, userRole = 'customer') => {
  const pool = getPool();
  if (!pool) {
    throw new Error('Database connection pool is not configured');
  }

  const isNumeric = !isNaN(Number(ticketId));
  let whereClause = isNumeric ? 't.id = $1' : 't.ticket_number = $1';
  const params = [isNumeric ? parseInt(ticketId, 10) : ticketId];

  if (userRole !== 'admin') {
    whereClause += ` AND t.user_id = $2`;
    params.push(userId);
  }

  const query = `
    SELECT 
      t.*,
      r.rental_number,
      r.product_id,
      r.delivery_address,
      r.start_date as rental_start_date,
      p.name as product_name,
      p.category as product_category,
      p.image as product_image,
      tech.name as technician_name,
      tech.phone as technician_phone
    FROM maintenance_tickets t
    JOIN rentals r ON t.rental_id = r.id
    LEFT JOIN products p ON r.product_id = p.id
    LEFT JOIN users tech ON t.technician_id = tech.id
    WHERE ${whereClause}
  `;

  const result = await pool.query(query, params);
  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  const fallbackProd = !row.product_name ? getProductFallback(row.product_id) : null;

  // Build real status timeline stages
  const statusLevels = {
    open: 1,
    assigned: 2,
    in_progress: 3,
    resolved: 4,
    closed: 5,
  };

  const currentLevel = statusLevels[row.status] || 1;

  const timeline = [
    {
      stage: 'Submitted',
      title: 'Service Request Raised',
      description: 'Ticket registered by customer with issue details.',
      completed: currentLevel >= 1,
      current: currentLevel === 1,
      timestamp: row.created_at,
    },
    {
      stage: 'Acknowledged',
      title: 'Review & Diagnostics',
      description: 'Service operations verified warranty & assigned priority.',
      completed: currentLevel >= 2,
      current: currentLevel === 2,
      timestamp: currentLevel >= 2 ? row.updated_at : null,
    },
    {
      stage: 'Technician Assigned',
      title: row.technician_name ? `Technician Assigned: ${row.technician_name}` : 'Technician Dispatch',
      description: row.technician_phone ? `Contact: ${row.technician_phone}` : 'Technician scheduled for slot.',
      completed: currentLevel >= 3,
      current: currentLevel === 3,
      timestamp: currentLevel >= 3 ? row.updated_at : null,
    },
    {
      stage: 'In Progress',
      title: 'Doorstep Service Visit',
      description: 'Physical inspection and repairs under free maintenance guarantee.',
      completed: currentLevel >= 4,
      current: currentLevel === 4,
      timestamp: currentLevel >= 4 ? row.updated_at : null,
    },
    {
      stage: 'Resolved',
      title: 'Maintenance Completed',
      description: row.resolution_notes || 'All issues successfully resolved.',
      completed: currentLevel >= 5,
      current: currentLevel === 5,
      timestamp: row.resolved_at || (currentLevel >= 5 ? row.updated_at : null),
    },
  ];

  return {
    id: row.id,
    ticketNumber: row.ticket_number,
    rentalId: row.rental_id,
    rentalNumber: row.rental_number,
    productId: row.product_id,
    productName: row.product_name || fallbackProd?.name || fallbackProd?.title || 'RentEase Item',
    productCategory: row.product_category || fallbackProd?.category || 'Furniture & Appliances',
    productImage: row.product_image || fallbackProd?.image || '',
    issueCategory: row.issue_category,
    description: row.description,
    urgency: row.urgency,
    status: row.status,
    preferredTimeSlot: row.preferred_time_slot,
    technicianName: row.technician_name,
    technicianPhone: row.technician_phone,
    resolutionNotes: row.resolution_notes,
    resolvedAt: row.resolved_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    timeline,
  };
};
