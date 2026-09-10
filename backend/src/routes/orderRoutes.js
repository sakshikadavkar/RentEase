import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as orderController from '../controllers/orderController.js';

const router = Router();

router.use(requireAuth);

router.post('/', orderController.createOrder);
router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrderById);

export default router;
