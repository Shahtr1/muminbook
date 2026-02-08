import { test, expect } from '@playwright/test';

test('authenticated user can access root route', async ({ page }) => {
  await page.goto('/');

  await page.waitForLoadState('networkidle');

  await expect(page).not.toHaveURL(/login/);
});
