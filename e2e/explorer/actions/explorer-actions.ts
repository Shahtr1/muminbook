import { Page, Locator, expect } from '@playwright/test';

const navigation = {
  async openReadingRoot(page: Page) {
    await page.goto('/reading');
    await page.getByTestId('explorer-reading-folder').click();
  },

  async goToTrash(page: Page) {
    await page.goto('/reading/trash');
  },
};

const locators = {
  folder(page: Page, name: string): Locator {
    return page.getByTestId('folder-item').filter({ hasText: name });
  },

  file(page: Page, name: string): Locator {
    return page.getByTestId('file-item').filter({ hasText: name });
  },
};

const create = {
  async folder(page: Page, name: string) {
    await page.getByTestId('explorer-add').click();
    await page.getByTestId('add-folder-option').click();
    await page.getByTestId('add-input').fill(name);
    await page.getByTestId('confirm-create').click();
  },

  async file(page: Page, name: string) {
    await page.getByTestId('explorer-add').click();
    await page.getByTestId('add-file-option').click();
    await page.getByTestId('add-input').fill(name);
    await page.getByTestId('confirm-create').click();
  },
};

const trash = {
  async move(page: Page, item: Locator) {
    await item.getByTestId('item-toolbar-menu').click();
    await page.getByRole('menuitem', { name: 'Move to Trash' }).click();
    await page.getByTestId('confirm-submit').click();
  },

  async restore(page: Page, item: Locator) {
    await item.getByTestId('item-toolbar-menu').click();
    await page.getByRole('menuitem', { name: 'Restore' }).click();
    await page.getByTestId('confirm-submit').click();
  },

  async delete(page: Page, item: Locator) {
    await item.getByTestId('item-toolbar-menu').click();
    await page.getByRole('menuitem', { name: 'Delete' }).click();
    await page.getByTestId('confirm-submit').click();
  },
};

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
