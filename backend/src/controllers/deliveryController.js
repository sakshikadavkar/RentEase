import * as deliveryService from '../services/deliveryService.js';
import { sendSuccess } from '../utils/response.js';

export const getDeliveries = async (req, res, next) => {
  try {
    const deliveries = await deliveryService.getUserDeliveries(req.user.id, req.user.role);
    return sendSuccess(res, 'Deliveries retrieved successfully', deliveries);
  } catch (error) {
    next(error);
  }
};
