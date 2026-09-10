import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import authRoutes from './authRoutes.js';
import productsRoutes from './productsRoutes.js';
import rentalRoutes from './rentalRoutes.js';
import maintenanceRoutes from './maintenanceRoutes.js';
import orderRoutes from './orderRoutes.js';
import deliveryRoutes from './deliveryRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/products', productsRoutes);
router.use('/rentals', rentalRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/orders', orderRoutes);
router.use('/deliveries', deliveryRoutes);
router.use('/admin', adminRoutes);

export default router;

