import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend directory or project root if present
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'rentease_fallback_secret_key_change_in_production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  ADMIN_EMAIL: (process.env.ADMIN_EMAIL || 'sakshikadavkar171@gmail.com').toLowerCase().trim(),
};

/**
 * Normalized email comparison helper to enforce single-admin security policy
 */
export const isDesignatedAdminEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  return email.toLowerCase().trim() === ENV.ADMIN_EMAIL;
};
