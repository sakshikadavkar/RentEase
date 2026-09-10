import { verifyToken } from '../config/jwt.js';
import { errorResponse } from '../utils/response.js';

export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, {
      statusCode: 401,
      message: 'Authentication required. No Bearer token provided.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch {
    return errorResponse(res, {
      statusCode: 401,
      message: 'Invalid or expired token',
    });
  }
};

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, {
        statusCode: 401,
        message: 'Authentication required.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(res, {
        statusCode: 403,
        message: 'Forbidden. Access restricted to authorized administrative roles.',
      });
    }

    next();
  };
};

export const requireAdmin = requireRole('admin');

