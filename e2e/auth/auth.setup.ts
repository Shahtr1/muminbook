import { test as setup, expect } from '@playwright/test';

setup('authenticate admin', async ({ page }) => {
  await page.goto('/login');

  await page.getByPlaceholder('Email address').fill('admin.e2e@muminbook.com');

  await page.getByPlaceholder('Password').fill('E2ETestPassword123!');

  const [response] = await Promise.all([
    page.waitForResponse((resp) => resp.url().includes('/auth/login')),
    page.getByRole('button', { name: /sign in/i }).click(),
  ]);

  expect(response.status()).toBe(200);

  await page.waitForURL('/');

  await page.context().storageState({
    path: 'e2e/.auth/admin.json',
  });
});
