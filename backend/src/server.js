import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env.config.js';
import { logger } from './utils/logger.js';
import shareRoutes from './routes/share.routes.js';
import { errorHandler } from './middleware/error.middleware.js';
import { apiRateLimiter } from './middleware/rateLimiter.middleware.js';
import { initCleanupTask } from './services/cleanup.service.js';

const app = express();

// Trust reverse proxy for HTTPS protocol detection on GCP Cloud Run
app.set('trust proxy', true);

// Security Header Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS Configuration
const allowedOrigins = [
  config.frontendUrl,
  'https://10minshare.com',
  'https://www.10minshare.com',
  'https://10minshare.pages.dev',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    callback(null, true);
  },
  credentials: true,
  exposedHeaders: ['Content-Disposition', 'Content-Type', 'Content-Length']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', apiRateLimiter);

// API Routes
app.use('/api', shareRoutes);

// Root Status
app.get('/', (req, res) => {
  res.json({
    name: '10minshare API',
    description: 'Temporary 10-minute file sharing service',
    status: 'Operational',
    version: '1.0.0'
  });
});

// Global Error Handler
app.use(errorHandler);

// Initialize background 10-minute expiration cleanup worker
initCleanupTask();

// Start Server
const PORT = config.port;
app.listen(PORT, () => {
  logger.info(`🚀 10minshare backend running in [${config.nodeEnv}] mode on port ${PORT}`);
  logger.info(`🔗 API Endpoint: http://localhost:${PORT}/api/health`);
});
