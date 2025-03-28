import cron from "node-cron";
import { permanentlyDeleteTrashedResourcesforJob } from "../services/resource.service";

cron.schedule("0 3 * * *", async () => {
  // At 3:00 AM everyday
  try {
    const count = await permanentlyDeleteTrashedResourcesforJob();
    if (count !== 0)
      console.log(`[Cron] Deleted ${count} trashed items older than 30 days`);
  } catch (err) {
    console.error("[Cron] Trash cleanup failed:", err);
  }
});
