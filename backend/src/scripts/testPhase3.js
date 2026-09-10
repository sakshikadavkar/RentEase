import http from 'http';
import app from '../app.js';
import { checkDbConnection } from '../config/database.js';
import { seedDatabase } from './seed.js';
import { ENV } from '../config/env.js';

const runPhase3Tests = async () => {
  console.log('🧪 Starting Phase 3 Admin Backend Verification...');

  const dbHealth = await checkDbConnection();
  console.log('PostgreSQL Connection:', dbHealth);
  if (!dbHealth.connected) {
    throw new Error('PostgreSQL must be connected for Phase 3 test suite');
  }

  // Seed data first
  await seedDatabase();

  const testServer = http.createServer(app);
  await new Promise((resolve) => testServer.listen(51204, '127.0.0.1', resolve));
  const baseUrl = 'http://127.0.0.1:51204/api';
  console.log(`Server listening on ${baseUrl}`);

  try {
    // 1. Admin Login (Using designated ADMIN_EMAIL)
    const adminEmail = (process.env.ADMIN_EMAIL || ENV.ADMIN_EMAIL || 'sakshikadavkar171@gmail.com').toLowerCase().trim();
    const adminLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminEmail, password: 'Password123!' }),
    });
    const adminLoginData = await adminLoginRes.json();
    console.log('1. Admin Logged In:', adminLoginData.success, 'Role:', adminLoginData.data?.user?.role);
    if (!adminLoginData.success || adminLoginData.data?.user?.role !== 'admin') {
      throw new Error('Admin login failed');
    }
    const adminToken = adminLoginData.data.token;

    // 2. Customer Login
    const custLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alex.morgan@example.com', password: 'Password123!' }),
    });
    const custLoginData = await custLoginRes.json();
    console.log('2. Customer Logged In:', custLoginData.success, 'Role:', custLoginData.data?.user?.role);
    const customerToken = custLoginData.data.token;

    // 3. Security Test: Customer accessing /api/admin/dashboard must receive 403 Forbidden
    const forbiddenRes = await fetch(`${baseUrl}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    console.log('3. Customer -> Admin API Status:', forbiddenRes.status, '(Expected 403)');
    if (forbiddenRes.status !== 403) {
      throw new Error(`Expected 403 Forbidden for customer, got ${forbiddenRes.status}`);
    }

    // 4. Security Test: Unauthenticated accessing /api/admin/dashboard must receive 401
    const unauthRes = await fetch(`${baseUrl}/admin/dashboard`);
    console.log('4. Unauthenticated -> Admin API Status:', unauthRes.status, '(Expected 401)');
    if (unauthRes.status !== 401) {
      throw new Error(`Expected 401 Unauthorized, got ${unauthRes.status}`);
    }

    // 5. Admin Dashboard Metrics
    const dashRes = await fetch(`${baseUrl}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const dashData = await dashRes.json();
    console.log('5. Admin Dashboard Metrics:', {
      status: dashRes.status,
      totalUsers: dashData.data?.metrics?.totalUsers,
      totalProducts: dashData.data?.metrics?.totalProducts,
      activeRentals: dashData.data?.metrics?.activeRentals,
      mrr: dashData.data?.metrics?.mrr,
      utilizationRate: dashData.data?.metrics?.inventory?.utilizationRate,
    });
    if (dashRes.status !== 200 || !dashData.data?.metrics?.totalProducts) {
      throw new Error('Dashboard metrics query failed');
    }

    // 6. Admin Analytics
    const analyticsRes = await fetch(`${baseUrl}/admin/analytics`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const analyticsData = await analyticsRes.json();
    console.log('6. Admin Analytics Status:', analyticsRes.status, 'Total Revenue:', analyticsData.data?.revenue?.totalRevenue);
    if (analyticsRes.status !== 200) throw new Error('Analytics API failed');

    // 7. Admin Users List
    const usersRes = await fetch(`${baseUrl}/admin/users?limit=5`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const usersData = await usersRes.json();
    console.log('7. Admin Users Count:', usersData.data?.users?.length, 'Total:', usersData.data?.pagination?.total);
    if (usersRes.status !== 200) throw new Error('Admin users query failed');

    // 8. Admin Products List (Check 903 products accessible)
    const prodsRes = await fetch(`${baseUrl}/admin/products?limit=10`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const prodsData = await prodsRes.json();
    console.log('8. Admin Products Total in DB:', prodsData.data?.pagination?.total, '(Expected >= 903)');
    if (prodsRes.status !== 200 || prodsData.data?.pagination?.total < 903) {
      throw new Error('Product management DB query failed or catalog count mismatch');
    }

    // 9. Admin Inventory Management
    const invRes = await fetch(`${baseUrl}/admin/inventory`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const invData = await invRes.json();
    console.log('9. Admin Inventory Units:', invData.data?.units?.length, 'Summary:', invData.data?.summary);
    if (invRes.status !== 200) throw new Error('Inventory API failed');

    // 10. Admin Orders List
    const ordersRes = await fetch(`${baseUrl}/admin/orders`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const ordersData = await ordersRes.json();
    console.log('10. Admin Orders Total:', ordersData.data?.pagination?.total);
    if (ordersRes.status !== 200) throw new Error('Orders API failed');

    // 11. Admin Rentals List
    const rentalsRes = await fetch(`${baseUrl}/admin/rentals`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const rentalsData = await rentalsRes.json();
    console.log('11. Admin Rentals Total:', rentalsData.data?.pagination?.total);
    if (rentalsRes.status !== 200) throw new Error('Rentals API failed');

    // 12. Admin Deliveries List
    const deliveriesRes = await fetch(`${baseUrl}/admin/deliveries`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const deliveriesData = await deliveriesRes.json();
    console.log('12. Admin Deliveries Total:', deliveriesData.data?.pagination?.total);
    if (deliveriesRes.status !== 200) throw new Error('Deliveries API failed');

    // 13. Admin Maintenance Tickets
    const maintRes = await fetch(`${baseUrl}/admin/maintenance`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const maintData = await maintRes.json();
    console.log('13. Admin Maintenance Tickets:', maintData.data?.tickets?.length);
    if (maintRes.status !== 200) throw new Error('Maintenance API failed');

    // 14. Admin Returns List
    const returnsRes = await fetch(`${baseUrl}/admin/returns`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const returnsData = await returnsRes.json();
    console.log('14. Admin Returns Total:', returnsData.data?.pagination?.total);
    if (returnsRes.status !== 200) throw new Error('Returns API failed');

    // 15. Admin Service Areas
    const saRes = await fetch(`${baseUrl}/admin/service-areas`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const saData = await saRes.json();
    console.log('15. Admin Service Areas Total:', saData.data?.length);
    if (saRes.status !== 200 || saData.data?.length < 12) throw new Error('Service areas API failed');

    console.log('\n🎉 ALL PHASE 3 BACKEND APIS, RBAC GUARDS, AND POSTGRESQL PERSISTENCE TESTS PASSED!');
  } finally {
    testServer.close();
  }
};

runPhase3Tests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Phase 3 Tests Failed:', err);
    process.exit(1);
  });
