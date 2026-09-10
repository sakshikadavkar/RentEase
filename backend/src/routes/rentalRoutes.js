import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as rentalController from '../controllers/rentalController.js';

const router = Router();

router.use(requireAuth);

router.get('/', rentalController.getRentals);
router.get('/:id', rentalController.getRentalById);
router.post('/:id/extend', rentalController.extendRental);
router.post('/:id/return', rentalController.returnRental);
router.post('/:id/terminate', rentalController.terminateRental);

export default router;
