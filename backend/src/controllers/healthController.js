import { checkDbConnection } from '../config/database.js';
import { successResponse } from '../utils/response.js';
import { PRODUCTS } from '../../../src/constants/theme.js';

export const getHealth = async (req, res, next) => {
  try {
    const dbStatus = await checkDbConnection();

    return successResponse(res, {
      statusCode: 200,
      message: 'RentEase Backend API is healthy',
      data: {
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        database: {
          driver: 'pg (PostgreSQL)',
          connected: dbStatus.connected,
          status: dbStatus.status,
          host: dbStatus.host || null,
          databaseName: dbStatus.database || null,
          details: dbStatus.message || 'Connected successfully',
        },
        catalog: {
          totalProducts: PRODUCTS.length,
          status: PRODUCTS.length === 903 ? 'verified_903_products' : 'catalog_loaded',
        },
      },
    });
  } catch (err) {
    next(err);
  }
};
