import { Page, Locator, expect } from '@playwright/test';

/* -------------------------------------------------- */
/* Navigation */
/* -------------------------------------------------- */

const navigation = {
  async openReadingRoot(page: Page) {
    await page.goto('/reading');
    await page.getByTestId('explorer-reading-folder').click();
  },

  async goToTrash(page: Page) {
    await page.goto('/reading/trash');
  },
};

/* -------------------------------------------------- */
/* Locators */
/* -------------------------------------------------- */

const locators = {
  folder(page: Page, name: string): Locator {
    return page.getByTestId('folder-item').filter({ hasText: name });
  },

  file(page: Page, name: string): Locator {
    return page.getByTestId('file-item').filter({ hasText: name });
  },
};

/* -------------------------------------------------- */
/* Creation */
/* -------------------------------------------------- */

const create = {
  async folder(page: Page, name: string) {
    await page.getByTestId('explorer-add').click();
    await page.getByTestId('add-folder-option').click();
    await page.getByTestId('add-input').fill(name);

    const confirmBtn = page.getByTestId('confirm-create');
    await expect(confirmBtn).toBeVisible();
    await confirmBtn.click();
  },

  async file(page: Page, name: string) {
    await page.getByTestId('explorer-add').click();
    await page.getByTestId('add-file-option').click();
    await page.getByTestId('add-input').fill(name);

    const confirmBtn = page.getByTestId('confirm-create');
    await expect(confirmBtn).toBeVisible();
    await confirmBtn.click();
  },
};

/* -------------------------------------------------- */
/* Safe Menu Click */

/* -------------------------------------------------- */

async function openItemMenu(item: Locator) {
  const menuButton = item.getByTestId('item-toolbar-menu');
  await expect(menuButton).toBeVisible();
  await menuButton.click();
}

/* -------------------------------------------------- */
/* Safe Menu Item Click */

/* -------------------------------------------------- */

async function clickMenuItem(page: Page, name: string) {
  const menuItem = page.getByRole('menuitem', { name });

  await expect(menuItem).toBeVisible();
  await menuItem.click();
}

/* -------------------------------------------------- */
/* Optional Confirm (Only If Modal Appears) */

/* -------------------------------------------------- */

async function maybeConfirm(page: Page) {
  const confirmBtn = page.getByTestId('confirm-submit');

  // Wait briefly to see if confirmation appears
  try {
    await confirmBtn.waitFor({ state: 'visible', timeout: 1000 });

    await expect(confirmBtn).toBeEnabled();
    await confirmBtn.click();

    // Wait for it to disappear if it exists
    await confirmBtn.waitFor({ state: 'hidden', timeout: 5000 });
  } catch {
    // No confirmation modal appeared — continue silently
  }
}

/* -------------------------------------------------- */
/* Trash / Restore / Delete */
/* -------------------------------------------------- */

const trash = {
  async move(page: Page, item: Locator) {
    await openItemMenu(item);
    await clickMenuItem(page, 'Move to Trash');
    await maybeConfirm(page);
  },

  async restore(page: Page, item: Locator) {
    await openItemMenu(item);
    await clickMenuItem(page, 'Restore');
    await maybeConfirm(page);
  },

  async delete(page: Page, item: Locator) {
    await openItemMenu(item);
    await clickMenuItem(page, 'Delete');
    await maybeConfirm(page);
  },
};

/* -------------------------------------------------- */
/* Expectations */
/* -------------------------------------------------- */

const expectors = {
  async folderVisible(page: Page, name: string) {
    await expect(locators.folder(page, name)).toBeVisible();
  },

  async fileVisible(page: Page, name: string) {
    await expect(locators.file(page, name)).toBeVisible();
  },

  async folderNotVisible(page: Page, name: string) {
    await expect(locators.folder(page, name)).toHaveCount(0);
  },

  async fileNotVisible(page: Page, name: string) {
    await expect(locators.file(page, name)).toHaveCount(0);
  },
};

export const explorer = {
  navigation,
  locators,
  create,
  trash,
  expect: expectors,
};
