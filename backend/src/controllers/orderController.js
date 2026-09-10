import * as orderService from '../services/orderService.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const createOrder = async (req, res, next) => {
  try {
    const { items, deliveryAddress, deliverySlot, paymentMethod, totalDueToday, monthlySubtotal, totalDeposit } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return sendError(res, 'Invalid order items', 400);
    }
    const result = await orderService.createOrder(req.user.id, {
      items,
      deliveryAddress,
      deliverySlot,
      paymentMethod,
      totalDueToday,
      monthlySubtotal,
      totalDeposit,
    });
    return sendSuccess(res, 'Order and rental subscriptions created successfully', result, 201);
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getUserOrders(req.user.id, req.user.role);
    return sendSuccess(res, 'Orders retrieved successfully', orders);
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await orderService.getOrderById(id, req.user.id, req.user.role);
    if (!order) {
      return sendError(res, 'Order not found or access denied', 404);
    }
    return sendSuccess(res, 'Order details retrieved successfully', order);
  } catch (error) {
    next(error);
  }
};
