import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as deliveryController from '../controllers/deliveryController.js';

const router = Router();

router.use(requireAuth);

router.get('/', deliveryController.getDeliveries);

export default router;
