import { logger } from '../utils/logger.js';
import { config } from '../config/env.config.js';

export function errorHandler(err, req, res, next) {
  logger.error('Unhandled request error:', err.message || err);

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: `One or more files exceed the maximum size limit of ${config.maxFileSizeMB}MB.`,
    });
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      success: false,
      message: 'Maximum limit of 10 images exceeded.',
    });
  }

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred.',
  });
}
