import pg from 'pg';
import { ENV, cleanDatabaseUrl } from './env.js';

const { Pool } = pg;

let pool = null;

/**
 * Cleanly tear down existing pool (e.g. after connection error)
 */
export const resetPool = async () => {
  if (pool) {
    try {
      await pool.end();
    } catch {
      // Ignore pool teardown errors
    }
    pool = null;
  }
};

export const getPool = () => {
  const dbUrl = cleanDatabaseUrl(process.env.DATABASE_URL || ENV.DATABASE_URL || '');
  if (!dbUrl) {
    return null;
  }

  if (!pool) {
    const isLocalhost = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');
    const isSslRequired = dbUrl.includes('sslmode=require') || dbUrl.includes('neon.tech') || !isLocalhost;

    pool = new Pool({
      connectionString: dbUrl,
      ssl: isSslRequired ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    pool.on('error', (err) => {
      console.error('Unexpected PostgreSQL client error:', err.message);
    });
  }
  return pool;
};

export const checkDbConnection = async () => {
  const rawDbUrl = process.env.DATABASE_URL || ENV.DATABASE_URL || '';
  const dbUrl = cleanDatabaseUrl(rawDbUrl);

  if (!dbUrl) {
    return {
      connected: false,
      status: 'unconfigured',
      host: null,
      message: 'DATABASE_URL environment variable is not set. Running in fallback mode.',
    };
  }

  // Safely extract hostname for diagnostic transparency without exposing credentials
  let parsedHost;
  if (/@(\/|$)/.test(dbUrl)) {
    parsedHost = 'missing_host';
  } else {
    try {
      const u = new URL(dbUrl);
      parsedHost = u.hostname || 'missing_host';
    } catch {
      parsedHost = 'unparseable_url';
    }
  }

  if (parsedHost === 'missing_host' || parsedHost === 'unparseable_url') {
    return {
      connected: false,
      status: 'error',
      host: parsedHost,
      message: `Invalid DATABASE_URL: Hostname is missing or malformed in connection string. Please check the DATABASE_URL value in Vercel.`,
    };
  }

  if (process.env.NODE_ENV === 'production' && (parsedHost === 'localhost' || parsedHost === '127.0.0.1')) {
    return {
      connected: false,
      status: 'error',
      host: parsedHost,
      message: `Invalid DATABASE_URL in production: resolved host is '${parsedHost}'. Vercel production requires a remote Neon PostgreSQL connection string.`,
    };
  }

  try {
    const currentPool = getPool();
    if (!currentPool) {
      return {
        connected: false,
        status: 'uninitialized',
        host: parsedHost,
        message: 'Database pool could not be initialized.',
      };
    }
    const client = await currentPool.connect();
    const result = await client.query('SELECT NOW() as current_time, current_database() as db_name');
    client.release();
    return {
      connected: true,
      status: 'healthy',
      database: result.rows[0].db_name,
      host: parsedHost,
      serverTime: result.rows[0].current_time,
    };
  } catch (error) {
    await resetPool();
    return {
      connected: false,
      status: 'error',
      host: parsedHost,
      message: error.message,
    };
  }
};
