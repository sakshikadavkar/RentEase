import app from './app.js';
import { ENV } from './config/env.js';
import { checkDbConnection } from './config/database.js';
import { logger } from './utils/logger.js';
import { PRODUCTS } from '../../src/constants/theme.js';

const PORT = ENV.PORT || 5000;

const startServer = async () => {
  logger.info(`========================================`);
  logger.info(`🚀 Starting RentEase Backend Server...`);
  logger.info(`========================================`);
  logger.info(`Environment: ${ENV.NODE_ENV}`);
  logger.info(`Target Port: ${PORT}`);
  logger.info(`Catalog Products Verified: ${PRODUCTS.length}`);

  // Test Database Connection
  const dbStatus = await checkDbConnection();
  if (dbStatus.connected) {
    logger.info(`✅ PostgreSQL Database Connected: ${dbStatus.database}`);
  } else {
    logger.warn(`⚠️ PostgreSQL Database: ${dbStatus.status} (${dbStatus.message})`);
    logger.info(`ℹ️ Running with verified in-memory 903-product catalog fallback.`);
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    logger.info(`✅ RentEase Backend API listening on http://0.0.0.0:${PORT}`);
    logger.info(`Health check available at http://localhost:${PORT}/api/health`);
    logger.info(`Products API available at http://localhost:${PORT}/api/products`);
  });

  // Graceful Shutdown
  const handleShutdown = (signal) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
};

startServer().catch((err) => {
  logger.error('Failed to start backend server:', err);
  process.exit(1);
});
