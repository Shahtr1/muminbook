import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',

  use: {
    baseURL: 'http://localhost:5173',
    headless: !!process.env.CI,
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'authenticated',
      dependencies: ['setup'],
      use: {
        storageState: 'e2e/.auth/admin.json',
      },
    },
  ],

  webServer: [
    {
      command: 'cross-env NODE_ENV=test npm run backend',
      port: 4004,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'npm run frontend',
      port: 5173,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
