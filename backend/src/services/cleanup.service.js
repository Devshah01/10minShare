import cron from 'node-cron';
import { shareService } from './share.service.js';
import { logger } from '../utils/logger.js';

export function initCleanupTask() {
  // Run every 1 minute
  cron.schedule('* * * * *', async () => {
    try {
      logger.info('Running scheduled 10-minute expiration cleanup task...');
      await shareService.purgeExpiredShares();
    } catch (err) {
      logger.error('Error during scheduled expiration cleanup task:', err);
    }
  });

  logger.info('Expiration cleanup cron task initialized (runs every 1 minute)');
}
