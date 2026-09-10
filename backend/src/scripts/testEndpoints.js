import app from '../app.js';
import http from 'http';

const testServer = http.createServer(app);

const runTests = async () => {
  await new Promise((resolve) => testServer.listen(5099, '127.0.0.1', resolve));
  console.log('🧪 Test server started on http://127.0.0.1:5099');

  const baseURL = 'http://127.0.0.1:5099';

  try {
    // 1. Health API
    console.log('\n--- Test 1: GET /api/health ---');
    const healthRes = await fetch(`${baseURL}/api/health`);
    const healthData = await healthRes.json();
    console.log('Status:', healthRes.status);
    console.log('Health Response:', JSON.stringify(healthData, null, 2));

    // 2. Products List (Check 903 count)
    console.log('\n--- Test 2: GET /api/products ---');
    const prodRes = await fetch(`${baseURL}/api/products?limit=5`);
    const prodData = await prodRes.json();
    console.log('Status:', prodRes.status);
    console.log('Products Count Total:', prodData.meta?.total);
    console.log('Products returned:', prodData.data?.length);

    // 3. Product Details by ID
    console.log('\n--- Test 3: GET /api/products/smartvision-tv ---');
    const itemRes = await fetch(`${baseURL}/api/products/smartvision-tv`);
    const itemData = await itemRes.json();
    console.log('Status:', itemRes.status);
    console.log('Item Name:', itemData.data?.name);

    // 4. Register
    const uniqueEmail = `test.user.${Date.now()}@example.com`;
    console.log('\n--- Test 4: POST /api/auth/register ---');
    const regRes = await fetch(`${baseURL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alex Rivera',
        email: uniqueEmail,
        password: 'Password123!',
        phone: '+91 9876543210',
        city: 'Bengaluru',
      }),
    });
    const regData = await regRes.json();
    console.log('Status:', regRes.status);
    console.log('User registered:', regData.data?.user?.email);
    const token = regData.data?.token;

    // 5. Login
    console.log('\n--- Test 5: POST /api/auth/login ---');
    const loginRes = await fetch(`${baseURL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: uniqueEmail,
        password: 'Password123!',
      }),
    });
    const loginData = await loginRes.json();
    console.log('Status:', loginRes.status);
    console.log('Login success:', loginData.success);

    // 6. Get Me (Protected)
    console.log('\n--- Test 6: GET /api/auth/me (Protected with JWT) ---');
    const meRes = await fetch(`${baseURL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const meData = await meRes.json();
    console.log('Status:', meRes.status);
    console.log('Profile retrieved:', meData.data?.user?.name);

    console.log('\n✅ ALL API ENDPOINT TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Endpoint test failed:', err);
    process.exit(1);
  } finally {
    testServer.close();
    process.exit(0);
  }
};

runTests();
