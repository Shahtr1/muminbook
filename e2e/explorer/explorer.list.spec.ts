import { test, expect } from '@playwright/test';

test.describe('Explorer - List View', () => {
  test('should load explorer index page', async ({ page }) => {
    await page.goto('/reading');

    await expect(page).toHaveURL('/reading');
  });
});
