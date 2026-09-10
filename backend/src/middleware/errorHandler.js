import { errorResponse } from '../utils/response.js';
import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, _next) => {
  logger.error(`${req.method} ${req.originalUrl} -`, err.message, err.stack);

  if (err.name === 'ValidationError') {
    return errorResponse(res, {
      statusCode: 400,
      message: 'Validation failed',
      errors: err.errors || [err.message],
    });
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return errorResponse(res, {
      statusCode: 401,
      message: 'Invalid or expired authorization token',
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal server error';

  return errorResponse(res, {
    statusCode,
    message,
    errors: process.env.NODE_ENV === 'development' ? [err.stack] : null,
  });
};

export const notFoundHandler = (req, res) => {
  return errorResponse(res, {
    statusCode: 404,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
};
