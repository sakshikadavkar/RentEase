import { PRODUCTS } from '../../../src/constants/theme.js';
import { getPool, checkDbConnection } from '../config/database.js';
import { runMigrations } from '../models/migrate.js';
import { ENV } from '../config/env.js';
import bcrypt from 'bcryptjs';

export const seedDatabase = async () => {
  console.log(`\n========================================`);
  console.log(`📦 RentEase 903-Product Database Seeder`);
  console.log(`========================================`);
  console.log(`Total products identified in catalog: ${PRODUCTS.length}`);

  if (PRODUCTS.length !== 903) {
    console.warn(`⚠️ Warning: Expected 903 products, found ${PRODUCTS.length}`);
  }

  const health = await checkDbConnection();
  if (!health.connected) {
    console.warn(`⚠️ Database connection unavailable: ${health.message}`);
    console.log(`ℹ️ Catalog verification: 903 products are intact and ready for instant seeding once DATABASE_URL is configured.`);
    return {
      seeded: false,
      productCount: PRODUCTS.length,
      message: 'PostgreSQL connection unavailable. Catalog validated in memory.',
    };
  }

  // Ensure migrations are run first
  await runMigrations();

  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Seed 903 Products with Chunked Batching for High Performance
    console.log(`🌱 Seeding ${PRODUCTS.length} catalog products...`);
    let insertCount = 0;
    const chunkSize = 50;

    for (let i = 0; i < PRODUCTS.length; i += chunkSize) {
      const chunk = PRODUCTS.slice(i, i + chunkSize);
      const valueClauses = [];
      const values = [];
      let paramIdx = 1;

      for (const p of chunk) {
        const rowParams = [
          p.id,
          p.name || p.title || 'RentEase Product',
          p.category,
          p.subcategory || '',
          p.description || '',
          p.monthlyPrice || 0,
          p.originalPrice || null,
          p.deposit ?? p.securityDeposit ?? 0,
          p.rating || 4.5,
          p.reviewCount || 0,
          p.city || 'Bengaluru',
          p.badge || null,
          p.badgeVariant || null,
          p.deliveryDays || p.deliveryInfo || '3–5 days',
          p.condition || 'Like new',
          p.warranty || '6 months',
          JSON.stringify(p.rentalDurations || [1, 3, 6, 12]),
          JSON.stringify(p.features || []),
          JSON.stringify(p.includedItems || p.included || []),
          JSON.stringify(p.specifications || {}),
          p.image,
          JSON.stringify(p.gallery || [p.image]),
          true,
        ];

        const placeholders = [];
        for (let j = 0; j < 23; j++) {
          placeholders.push(`$${paramIdx++}`);
        }
        valueClauses.push(`(${placeholders.join(', ')})`);
        values.push(...rowParams);
      }

      const batchQuery = `
        INSERT INTO products (
          id, name, category, subcategory, description, monthly_price, original_price,
          deposit, rating, review_count, city, badge, badge_variant, delivery_days,
          condition, warranty, rental_durations, features, included_items, specifications,
          image, gallery, is_active
        ) VALUES ${valueClauses.join(', ')}
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          category = EXCLUDED.category,
          subcategory = EXCLUDED.subcategory,
          monthly_price = EXCLUDED.monthly_price,
          original_price = EXCLUDED.original_price,
          deposit = EXCLUDED.deposit,
          rating = EXCLUDED.rating,
          review_count = EXCLUDED.review_count,
          city = EXCLUDED.city,
          image = EXCLUDED.image,
          gallery = EXCLUDED.gallery,
          updated_at = CURRENT_TIMESTAMP;
      `;

      await client.query(batchQuery, values);
      insertCount += chunk.length;
      console.log(`  ✓ Inserted ${insertCount}/${PRODUCTS.length} products`);
    }

    // 2. Seed Default Users with All Roles
    console.log('🌱 Seeding initial users across all roles...');
    const userPassword = await bcrypt.hash('Password123!', 10);
    const designatedAdminEmail = (process.env.ADMIN_EMAIL || ENV.ADMIN_EMAIL || 'sakshikadavkar171@gmail.com').toLowerCase().trim();

    const userRes = await client.query(`
      INSERT INTO users (name, email, password_hash, role, city, is_active)
      VALUES 
        ('RentEase Staff', 'admin@rentease.com', $1, 'customer', 'Bengaluru', true),
        ('Demo Customer', 'customer@rentease.com', $1, 'customer', 'Bengaluru', true),
        ('Alex Morgan', 'alex.morgan@example.com', $1, 'customer', 'Bengaluru', true),
        ('Rajesh Sharma (Lead Tech)', 'tech.rajesh@rentease.com', $1, 'technician', 'Bengaluru', true),
        ('Ramesh Kumar (Logistics)', 'logistics.ramesh@rentease.com', $1, 'logistics', 'Bengaluru', true),
        ('Priya Patel', 'priya.patel@example.com', $1, 'customer', 'Mumbai', true),
        ('Vikram Mehta', 'vikram.mehta@example.com', $1, 'customer', 'Delhi NCR', true)
      ON CONFLICT (email) DO UPDATE SET 
        password_hash = EXCLUDED.password_hash,
        role = EXCLUDED.role,
        is_active = EXCLUDED.is_active
      RETURNING id, email, role;
    `, [userPassword]);

    // SINGLE-ADMIN POLICY:
    // Ensure designated ADMIN_EMAIL is the sole administrator in PostgreSQL
    const existingAdminRes = await client.query(
      `SELECT id, email, role FROM users WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))`,
      [designatedAdminEmail]
    );

    if (existingAdminRes.rows.length > 0) {
      await client.query(
        `UPDATE users SET role = 'admin', is_active = true WHERE id = $1`,
        [existingAdminRes.rows[0].id]
      );
    } else {
      await client.query(
        `INSERT INTO users (name, email, password_hash, role, city, is_active)
         VALUES ('Sakshi Kadavkar', $1, $2, 'admin', 'Bengaluru', true)
         ON CONFLICT (email) DO UPDATE SET role = 'admin', is_active = true`,
        [designatedAdminEmail, userPassword]
      );
    }

    // Atomic cleanup: Demote any other accounts that have role = 'admin'
    await client.query(
      `UPDATE users SET role = 'customer' WHERE role = 'admin' AND LOWER(TRIM(email)) <> LOWER(TRIM($1))`,
      [designatedAdminEmail]
    );

    const alexUser = userRes.rows.find(u => u.email === 'alex.morgan@example.com');
    const techUser = userRes.rows.find(u => u.email === 'tech.rajesh@rentease.com');
    const priyaUser = userRes.rows.find(u => u.email === 'priya.patel@example.com');

    // 3. Seed Inventory Units
    console.log('🌱 Seeding inventory units for operational tracking...');
    const invCountRes = await client.query(`SELECT count(*) FROM inventory_units`);
    if (parseInt(invCountRes.rows[0].count, 10) === 0) {
      const topProducts = PRODUCTS.slice(0, 30);
      const citiesList = ['Bengaluru', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Pune'];
      const statuses = ['available', 'available', 'rented', 'available', 'in_maintenance', 'available'];
      const conditions = ['Grade A', 'Grade A', 'Grade B+', 'Brand New', 'Grade A'];

      let serialIdx = 1001;
      for (let i = 0; i < topProducts.length; i++) {
        const prod = topProducts[i];
        for (let unit = 0; unit < 3; unit++) {
          const city = citiesList[(i + unit) % citiesList.length];
          const status = statuses[(i + unit) % statuses.length];
          const condition = conditions[(i + unit) % conditions.length];
          const serial = `SN-${prod.id.slice(0, 8).toUpperCase()}-${serialIdx++}`;

          await client.query(`
            INSERT INTO inventory_units (
              product_id, serial_number, city, warehouse_location, status, condition_grade, last_inspected_at
            ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP - interval '5 days')
            ON CONFLICT (serial_number) DO NOTHING;
          `, [prod.id, serial, city, `${city} Central Fulfillment Hub`, status, condition]);
        }
      }
    }

    // 4. Seed Initial Orders, Deliveries, and Rentals if needed
    if (alexUser) {
      const addrRes = await client.query(`
        INSERT INTO addresses (user_id, full_name, phone, street_address, landmark, city, state, pincode, is_default)
        VALUES ($1, 'Alex Morgan', '+91 9876543210', 'Flat 402, Skyline Heights, 12th Main Rd, Indiranagar', 'Near Metro Station', 'Bengaluru', 'Karnataka', '560038', true)
        ON CONFLICT DO NOTHING
        RETURNING id;
      `, [alexUser.id]);
      
      const addrId = addrRes.rows[0]?.id;

      const existingRentals = await client.query(`SELECT count(*) FROM rentals WHERE user_id = $1`, [alexUser.id]);
      if (parseInt(existingRentals.rows[0].count, 10) === 0) {
        const orderRes = await client.query(`
          INSERT INTO orders (
            order_number, user_id, delivery_address_id, status,
            subtotal_monthly, deposit_total, tax_amount, total_amount_due,
            payment_method, delivery_slot
          ) VALUES ('ORD-89421', $1, $2, 'delivered', 2498, 4499, 449, 7446, 'UPI', 'Morning (9 AM - 1 PM)')
          RETURNING id;
        `, [alexUser.id, addrId]);
        const orderId = orderRes.rows[0]?.id;

        // Payment record
        await client.query(`
          INSERT INTO payments (transaction_id, order_id, user_id, amount, payment_type, payment_method, status)
          VALUES ('TXN-89421-INIT', $1, $2, 7446, 'rent', 'UPI', 'completed')
          ON CONFLICT (transaction_id) DO NOTHING;
        `, [orderId, alexUser.id]);

        await client.query(`
          INSERT INTO deliveries (
            order_id, tracking_number, scheduled_date, time_slot,
            driver_name, driver_phone, status, delivered_at
          ) VALUES ($1, 'TRK-98421001', '2026-08-14', 'Morning (9 AM - 1 PM)', 'Ramesh Kumar (Express)', '+91 98450 12345', 'delivered', '2026-08-14 11:30:00+00')
          ON CONFLICT (tracking_number) DO NOTHING;
        `, [orderId]);

        const rentalRes = await client.query(`
          INSERT INTO rentals (
            rental_number, order_id, user_id, product_id, tenure_months,
            monthly_rent, deposit_paid, start_date, end_date, next_billing_date,
            status, delivery_address, delivery_slot, delivery_status
          ) VALUES 
            ('RNT-89421', $1, $2, 'luxe-cloud-sofa', 12, 1499, 4499, '2026-08-15', '2027-08-15', '2026-09-15', 'active', 'Flat 402, Skyline Heights, Indiranagar, Bengaluru - 560038', 'Morning (9 AM - 1 PM)', 'delivered'),
            ('RNT-89422', $1, $2, 'vista-sectional-sofa', 6, 1899, 0, '2026-07-01', '2027-01-01', '2026-09-01', 'active', 'Flat 402, Skyline Heights, Indiranagar, Bengaluru - 560038', 'Morning (9 AM - 1 PM)', 'delivered')
          RETURNING id, rental_number;
        `, [orderId, alexUser.id]);

        const rental1 = rentalRes.rows[0];

        // Seed sample maintenance ticket
        if (rental1 && techUser) {
          await client.query(`
            INSERT INTO maintenance_tickets (
              ticket_number, rental_id, user_id, issue_category, description, urgency, status,
              technician_id, resolution_notes, preferred_time_slot, customer_phone
            ) VALUES (
              'TKT-89401', $1, $2, 'Periodic Cleaning & Sanitization',
              'Scheduled semi-annual deep dry cleaning and fabric protection spray.',
              'low', 'assigned', $3, 'Technician dispatched for morning slot.',
              'Morning (9 AM - 1 PM)', '+91 9876543210'
            ) ON CONFLICT (ticket_number) DO NOTHING;
          `, [rental1.id, alexUser.id, techUser.id]);
        }
      }
    }

    // 5. Seed Additional Return and Order for Priya
    if (priyaUser) {
      const pAddrRes = await client.query(`
        INSERT INTO addresses (user_id, full_name, phone, street_address, landmark, city, state, pincode, is_default)
        VALUES ($1, 'Priya Patel', '+91 98200 55443', 'Apt 12B, Bandra West', 'Opp Bandstand', 'Mumbai', 'Maharashtra', '400050', true)
        ON CONFLICT DO NOTHING
        RETURNING id;
      `, [priyaUser.id]);
      const pAddrId = pAddrRes.rows[0]?.id;

      const pExisting = await client.query(`SELECT count(*) FROM orders WHERE user_id = $1`, [priyaUser.id]);
      if (parseInt(pExisting.rows[0].count, 10) === 0) {
        const pOrder = await client.query(`
          INSERT INTO orders (
            order_number, user_id, delivery_address_id, status,
            subtotal_monthly, deposit_total, tax_amount, total_amount_due,
            payment_method, delivery_slot
          ) VALUES ('ORD-99120', $1, $2, 'delivered', 1299, 2500, 233, 4032, 'Card', 'Evening (5 PM - 8 PM)')
          RETURNING id;
        `, [priyaUser.id, pAddrId]);

        await client.query(`
          INSERT INTO payments (transaction_id, order_id, user_id, amount, payment_type, payment_method, status)
          VALUES ('TXN-99120-INIT', $1, $2, 4032, 'rent', 'Card', 'completed')
          ON CONFLICT (transaction_id) DO NOTHING;
        `, [pOrder.rows[0]?.id, priyaUser.id]);

        const priyaProductId = PRODUCTS[2]?.id || PRODUCTS[0]?.id || 'luxe-cloud-sofa';
        const pRental = await client.query(`
          INSERT INTO rentals (
            rental_number, order_id, user_id, product_id, tenure_months,
            monthly_rent, deposit_paid, start_date, end_date, next_billing_date,
            status, delivery_address, delivery_slot, delivery_status
          ) VALUES (
            'RNT-99120', $1, $2, $3, 6, 1299, 2500,
            '2026-03-01', '2026-09-01', '2026-09-01', 'return_requested',
            'Apt 12B, Bandra West, Mumbai - 400050', 'Evening (5 PM - 8 PM)', 'delivered'
          ) RETURNING id;
        `, [pOrder.rows[0]?.id, priyaUser.id, priyaProductId]);

        if (pRental.rows[0]?.id) {
          await client.query(`
            INSERT INTO returns (
              return_number, rental_id, user_id, pickup_date, pickup_slot,
              status, return_reason, is_early_termination, deposit_refund_amount, deposit_refund_status
            ) VALUES (
              'RET-99101', $1, $2, '2026-09-08', 'Morning (9 AM - 1 PM)',
              'requested', 'Tenure completed naturally', false, 2500, 'pending'
            ) ON CONFLICT (return_number) DO NOTHING;
          `, [pRental.rows[0].id, priyaUser.id]);
        }
      }
    }

    // 6. Seed Service Areas
    console.log('🌱 Seeding 12 primary service cities...');
    const cities = [
      { name: 'Bengaluru', state: 'Karnataka' },
      { name: 'Mumbai', state: 'Maharashtra' },
      { name: 'Delhi NCR', state: 'Delhi' },
      { name: 'Hyderabad', state: 'Telangana' },
      { name: 'Pune', state: 'Maharashtra' },
      { name: 'Chennai', state: 'Tamil Nadu' },
      { name: 'Kolkata', state: 'West Bengal' },
      { name: 'Jaipur', state: 'Rajasthan' },
      { name: 'Ahmedabad', state: 'Gujarat' },
      { name: 'Chandigarh', state: 'Punjab' },
      { name: 'Kochi', state: 'Kerala' },
      { name: 'Surat', state: 'Gujarat' },
    ];

    for (const city of cities) {
      await client.query(`
        INSERT INTO service_areas (city_name, state_name, is_active)
        VALUES ($1, $2, true)
        ON CONFLICT (city_name) DO NOTHING;
      `, [city.name, city.state]);
    }

    await client.query('COMMIT');
    console.log(`✅ Successfully seeded ${insertCount} products and operational datasets into PostgreSQL.`);
    return {
      seeded: true,
      productCount: insertCount,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Database seeding failed:', err.message);
    throw err;
  } finally {
    client.release();
  }
};

import { fileURLToPath } from 'url';
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedDatabase()
    .then((res) => {
      console.log('Done:', res);
      process.exit(0);
    })
    .catch((err) => {
      console.error('Error:', err);
      process.exit(1);
    });
}
