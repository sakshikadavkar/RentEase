import { getPool, checkDbConnection } from '../config/database.js';
import { ENV } from '../config/env.js';

export const promoteDesignatedAdmin = async () => {
  const adminEmail = (process.env.ADMIN_EMAIL || ENV.ADMIN_EMAIL || 'sakshikadavkar171@gmail.com').toLowerCase().trim();

  console.log('🔒 RentEase Single-Admin Enforcement Utility');
  console.log(`Target Designated Admin: ${adminEmail}`);

  const health = await checkDbConnection();
  if (!health.connected) {
    throw new Error(`Database connection failed: ${health.message}`);
  }

  const pool = getPool();
  if (!pool) {
    throw new Error('Database connection pool is not available.');
  }

  // 1. Check if the designated admin account exists in PostgreSQL
  const checkRes = await pool.query(
    'SELECT id, name, email, role, is_active FROM users WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))',
    [adminEmail]
  );

  if (checkRes.rows.length === 0) {
    throw new Error(
      `Admin promotion failed: Account "${adminEmail}" was not found in the PostgreSQL users table. ` +
      `Please register the customer account first.`
    );
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 2. Demote every other admin to customer
    const demoteRes = await client.query(
      `UPDATE users
       SET role = 'customer'
       WHERE role = 'admin'
       AND LOWER(TRIM(email)) <> LOWER(TRIM($1))
       RETURNING id, email`,
      [adminEmail]
    );

    // 3. Promote the designated account to admin
    const promoteRes = await client.query(
      `UPDATE users
       SET role = 'admin'
       WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))
       RETURNING id, name, email, role`,
      [adminEmail]
    );

    await client.query('COMMIT');

    console.log(`✓ Successfully promoted designated admin: ${promoteRes.rows[0].email} (User ID: ${promoteRes.rows[0].id})`);
    if (demoteRes.rows.length > 0) {
      console.log(`✓ Demoted ${demoteRes.rows.length} unauthorized/legacy admin account(s) to customer:`);
      demoteRes.rows.forEach((u) => console.log(`  - Demoted: ${u.email} (ID: ${u.id})`));
    } else {
      console.log('✓ No unauthorized admin accounts needed demotion.');
    }

    // 4. Verify invariant
    const verifyRes = await client.query(
      "SELECT id, email, role FROM users WHERE role = 'admin'"
    );
    console.log(`✓ Current Admin Invariant: Exactly ${verifyRes.rows.length} admin account exists in database:`, verifyRes.rows);

    return {
      success: true,
      admin: promoteRes.rows[0],
      demotedCount: demoteRes.rows.length,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// Direct script execution
if (process.argv[1]?.endsWith('promoteAdmin.js')) {
  promoteDesignatedAdmin()
    .then(() => {
      console.log('🎉 Single-admin enforcement complete.');
      process.exit(0);
    })
    .catch((err) => {
      console.error(`❌ ${err.message}`);
      process.exit(1);
    });
}
