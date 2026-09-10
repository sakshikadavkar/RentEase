import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import app from '../app.js';
import { getPool, checkDbConnection } from '../config/database.js';
import { ENV } from '../config/env.js';
import { seedDatabase } from './seed.js';
import { promoteDesignatedAdmin } from './promoteAdmin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runSecurityTests = async () => {
  console.log('🛡️  Starting RentEase Single-Admin Security Policy Verification Suite...\n');

  const health = await checkDbConnection();
  if (!health.connected) {
    throw new Error('Database must be connected for security tests.');
  }

  // Ensure DB is initialized and seeded under single-admin policy
  await seedDatabase();
  await promoteDesignatedAdmin();

  const testServer = http.createServer(app);
  const testPort = 51206;
  await new Promise((resolve) => testServer.listen(testPort, '127.0.0.1', resolve));
  const baseUrl = `http://127.0.0.1:${testPort}/api`;
  console.log(`Test server running at ${baseUrl}`);

  const pool = getPool();
  const adminEmail = (process.env.ADMIN_EMAIL || ENV.ADMIN_EMAIL || 'sakshikadavkar171@gmail.com').toLowerCase().trim();

  try {
    const timestamp = Date.now();

    // ==========================================
    // Test A: Registration with { role: "admin" }
    // ==========================================
    console.log('\n--- Test A: Public registration with role: "admin" ---');
    const regAdminRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Attacker Attempting Admin',
        email: `exploit.admin.${timestamp}@example.com`,
        password: 'Password123!',
        city: 'Bengaluru',
        role: 'admin',
      }),
    });
    const regAdminData = await regAdminRes.json();
    console.log('Status:', regAdminRes.status, 'Returned Role:', regAdminData.data?.user?.role);
    if (regAdminRes.status !== 201 || regAdminData.data?.user?.role !== 'customer') {
      throw new Error(`Test A Failed: Expected role = 'customer', got '${regAdminData.data?.user?.role}'`);
    }
    console.log('✓ PASS: Request with role: "admin" strictly received role: "customer"');

    // ==========================================
    // Test B: Registration with { role: "technician" }
    // ==========================================
    console.log('\n--- Test B: Public registration with role: "technician" ---');
    const regTechRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Attacker Attempting Tech',
        email: `exploit.tech.${timestamp}@example.com`,
        password: 'Password123!',
        city: 'Mumbai',
        role: 'technician',
      }),
    });
    const regTechData = await regTechRes.json();
    console.log('Status:', regTechRes.status, 'Returned Role:', regTechData.data?.user?.role);
    if (regTechRes.status !== 201 || regTechData.data?.user?.role !== 'customer') {
      throw new Error(`Test B Failed: Expected role = 'customer', got '${regTechData.data?.user?.role}'`);
    }
    console.log('✓ PASS: Request with role: "technician" strictly received role: "customer"');

    // ==========================================
    // Test C: Registration with { role: "logistics" }
    // ==========================================
    console.log('\n--- Test C: Public registration with role: "logistics" ---');
    const regLogRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Attacker Attempting Logistics',
        email: `exploit.logistics.${timestamp}@example.com`,
        password: 'Password123!',
        city: 'Delhi NCR',
        role: 'logistics',
      }),
    });
    const regLogData = await regLogRes.json();
    console.log('Status:', regLogRes.status, 'Returned Role:', regLogData.data?.user?.role);
    if (regLogRes.status !== 201 || regLogData.data?.user?.role !== 'customer') {
      throw new Error(`Test C Failed: Expected role = 'customer', got '${regLogData.data?.user?.role}'`);
    }
    console.log('✓ PASS: Request with role: "logistics" strictly received role: "customer"');

    // ==========================================
    // Test D: Registration without role
    // ==========================================
    console.log('\n--- Test D: Public registration without role field ---');
    const regNoRoleRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Standard Customer',
        email: `normal.user.${timestamp}@example.com`,
        password: 'Password123!',
        city: 'Bengaluru',
      }),
    });
    const regNoRoleData = await regNoRoleRes.json();
    console.log('Status:', regNoRoleRes.status, 'Returned Role:', regNoRoleData.data?.user?.role);
    if (regNoRoleRes.status !== 201 || regNoRoleData.data?.user?.role !== 'customer') {
      throw new Error(`Test D Failed: Expected role = 'customer', got '${regNoRoleData.data?.user?.role}'`);
    }
    console.log('✓ PASS: Standard registration received role: "customer"');

    // ==========================================
    // Test E: ADMIN_EMAIL can authenticate and access GET /api/admin/dashboard (200 OK)
    // ==========================================
    console.log(`\n--- Test E: Designated ADMIN_EMAIL (${adminEmail}) access ---`);
    const adminLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: adminEmail,
        password: 'Password123!',
      }),
    });
    const adminLoginData = await adminLoginRes.json();
    console.log('Admin login status:', adminLoginRes.status, 'Role:', adminLoginData.data?.user?.role);
    if (adminLoginRes.status !== 200 || adminLoginData.data?.user?.role !== 'admin') {
      throw new Error(`Test E Failed: Designated admin could not log in as admin`);
    }

    const adminToken = adminLoginData.data.token;
    const adminDashRes = await fetch(`${baseUrl}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminDashData = await adminDashRes.json();
    console.log('GET /api/admin/dashboard Status:', adminDashRes.status);
    if (adminDashRes.status !== 200 || !adminDashData.data?.metrics) {
      throw new Error(`Test E Failed: Expected 200 OK for admin dashboard, got ${adminDashRes.status}`);
    }
    console.log('✓ PASS: Designated admin successfully accessed admin dashboard with HTTP 200');

    // ==========================================
    // Test F: Normal customer accessing GET /api/admin/dashboard receives HTTP 403
    // ==========================================
    console.log('\n--- Test F: Normal customer accessing admin dashboard ---');
    const custLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `normal.user.${timestamp}@example.com`,
        password: 'Password123!',
      }),
    });
    const custLoginData = await custLoginRes.json();
    const custToken = custLoginData.data.token;

    const custDashRes = await fetch(`${baseUrl}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${custToken}` },
    });
    console.log('Customer accessing /api/admin/dashboard Status:', custDashRes.status);
    if (custDashRes.status !== 403) {
      throw new Error(`Test F Failed: Expected 403 Forbidden for customer, got ${custDashRes.status}`);
    }
    console.log('✓ PASS: Normal customer correctly received HTTP 403 Forbidden');

    // ==========================================
    // Test G: Unauthenticated request receives HTTP 401
    // ==========================================
    console.log('\n--- Test G: Unauthenticated request to admin dashboard ---');
    const unauthRes = await fetch(`${baseUrl}/admin/dashboard`);
    console.log('Unauthenticated access Status:', unauthRes.status);
    if (unauthRes.status !== 401) {
      throw new Error(`Test G Failed: Expected 401 Unauthorized, got ${unauthRes.status}`);
    }
    console.log('✓ PASS: Unauthenticated access correctly received HTTP 401 Unauthorized');

    // ==========================================
    // Test H: Database invariant - Exactly one admin in PostgreSQL equals ADMIN_EMAIL
    // ==========================================
    console.log('\n--- Test H: PostgreSQL Database Invariant Check ---');
    const adminCountRes = await pool.query(
      "SELECT id, name, email, role, is_active FROM users WHERE role = 'admin'"
    );
    console.log(`Admins found in database (${adminCountRes.rows.length}):`);
    adminCountRes.rows.forEach((r) => console.log(`  - [ID ${r.id}] ${r.name} <${r.email}>`));

    if (adminCountRes.rows.length !== 1) {
      throw new Error(`Test H Failed: Expected exactly 1 admin in DB, found ${adminCountRes.rows.length}`);
    }
    if (adminCountRes.rows[0].email.toLowerCase().trim() !== adminEmail) {
      throw new Error(`Test H Failed: Admin email '${adminCountRes.rows[0].email}' does not match '${adminEmail}'`);
    }
    console.log(`✓ PASS: Database invariant verified. Exactly 1 admin: ${adminCountRes.rows[0].email}`);

    // ==========================================
    // Test I: Verify no credentials/passwords exposed in src/
    // ==========================================
    console.log('\n--- Test I: Credential exposure audit in src/ ---');
    const srcDir = path.resolve(__dirname, '../../../src');
    const scanDir = (dir) => {
      let findings = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          findings = findings.concat(scanDir(fullPath));
        } else if (/\.(js|jsx|ts|tsx|json|html|css)$/.test(entry.name)) {
          const content = fs.readFileSync(fullPath, 'utf8');
          if (
            content.includes('Admin@12345') ||
            content.includes('admin123') ||
            content.includes('tech123') ||
            /["']admin@rentease\.com["']/i.test(content)
          ) {
            findings.push(fullPath);
          }
        }
      }
      return findings;
    };

    const exposedFiles = scanDir(srcDir);
    if (exposedFiles.length > 0) {
      throw new Error(`Test I Failed: Found exposed credentials in: ${exposedFiles.join(', ')}`);
    }
    console.log('✓ PASS: Zero admin credentials or seed accounts exposed in frontend src/');

    // ==========================================
    // Test J: Verify role reassignment guard blocks promoting another user to admin
    // ==========================================
    console.log('\n--- Test J: Admin role reassignment endpoint guard ---');
    const targetUserId = regNoRoleData.data?.user?.id;
    const illegalRoleUpdateRes = await fetch(`${baseUrl}/admin/users/${targetUserId}/role`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ role: 'admin' }),
    });
    console.log('Attempting to promote customer to admin Status:', illegalRoleUpdateRes.status);
    if (illegalRoleUpdateRes.status !== 403) {
      throw new Error(`Test J Failed: Expected 403 when attempting to promote non-designated account to admin, got ${illegalRoleUpdateRes.status}`);
    }
    console.log('✓ PASS: Backend successfully rejected promoting another user to admin');

    console.log('\n=============================================================');
    console.log('🎉 ALL SINGLE-ADMIN SECURITY TESTS (A-J) PASSED WITH FLYING COLORS!');
    console.log('=============================================================');
  } finally {
    testServer.close();
  }
};

runSecurityTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Security Tests Failed:', err);
    process.exit(1);
  });
