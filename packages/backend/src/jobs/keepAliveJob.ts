import cron from 'node-cron';
import { NODE_ENV, RENDER_BACKEND_URL } from '../constants/env';

// Keep-Alive job has been intentionally disabled.
// Use an external uptime monitor (UptimeRobot, Cron-job.org) or a Render Scheduled Job
// to reliably ping the app and keep it awake on shared/free hosting plans.

console.info(
  '[Keep-Alive] disabled - use an external uptime monitor or Render Scheduled Job to keep the service awake'
);

export {}; // keep module shape
