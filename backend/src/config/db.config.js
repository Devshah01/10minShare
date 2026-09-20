import pg from 'pg';
import { config } from './env.config.js';

const { Pool } = pg;

const isProduction = config.nodeEnv === 'production';

export const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: config.databaseUrl.includes('localhost') ? false : { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 10000, // Release idle connection after 10s so Layerbase can sleep
  connectionTimeoutMillis: 15000, // 15s allowance for serverless/sleeping DB wakeups
  allowExitOnIdle: true,
});

pool.on('error', (err) => {
  console.error('[Database Error] Unexpected pool error:', err);
});
