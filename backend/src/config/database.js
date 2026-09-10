import pg from 'pg';
import { ENV } from './env.js';

const { Pool } = pg;

let pool = null;

export const getPool = () => {
  if (!pool && ENV.DATABASE_URL) {
    const isLocalhost = ENV.DATABASE_URL.includes('localhost') || ENV.DATABASE_URL.includes('127.0.0.1');
    const isSslRequired = ENV.DATABASE_URL.includes('sslmode=require') || ENV.DATABASE_URL.includes('neon.tech') || !isLocalhost;

    pool = new Pool({
      connectionString: ENV.DATABASE_URL,
      ssl: isSslRequired ? { rejectUnauthorized: false } : false,
      max: 20,
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
  if (!ENV.DATABASE_URL) {
    return {
      connected: false,
      status: 'unconfigured',
      message: 'DATABASE_URL environment variable is not set. Running in fallback mode.',
    };
  }

  try {
    const currentPool = getPool();
    if (!currentPool) {
      return {
        connected: false,
        status: 'uninitialized',
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
      serverTime: result.rows[0].current_time,
    };
  } catch (error) {
    return {
      connected: false,
      status: 'error',
      message: error.message,
    };
  }
};
