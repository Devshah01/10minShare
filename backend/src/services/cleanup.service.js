import cron from 'node-cron';
import { shareService } from './share.service.js';
import { logger } from '../utils/logger.js';

export function initCleanupTask() {
  // Run every 1 minute
  cron.schedule('* * * * *', async () => {
    try {
      await shareService.purgeExpiredShares();
    } catch (err) {
      logger.error('Error during scheduled expiration cleanup task:', err);
    }
  });

  logger.info('Expiration cleanup cron task initialized (runs every 1 minute)');
}
