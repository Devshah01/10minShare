import pg from 'pg';
import { config } from './env.config.js';

const { Pool } = pg;

const isProduction = config.nodeEnv === 'production';

export const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: config.databaseUrl.includes('localhost') ? false : { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 300000, // Keep idle connection for 5 mins
  connectionTimeoutMillis: 15000, // 15s allowance for serverless/sleeping DB wakeups
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

pool.on('error', (err) => {
  console.error('[Database Error] Unexpected pool error:', err);
});
