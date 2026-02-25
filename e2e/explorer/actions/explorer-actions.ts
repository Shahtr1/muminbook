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
    return page.locator(
      `[data-testid="folder-item"][data-resource-name="${name}"]`
    );
  },

  file(page: Page, name: string): Locator {
    return page.locator(
      `[data-testid="file-item"][data-resource-name="${name}"]`
    );
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
  const menuButton = item.getByTestId('item-toolbar-menu').first();
  await expect(menuButton).toBeVisible({ timeout: 10000 });

  for (let attempt = 0; attempt < 3; attempt++) {
    await menuButton.click();

    const menuId = await menuButton.getAttribute('aria-controls');
    if (menuId) {
      const scopedMenu = item.page().locator(`[id="${menuId}"]`);
      try {
        await expect(scopedMenu).toBeVisible({ timeout: 1200 });
        return scopedMenu;
      } catch {
        // Fallback below if this specific menu is not visible yet.
      }
    }

    const fallbackMenu = item.page().locator('[role="menu"]:visible').last();
    if ((await fallbackMenu.count()) > 0) {
      await expect(fallbackMenu).toBeVisible({ timeout: 1200 });
      return fallbackMenu;
    }

    await item
      .page()
      .keyboard.press('Escape')
      .catch(() => {});
    await item.page().waitForTimeout(100);
  }

  throw new Error('Failed to open item menu after retries');
}

async function clickMenuItem(menu: Locator, name: string, testId?: string) {
  const menuItem = testId
    ? menu.getByTestId(testId).first()
    : menu.getByRole('menuitem', { name }).first();
  await expect(menuItem).toBeVisible();
  await menuItem.click({ force: true });
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
    const menu = await openItemMenu(item);
    await clickMenuItem(menu, 'Move to Trash', 'move-to-trash');
    await maybeConfirm(page);
  },

  async restore(page: Page, item: Locator) {
    const menu = await openItemMenu(item);
    await clickMenuItem(menu, 'Restore', 'restore');
    await maybeConfirm(page);
  },

  async delete(page: Page, item: Locator) {
    const menu = await openItemMenu(item);
    await clickMenuItem(menu, 'Delete', 'delete');
    await maybeConfirm(page);
  },
};

/* -------------------------------------------------- */
/* Rename / Move */
/* -------------------------------------------------- */

const edit = {
  async rename(page: Page, item: Locator, newName: string) {
    const menu = await openItemMenu(item);
    await clickMenuItem(menu, 'Rename', 'rename');

    const input = page.getByPlaceholder('New name');
    await expect(input).toBeVisible();
    await input.fill(newName);

    const renameBtn = page.getByRole('button', { name: 'Rename' });
    await expect(renameBtn).toBeVisible();
    await renameBtn.click();
    try {
      await input.waitFor({ state: 'hidden', timeout: 5000 });
    } catch {
      // Validation errors keep modal open; caller assertions handle this path.
    }
  },

  async move(page: Page, item: Locator, destinationPath: string) {
    const menu = await openItemMenu(item);
    await clickMenuItem(menu, 'Move to Folder', 'move-to-folder');

    const input = page.getByPlaceholder('Enter destination path');
    await expect(input).toBeVisible();
    await input.fill(destinationPath);

    const moveBtn = page.getByRole('button', { name: 'Move' });
    await expect(moveBtn).toBeVisible();
    await moveBtn.click();
    await input.waitFor({ state: 'hidden', timeout: 5000 });
  },

  async copy(page: Page, item: Locator, destinationPath: string) {
    const input = page.getByTestId('transfer-destination-input');
    let opened = false;

    for (let attempt = 0; attempt < 3 && !opened; attempt++) {
      const menu = await openItemMenu(item);
      await clickMenuItem(menu, 'Copy', 'copy');

      try {
        await input.waitFor({ state: 'visible', timeout: 1500 });
        opened = true;
      } catch {
        // Retry opening copy modal if menu click did not trigger it.
      }
    }

    await expect(input).toBeVisible();
    await input.fill(destinationPath);

    const copyBtn = page.getByTestId('transfer-copy-submit');
    await expect(copyBtn).toBeVisible();
    await copyBtn.click();
    await input.waitFor({ state: 'hidden', timeout: 5000 });
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
