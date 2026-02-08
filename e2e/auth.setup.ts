import { test as setup, expect } from '@playwright/test';

setup('authenticate admin', async ({ page }) => {
  await page.goto('/login');

  await page.getByPlaceholder('Email address').fill('admin.e2e@muminbook.com');

  await page.getByPlaceholder('Password').fill('E2ETestPassword123!');

  await page.getByRole('button', { name: /sign in/i }).click();

  await page.waitForLoadState('networkidle');

  await expect(page).not.toHaveURL(/login/);

  await page.context().storageState({
    path: 'e2e/.auth/admin.json',
  });
});
