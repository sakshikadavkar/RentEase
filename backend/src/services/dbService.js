import { getPool } from '../config/database.js';

export const query = async (text, params) => {
  const pool = getPool();
  if (!pool) {
    throw new Error('Database connection pool is not configured');
  }
  const res = await pool.query(text, params);
  return res;
};
