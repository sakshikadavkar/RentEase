import * as rentalService from '../services/rentalService.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getRentals = async (req, res, next) => {
  try {
    const { status } = req.query;
    const rentals = await rentalService.getUserRentals(req.user.id, status);
    return sendSuccess(res, 'Rentals retrieved successfully', rentals);
  } catch (error) {
    next(error);
  }
};

export const getRentalById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rental = await rentalService.getRentalById(id, req.user.id, req.user.role);
    if (!rental) {
      return sendError(res, 'Rental subscription not found or access denied', 404);
    }
    return sendSuccess(res, 'Rental details retrieved successfully', rental);
  } catch (error) {
    next(error);
  }
};

export const extendRental = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { additionalMonths } = req.body;
    const result = await rentalService.extendRental(id, req.user.id, {
      additionalMonths,
      userRole: req.user.role,
    });
    return sendSuccess(res, result.message, result);
  } catch (error) {
    next(error);
  }
};

export const returnRental = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { returnReason, pickupDate, pickupSlot, notes } = req.body;
    const result = await rentalService.requestRentalReturn(id, req.user.id, {
      returnReason,
      pickupDate,
      pickupSlot,
      notes,
      userRole: req.user.role,
    });
    return sendSuccess(res, result.message, result, 201);
  } catch (error) {
    next(error);
  }
};

export const terminateRental = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason, pickupDate, pickupSlot, notes } = req.body;
    const result = await rentalService.terminateRentalEarly(id, req.user.id, {
      reason,
      pickupDate,
      pickupSlot,
      notes,
      userRole: req.user.role,
    });
    return sendSuccess(res, result.message, result);
  } catch (error) {
    next(error);
  }
};
