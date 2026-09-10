import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getPool, checkDbConnection } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const runMigrations = async () => {
  console.log('🔄 Checking database connection for migrations...');
  const health = await checkDbConnection();

  if (!health.connected) {
    console.warn('⚠️  PostgreSQL is not connected. Migration skipped.');
    console.warn(`Reason: ${health.message}`);
    return { success: false, reason: health.message };
  }

  const pool = getPool();
  const schemaPath = path.join(__dirname, 'schema.sql');
  const phase2Path = path.join(__dirname, 'schema_phase2.sql');
  const phase3Path = path.join(__dirname, 'schema_phase3.sql');
  const sql1 = fs.readFileSync(schemaPath, 'utf8');
  const sql2 = fs.existsSync(phase2Path) ? fs.readFileSync(phase2Path, 'utf8') : '';
  const sql3 = fs.existsSync(phase3Path) ? fs.readFileSync(phase3Path, 'utf8') : '';

  try {
    console.log('🚀 Running PostgreSQL schema migrations...');
    await pool.query(sql1);
    if (sql2) {
      console.log('🚀 Running PostgreSQL Phase 2 schema migrations...');
      await pool.query(sql2);
    }
    if (sql3) {
      console.log('🚀 Running PostgreSQL Phase 3 schema migrations...');
      await pool.query(sql3);
    }
    console.log('✅ PostgreSQL schema migrations applied successfully.');
    return { success: true };
  } catch (error) {
    console.error('❌ Error executing database migration:', error.message);
    throw error;
  }
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
