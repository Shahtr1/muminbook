import { Page, Locator, expect } from '@playwright/test';

/* -------------------------------------------------- */
/* Helpers */

/* -------------------------------------------------- */

function fileName(base: string) {
  return `${base}.txt`;
}

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

  toast(page: Page, message: string): Locator {
    return page.locator('.chakra-alert').filter({ hasText: message });
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

  async file(page: Page, baseName: string) {
    await page.getByTestId('explorer-add').click();
    await page.getByTestId('add-file-option').click();
    await page.getByTestId('add-input').fill(baseName);

    const confirmBtn = page.getByTestId('confirm-create');
    await expect(confirmBtn).toBeVisible();
    await confirmBtn.click();
  },
};

/* -------------------------------------------------- */
/* Menu Helpers */
/* -------------------------------------------------- */

async function openItemMenu(item: Locator) {
  const menuButton = item.getByTestId('item-toolbar-menu');
  await expect(menuButton).toBeVisible();
  await menuButton.click();
}

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
/* Rename / Move */
/* -------------------------------------------------- */

const edit = {
  async rename(page: Page, item: Locator, newName: string) {
    await openItemMenu(item);
    await clickMenuItem(page, 'Rename');

    const input = page.getByPlaceholder('New name');
    await expect(input).toBeVisible();
    await input.fill(newName);

    const renameBtn = page.getByRole('button', { name: 'Rename' });
    await expect(renameBtn).toBeVisible();
    await renameBtn.click();
  },

  async move(page: Page, item: Locator, destinationPath: string) {
    await openItemMenu(item);
    await clickMenuItem(page, 'Move to Folder');

    const input = page.getByPlaceholder('Enter destination path');
    await expect(input).toBeVisible();
    await input.fill(destinationPath);

    const moveBtn = page.getByRole('button', { name: 'Move' });
    await expect(moveBtn).toBeVisible();
    await moveBtn.click();
  },
};

/* -------------------------------------------------- */
/* Expectations */
/* -------------------------------------------------- */

const expectors = {
  async folderVisible(page: Page, name: string) {
    await expect(locators.folder(page, name)).toBeVisible();
  },

  async fileVisible(page: Page, baseName: string) {
    await expect(locators.file(page, fileName(baseName))).toBeVisible();
  },

  async folderNotVisible(page: Page, name: string) {
    await expect(locators.folder(page, name)).toHaveCount(0);
  },

  async fileNotVisible(page: Page, baseName: string) {
    await expect(locators.file(page, fileName(baseName))).toHaveCount(0);
  },

  async toastVisible(page: Page, message: string) {
    await expect(
      page.locator('.chakra-alert').filter({ hasText: message })
    ).toBeVisible();
  },
};

export const explorer = {
  navigation,
  locators,
  create,
  trash,
  edit,
  expect: expectors,
};
