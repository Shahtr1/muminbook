import cron from 'node-cron';
import { permanentlyDeleteTrashedResourcesForJob } from '../services/resource';

cron.schedule('0 3 * * *', async () => {
  // At 3:00 AM everyday
  try {
    const count = await permanentlyDeleteTrashedResourcesForJob();
    if (count !== 0)
      console.log(`[Cron] Deleted ${count} trashed items older than 30 days`);
  } catch (err) {
    console.error('[Cron] Trash cleanup failed:', err);
  }
});
