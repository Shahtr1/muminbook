import { test, expect } from '@playwright/test';

test('authenticated user lands on dashboard', async ({ page }) => {
  await page.goto('/');

  await page.waitForLoadState('networkidle');

  await expect(page).toHaveURL(/dashboard/);

  await expect(page).toHaveTitle('Dashboard');
});
