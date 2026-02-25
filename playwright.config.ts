import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',

  workers: 1,
  fullyParallel: false, // prevent per-file parallelism

  use: {
    baseURL: 'http://localhost:5174',
    headless: !!process.env.CI,
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'default',
      dependencies: ['setup'],
      use: {
        storageState: 'e2e/.auth/admin.json',
      },
    },
  ],

  webServer: [
    {
      command: 'npm run backend',
      env: {
        NODE_ENV: 'test',
      },
      port: 4005,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'npm run frontend -- --mode test --host --port 5174',
      port: 5174,
      reuseExistingServer: !process.env.CI,
      cwd: 'packages/frontend',
    },
  ],
});
