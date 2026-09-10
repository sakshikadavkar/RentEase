/**
 * Standardized API response format
 */
export const successResponse = (res, { statusCode = 200, message = 'Success', data = null, meta = null }) => {
  const response = {
    success: true,
    message,
    data,
  };
  if (meta) {
    response.meta = meta;
  }
  return res.status(statusCode).json(response);
};

export const errorResponse = (res, { statusCode = 500, message = 'An error occurred', errors = null }) => {
  const response = {
    success: false,
    message,
  };
  if (errors) {
    response.errors = errors;
  }
  return res.status(statusCode).json(response);
};

export const sendSuccess = (res, message, data = null, statusCode = 200) => {
  return successResponse(res, { statusCode, message, data });
};

export const sendError = (res, message, statusCode = 500, errors = null) => {
  return errorResponse(res, { statusCode, message, errors });
};

