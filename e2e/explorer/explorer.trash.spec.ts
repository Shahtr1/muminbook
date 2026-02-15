import { test, expect } from '@playwright/test';

test.describe('Explorer - Trash', () => {
  test('should open trash route', async ({ page }) => {
    await page.goto('/reading/trash');

    await expect(page).toHaveURL(/reading\/trash/);
  });
});
