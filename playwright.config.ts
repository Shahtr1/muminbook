import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',

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
      name: 'authenticated',
      dependencies: ['setup'],
      use: {
        storageState: '.auth/admin.json',
      },
    },
  ],

  webServer: [
    {
      command: 'cross-env NODE_ENV=test npm run backend',
      port: 4005,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'vite --mode test --host --port 5174',
      port: 5174,
      reuseExistingServer: !process.env.CI,
      cwd: 'packages/frontend',
    },
  ],
});
