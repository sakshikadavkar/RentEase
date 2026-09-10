import * as adminService from '../services/adminService.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getDashboard = async (req, res) => {
  try {
    const data = await adminService.getAdminDashboardMetrics();
    return successResponse(res, {
      message: 'Admin dashboard metrics retrieved successfully',
      data,
    });
  } catch (err) {
    return errorResponse(res, {
      statusCode: err.statusCode || 500,
      message: err.message,
    });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const data = await adminService.getAdminAnalytics();
    return successResponse(res, {
      message: 'Analytics data retrieved successfully',
      data,
    });
  } catch (err) {
    return errorResponse(res, {
      statusCode: err.statusCode || 500,
      message: err.message,
    });
  }
};

// Users
export const getUsers = async (req, res) => {
  try {
    const { search, role, is_active, page, limit } = req.query;
    const data = await adminService.getAdminUsers({ search, role, is_active, page, limit });
    return successResponse(res, {
      message: 'Users retrieved successfully',
      data,
    });
  } catch (err) {
    return errorResponse(res, {
      statusCode: err.statusCode || 500,
      message: err.message,
    });
  }
};

export const getUserDetail = async (req, res) => {
  try {
    const data = await adminService.getAdminUserDetail(req.params.id);
    return successResponse(res, {
      message: 'User detail retrieved successfully',
      data,
    });
  } catch (err) {
    return errorResponse(res, {
      statusCode: err.statusCode || 500,
      message: err.message,
    });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { is_active } = req.body;
    const data = await adminService.updateAdminUserStatus(req.params.id, is_active);
    return successResponse(res, {
      message: `User status updated to ${is_active ? 'active' : 'inactive'}`,
      data,
    });
  } catch (err) {
    return errorResponse(res, {
      statusCode: err.statusCode || 500,
      message: err.message,
    });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const data = await adminService.updateAdminUserRole(req.params.id, role);
    return successResponse(res, {
      message: `User role updated to ${role}`,
      data,
    });
  } catch (err) {
    return errorResponse(res, {
      statusCode: err.statusCode || 500,
      message: err.message,
    });
  }
};

// Products
export const getProducts = async (req, res) => {
  try {
    const { search, category, city, is_active, page, limit } = req.query;
    const data = await adminService.getAdminProducts({ search, category, city, is_active, page, limit });
    return successResponse(res, {
      message: 'Admin products retrieved successfully',
      data,
    });
  } catch (err) {
    return errorResponse(res, {
      statusCode: err.statusCode || 500,
      message: err.message,
    });
  }
};

export const getProductDetail = async (req, res) => {
  try {
    const data = await adminService.getAdminProductDetail(req.params.id);
    return successResponse(res, {
      message: 'Product detail retrieved successfully',
      data,
    });
  } catch (err) {
    return errorResponse(res, {
      statusCode: err.statusCode || 500,
      message: err.message,
    });
  }
};

