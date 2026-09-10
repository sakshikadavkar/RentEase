import * as authService from '../services/authService.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, city, role } = req.body;
    const { user, token } = await authService.registerUser({
      name,
      email,
      password,
      phone,
      city,
      role: role && ['customer', 'admin', 'technician', 'logistics'].includes(role) ? role : 'customer',
    });

    return successResponse(res, {
      statusCode: 201,
      message: 'User registered successfully',
      data: { user, token },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.loginUser({ email, password });

    return successResponse(res, {
      statusCode: 200,
      message: 'Login successful',
      data: { user, token },
    });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getUserById(req.user.id);
    if (!user) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'User profile not found',
      });
    }

    return successResponse(res, {
      statusCode: 200,
      message: 'User profile retrieved successfully',
      data: { user },
    });
  } catch (err) {
    next(err);
  }
};
