import cron from 'node-cron';
import { NODE_ENV, RENDER_BACKEND_URL } from '../constants/env';

// Ping the server every 14 minutes to prevent Render from putting it to sleep
// Render free tier sleeps after 15 minutes of inactivity
// Keep-alive is enabled only when RENDER_BACKEND_URL is provided and NODE_ENV is 'production'
cron.schedule('*/14 * * * *', async () => {
  // Only run in production (Render deployment) and if RENDER_BACKEND_URL is set
  if (NODE_ENV === 'production' && RENDER_BACKEND_URL) {
    try {
      const response = await fetch(`${RENDER_BACKEND_URL}/`, {
        method: 'GET',
      });

      if (response.ok) {
        console.log(
          `[Keep-Alive] Server pinged successfully at ${new Date().toISOString()}`
        );
      } else {
        console.error(
          `[Keep-Alive] Ping failed with status: ${response.status}`
        );
      }
    } catch (err) {
      console.error('[Keep-Alive] Ping error:', err);
    }
  }
});