export const createProduct = async (req, res) => {
  try {
    const data = await adminService.createAdminProduct(req.body);
    return successResponse(res, {
      statusCode: 201,
      message: 'Product created successfully',
      data,
    });
  } catch (err) {
    return errorResponse(res, {
      statusCode: err.statusCode || 500,
      message: err.message,
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const data = await adminService.updateAdminProduct(req.params.id, req.body);
    return successResponse(res, {
      message: 'Product updated successfully',
      data,
    });
  } catch (err) {
    return errorResponse(res, {
      statusCode: err.statusCode || 500,
      message: err.message,
    });
  }
};

export const updateProductStatus = async (req, res) => {
  try {
    const { is_active } = req.body;
    const data = await adminService.updateAdminProductStatus(req.params.id, is_active);
    return successResponse(res, {
      message: `Product ${is_active ? 'activated' : 'archived'} successfully`,
      data,
    });
  } catch (err) {
    return errorResponse(res, {
      statusCode: err.statusCode || 500,
      message: err.message,
    });
  }
};

// Inventory
export const getInventoryUnits = async (req, res) => {
  try {
    const { search, city, status, condition_grade, product_id, page, limit } = req.query;
    const data = await adminService.getAdminInventoryUnits({ search, city, status, condition_grade, product_id, page, limit });
    return successResponse(res, {
      message: 'Inventory units retrieved successfully',
      data,
    });
  } catch (err) {
    return errorResponse(res, {
      statusCode: err.statusCode || 500,
      message: err.message,
    });
  }
};

export const createInventoryUnit = async (req, res) => {
  try {
    const data = await adminService.createAdminInventoryUnit(req.body);
    return successResponse(res, {
      statusCode: 201,
      message: 'Inventory unit added successfully',
      data,
    });
  } catch (err) {
    return errorResponse(res, {
      statusCode: err.statusCode || 500,
      message: err.message,
    });
  }
};

export const updateInventoryUnit = async (req, res) => {
  try {
    const data = await adminService.updateAdminInventoryUnit(req.params.id, req.body);
    return successResponse(res, {
      message: 'Inventory unit updated successfully',
      data,
    });
  } catch (err) {
    return errorResponse(res, {
      statusCode: err.statusCode || 500,
      message: err.message,
    });
  }
};

// Orders
export const getOrders = async (req, res) => {
  try {
    const { search, status, city, page, limit } = req.query;
    const data = await adminService.getAdminOrders({ search, status, city, page, limit });
    return successResponse(res, {
      message: 'Admin orders retrieved successfully',
      data,
    });
  } catch (err) {
    return errorResponse(res, {
      statusCode: err.statusCode || 500,
      message: err.message,
    });
  }
};

export const getOrderDetail = async (req, res) => {
  try {
    const data = await adminService.getAdminOrderDetail(req.params.id);
    return successResponse(res, {
      message: 'Order detail retrieved successfully',
      data,
    });
  } catch (err) {
    return errorResponse(res, {
      statusCode: err.statusCode || 500,
      message: err.message,
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const data = await adminService.updateAdminOrderStatus(req.params.id, status);
    return successResponse(res, {
      message: `Order status updated to ${status}`,
      data,
    });
  } catch (err) {
    return errorResponse(res, {
      statusCode: err.statusCode || 500,
      message: err.message,
    });
  }
};

// Rentals
export const getRentals = async (req, res) => {
  try {
    const { search, status, city, page, limit } = req.query;
    const data = await adminService.getAdminRentals({ search, status, city, page, limit });
    return successResponse(res, {
      message: 'Admin rentals retrieved successfully',
      data,
    });
  } catch (err) {
    return errorResponse(res, {
      statusCode: err.statusCode || 500,
      message: err.message,
    });
  }
};

export const getRentalDetail = async (req, res) => {
  try {
    const data = await adminService.getAdminRentalDetail(req.params.id);
    return successResponse(res, {
      message: 'Rental detail retrieved successfully',
      data,
    });
  } catch (err) {
    return errorResponse(res, {
      statusCode: err.statusCode || 500,
      message: err.message,
    });
  }
};

export const updateRentalStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const data = await adminService.updateAdminRentalStatus(req.params.id, status);
    return successResponse(res, {
      message: `Rental status updated to ${status}`,
      data,
    });
  } catch (err) {
    return errorResponse(res, {
      statusCode: err.statusCode || 500,
      message: err.message,
    });
  }
};

// Deliveries
export const getDeliveries = async (req, res) => {
  try {
    const { search, status, date, page, limit } = req.query;
    const data = await adminService.getAdminDeliveries({ search, status, date, page, limit });
    return successResponse(res, {
      message: 'Admin deliveries retrieved successfully',
      data,
    });
  } catch (err) {
    return errorResponse(res, {
      statusCode: err.statusCode || 500,
      message: err.message,
    });
  }
};

export const updateDelivery = async (req, res) => {
  try {
    const data = await adminService.updateAdminDelivery(req.params.id, req.body);
    return successResponse(res, {
      message: 'Delivery record updated successfully',
      data,
    });
  } catch (err) {
    return errorResponse(res, {
      statusCode: err.statusCode || 500,
      message: err.message,
    });
  }
};

// Maintenance
export const getMaintenanceTickets = async (req, res) => {
  try {
    const { search, category, urgency, status, page, limit } = req.query;
    const data = await adminService.getAdminMaintenanceTickets({ search, category, urgency, status, page, limit });
    return successResponse(res, {
      message: 'Maintenance tickets retrieved successfully',
      data,
    });
  } catch (err) {
    return errorResponse(res, {
      statusCode: err.statusCode || 500,
      message: err.message,
    });
  }
};

export const updateMaintenanceTicket = async (req, res) => {
  try {
    const data = await adminService.updateAdminMaintenanceTicket(req.params.id, req.body);
    return successResponse(res, {
      message: 'Maintenance ticket updated successfully',
      data,
    });
  } catch (err) {
    return errorResponse(res, {
      statusCode: err.statusCode || 500,
      message: err.message,
    });
  }
};

// Returns & Claims
export const getReturns = async (req, res) => {
  try {
    const { search, status, page, limit } = req.query;
    const data = await adminService.getAdminReturns({ search, status, page, limit });
    return successResponse(res, {
      message: 'Admin returns retrieved successfully',
      data,
    });
  } catch (err) {
    return errorResponse(res, {
      statusCode: err.statusCode || 500,
      message: err.message,
    });
  }
};

export const updateReturn = async (req, res) => {
  try {
    const data = await adminService.updateAdminReturn(req.params.id, req.body);
    return successResponse(res, {
      message: 'Return record updated successfully',
      data,
    });
  } catch (err) {
    return errorResponse(res, {
      statusCode: err.statusCode || 500,
      message: err.message,
    });
  }
};

export const createDamageClaim = async (req, res) => {
  try {
    const data = await adminService.createAdminDamageClaim(req.params.id, req.body);
    return successResponse(res, {
      statusCode: 201,
      message: 'Damage claim filed successfully',
      data,
    });
  } catch (err) {
    return errorResponse(res, {
      statusCode: err.statusCode || 500,
      message: err.message,
    });
  }
};

// Service Areas
export const getServiceAreas = async (req, res) => {
  try {
    const data = await adminService.getAdminServiceAreas();
    return successResponse(res, {
      message: 'Service areas retrieved successfully',
      data,
    });
  } catch (err) {
    return errorResponse(res, {
      statusCode: err.statusCode || 500,
      message: err.message,
    });
  }
};

export const createServiceArea = async (req, res) => {
  try {
    const data = await adminService.createAdminServiceArea(req.body);
    return successResponse(res, {
      statusCode: 201,
      message: 'Service area created successfully',
      data,
    });
  } catch (err) {
    return errorResponse(res, {
      statusCode: err.statusCode || 500,
      message: err.message,
    });
  }
};

export const updateServiceArea = async (req, res) => {
  try {
    const data = await adminService.updateAdminServiceArea(req.params.id, req.body);
    return successResponse(res, {
      message: 'Service area updated successfully',
      data,
    });
  } catch (err) {
    return errorResponse(res, {
      statusCode: err.statusCode || 500,
      message: err.message,
    });
  }
};
