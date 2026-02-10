import { test, expect } from '@playwright/test';

test.describe('Explorer - My Files', () => {
  test('should open my-files route', async ({ page }) => {
    await page.goto('/reading/my-files');

    await expect(page).toHaveURL(/reading\/my-files/);
  });
});
