import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import * as adminController from '../controllers/adminController.js';

const router = Router();

// Protect ALL admin routes with authentication AND admin role authorization
router.use(requireAuth);
router.use(requireAdmin);

// 1. Dashboard & Analytics
router.get('/dashboard', adminController.getDashboard);
router.get('/analytics', adminController.getAnalytics);

// 2. User Management
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserDetail);
router.patch('/users/:id/status', adminController.updateUserStatus);
router.patch('/users/:id/role', adminController.updateUserRole);

// 3. Product Management
router.get('/products', adminController.getProducts);
router.get('/products/:id', adminController.getProductDetail);
router.post('/products', adminController.createProduct);
router.put('/products/:id', adminController.updateProduct);
router.patch('/products/:id/status', adminController.updateProductStatus);

// 4. Inventory Management
router.get('/inventory', adminController.getInventoryUnits);
router.post('/inventory', adminController.createInventoryUnit);
router.patch('/inventory/:id', adminController.updateInventoryUnit);

// 5. Order Management
router.get('/orders', adminController.getOrders);
router.get('/orders/:id', adminController.getOrderDetail);
router.patch('/orders/:id/status', adminController.updateOrderStatus);

// 6. Rental Subscriptions Management
router.get('/rentals', adminController.getRentals);
router.get('/rentals/:id', adminController.getRentalDetail);
router.patch('/rentals/:id/status', adminController.updateRentalStatus);

// 7. Deliveries & Logistics
router.get('/deliveries', adminController.getDeliveries);
router.patch('/deliveries/:id', adminController.updateDelivery);

// 8. Maintenance Tickets
router.get('/maintenance', adminController.getMaintenanceTickets);
router.patch('/maintenance/:id', adminController.updateMaintenanceTicket);

// 9. Returns & Claims
router.get('/returns', adminController.getReturns);
router.patch('/returns/:id', adminController.updateReturn);
router.post('/returns/:id/damage-claim', adminController.createDamageClaim);

// 10. Service Areas
router.get('/service-areas', adminController.getServiceAreas);
router.post('/service-areas', adminController.createServiceArea);
router.patch('/service-areas/:id', adminController.updateServiceArea);

export default router;
