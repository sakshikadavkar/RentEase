import * as maintenanceService from '../services/maintenanceService.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const createTicket = async (req, res, next) => {
  try {
    const { rentalId, issueCategory, description, urgency, preferredTimeSlot, customerPhone } = req.body;
    if (!rentalId || !description) {
      return sendError(res, 'Rental ID and issue description are required', 400);
    }
    const ticket = await maintenanceService.createTicket(req.user.id, {
      rentalId,
      issueCategory,
      description,
      urgency,
      preferredTimeSlot,
      customerPhone,
    });
    return sendSuccess(res, 'Maintenance service ticket created successfully', ticket, 201);
  } catch (error) {
    next(error);
  }
};

export const getTickets = async (req, res, next) => {
  try {
    const { rentalId, status } = req.query;
    const tickets = await maintenanceService.getUserTickets(req.user.id, {
      rentalId,
      status,
      userRole: req.user.role,
    });
    return sendSuccess(res, 'Maintenance tickets retrieved successfully', tickets);
  } catch (error) {
    next(error);
  }
};

export const getTicketById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ticket = await maintenanceService.getTicketById(id, req.user.id, req.user.role);
    if (!ticket) {
      return sendError(res, 'Maintenance ticket not found or access denied', 404);
    }
    return sendSuccess(res, 'Maintenance ticket details retrieved successfully', ticket);
  } catch (error) {
    next(error);
  }
};
