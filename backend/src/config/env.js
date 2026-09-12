import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend directory or project root if present in non-production
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
  dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
  dotenv.config();
}

/**
 * Sanitizes a database connection string by trimming whitespace,
 * stripping wrapping quotes, and removing accidental variable name prefixes.
 */
export const cleanDatabaseUrl = (raw) => {
  if (!raw || typeof raw !== 'string') return '';
  let url = raw.trim();

  // Strip wrapping single or double quotes
  while (
    (url.startsWith('"') && url.endsWith('"')) ||
    (url.startsWith("'") && url.endsWith("'"))
  ) {
    url = url.slice(1, -1).trim();
  }

  // Strip accidental "DATABASE_URL=" or "DATABASE_URL:" prefix
  if (url.startsWith('DATABASE_URL=')) {
    url = url.slice('DATABASE_URL='.length).trim();
  } else if (url.startsWith('DATABASE_URL:')) {
    url = url.slice('DATABASE_URL:'.length).trim();
  }

  // Strip wrapping quotes again in case value was quoted inside
  while (
    (url.startsWith('"') && url.endsWith('"')) ||
    (url.startsWith("'") && url.endsWith("'"))
  ) {
    url = url.slice(1, -1).trim();
  }

  return url;
};

export const ENV = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: cleanDatabaseUrl(process.env.DATABASE_URL || ''),
  JWT_SECRET: (process.env.JWT_SECRET || 'rentease_fallback_secret_key_change_in_production').trim().replace(/^["']|["']$/g, ''),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: (process.env.CLIENT_URL || 'http://localhost:3000').trim().replace(/^["']|["']$/g, ''),
  ADMIN_EMAIL: (process.env.ADMIN_EMAIL || 'sakshikadavkar171@gmail.com').toLowerCase().trim().replace(/^["']|["']$/g, ''),
};

/**
 * Normalized email comparison helper to enforce single-admin security policy
 */
export const isDesignatedAdminEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  return email.toLowerCase().trim() === ENV.ADMIN_EMAIL;
};
