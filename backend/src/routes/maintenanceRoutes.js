import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as maintenanceController from '../controllers/maintenanceController.js';

const router = Router();

router.use(requireAuth);

router.post('/', maintenanceController.createTicket);
router.get('/', maintenanceController.getTickets);
router.get('/:id', maintenanceController.getTicketById);

export default router;
