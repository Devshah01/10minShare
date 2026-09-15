import pg from 'pg';
import { config } from './env.config.js';

const { Pool } = pg;

const isProduction = config.nodeEnv === 'production';

export const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: config.databaseUrl.includes('localhost') ? false : { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('[Database Error] Unexpected pool error:', err);
});
