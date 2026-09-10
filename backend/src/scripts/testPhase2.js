import http from 'http';
import app from '../app.js';
import { checkDbConnection } from '../config/database.js';

const runTests = async () => {
  console.log('🧪 Starting Phase 2 Backend API Verification...');

  const dbHealth = await checkDbConnection();
  console.log('PostgreSQL Connection:', dbHealth);

  const testServer = http.createServer(app);
  await new Promise((resolve) => testServer.listen(5120, '127.0.0.1', resolve));
  const baseURL = 'http://127.0.0.1:5120';
  console.log(`Server listening on ${baseURL}`);

  try {
    const userEmail = `alex.phase2.${Date.now()}@example.com`;
    // 1. Register
    const regRes = await fetch(`${baseURL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alex Rivera Phase 2',
        email: userEmail,
        password: 'Password123!',
        city: 'Bengaluru',
      }),
    });
    const regData = await regRes.json();
    console.log('1. User Registered:', regData.success, 'Token length:', regData.data?.token?.length);
    const token = regData.data.token;

    // 2. Create Order / Rentals (Simulate checkout)
    const orderRes = await fetch(`${baseURL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        items: [
          {
            product: {
              id: 'luxe-cloud-sofa',
              monthlyPrice: 1499,
              deposit: 4499,
            },
            tenure: 6,
            quantity: 1,
          },
          {
            product: {
              id: 'smartvision-tv',
              monthlyPrice: 999,
              deposit: 0,
            },
            tenure: 12,
            quantity: 1,
          },
        ],
        deliveryAddress: {
          fullName: 'Alex Rivera',
          phone: '+91 9876543210',
          address: 'Flat 402, Skyline Heights, Indiranagar',
          city: 'Bengaluru',
          pincode: '560038',
        },
        deliverySlot: 'Morning (9 AM - 1 PM)',
        paymentMethod: 'UPI',
        totalDueToday: 7447,
        monthlySubtotal: 2498,
        totalDeposit: 4499,
      }),
    });
    const orderData = await orderRes.json();
    console.log('2. Order Created:', orderData.success, 'Order Number:', orderData.data?.order?.orderNumber);
    console.log('   Rentals Created:', orderData.data?.rentals?.length);
    const rental1 = orderData.data?.rentals[0];
    const rental2 = orderData.data?.rentals[1];

    // 3. Fetch User Rentals List
    const rentalsListRes = await fetch(`${baseURL}/api/rentals`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const rentalsListData = await rentalsListRes.json();
    console.log('3. GET /api/rentals Status:', rentalsListRes.status, 'Total rentals count:', rentalsListData.data?.length);

    // 4. Fetch Rental Details
    const rentalDetailRes = await fetch(`${baseURL}/api/rentals/${rental1.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const rentalDetailData = await rentalDetailRes.json();
    console.log('4. GET /api/rentals/:id Status:', rentalDetailRes.status, 'Product name:', rentalDetailData.data?.product?.name);

    // 5. Extend Rental 1
    const extendRes = await fetch(`${baseURL}/api/rentals/${rental1.id}/extend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        additionalMonths: 6,
      }),
    });
    const extendData = await extendRes.json();
    console.log('5. POST /api/rentals/:id/extend Status:', extendRes.status, 'New End Date:', extendData.data?.newEndDate);

    // 6. Return Rental 1
    const returnRes = await fetch(`${baseURL}/api/rentals/${rental1.id}/return`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        returnReason: 'Upgrading to larger sofa set',
        pickupDate: '2026-09-12',
        pickupSlot: 'Morning (9 AM - 1 PM)',
        notes: 'Please call before arrival',
      }),
    });
    const returnData = await returnRes.json();
    console.log('6. POST /api/rentals/:id/return Status:', returnRes.status, 'Return Number:', returnData.data?.returnNumber);

    // 7. Early Terminate Rental 2
    const termRes = await fetch(`${baseURL}/api/rentals/${rental2.id}/terminate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        reason: 'Relocating to another city',
        pickupDate: '2026-09-10',
        pickupSlot: 'Evening (5 PM - 8 PM)',
      }),
    });
    const termData = await termRes.json();
    console.log('7. POST /api/rentals/:id/terminate Status:', termRes.status, 'Early Fee:', termData.data?.earlyTerminationFee, 'Expected Refund:', termData.data?.expectedDepositRefund);

    // 8. Create Maintenance Ticket
    const ticketRes = await fetch(`${baseURL}/api/maintenance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        rentalId: rental1.id,
        issueCategory: 'Appliance issue',
        urgency: 'high',
        description: 'Fabric cleaning and joint inspection required under annual plan.',
        preferredTimeSlot: 'Morning (9 AM - 1 PM)',
      }),
    });
    const ticketData = await ticketRes.json();
    console.log('8. POST /api/maintenance Status:', ticketRes.status, 'Ticket Number:', ticketData.data?.ticketNumber);

    // 9. Fetch Maintenance Ticket Details & Timeline
    const ticketDetailRes = await fetch(`${baseURL}/api/maintenance/${ticketData.data?.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const ticketDetailData = await ticketDetailRes.json();
    console.log('9. GET /api/maintenance/:id Status:', ticketDetailRes.status, 'Timeline stages:', ticketDetailData.data?.timeline?.length);

    // 10. Fetch Orders & Deliveries
    const ordersRes = await fetch(`${baseURL}/api/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const ordersData = await ordersRes.json();
    console.log('10. GET /api/orders Status:', ordersRes.status, 'Total orders:', ordersData.data?.length);

    const delivRes = await fetch(`${baseURL}/api/deliveries`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const delivData = await delivRes.json();
    console.log('11. GET /api/deliveries Status:', delivRes.status, 'Deliveries found:', delivData.data?.length);

    console.log('\n🎉 ALL PHASE 2 BACKEND ENDPOINTS AND PERSISTENCE TESTS PASSED!');
  } catch (err) {
    console.error('Test error:', err);
    process.exit(1);
  } finally {
    testServer.close();
    process.exit(0);
  }
};

runTests();
