import cron from 'node-cron';
import { permanentlyDeleteTrashedResourcesForJob } from '../services/resource/index.js';
import { log } from '../utils/log.js';

cron.schedule('0 3 * * *', async () => {
  // At 3:00 AM everyday
  try {
    const count = await permanentlyDeleteTrashedResourcesForJob();
    if (count !== 0)
      log.info(`[Cron] Deleted ${count} trashed items older than 30 days`);
  } catch (err) {
    log.error('[Cron] Trash cleanup failed', err);
  }
});
