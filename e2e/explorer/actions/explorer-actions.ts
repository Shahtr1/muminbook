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

async function gotoWithRetry(page: Page, url: string) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      return;
    } catch (error: any) {
      const message = String(error?.message ?? '');
      const retryable =
        message.includes('ERR_ABORTED') ||
        message.includes('frame was detached');
      if (!retryable || attempt === 2) throw error;
      await page.waitForTimeout(250);
    }
  }
}

const navigation = {
  async openReadingRoot(page: Page) {
    await gotoWithRetry(page, '/reading');
    await page.getByTestId('explorer-reading-folder').click();
  },

  async goToTrash(page: Page) {
    await gotoWithRetry(page, '/reading/trash');
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

  searchInput(page: Page): Locator {
    return page
      .locator(
        '[data-testid="explorer-search-input"], input[placeholder="Search"]'
      )
      .last();
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
/* Search */
/* -------------------------------------------------- */

const search = {
  async set(page: Page, query: string) {
    const input = locators.searchInput(page);
    await expect(input).toBeVisible();
    await input.fill(query);
    await page.waitForTimeout(400);
  },

  async clear(page: Page) {
    const input = locators.searchInput(page);
    await expect(input).toBeVisible();
    await input.fill('');
    await page.waitForTimeout(400);
  },
};

/* -------------------------------------------------- */
/* Menu Helpers */
/* -------------------------------------------------- */

async function openItemMenu(item: Locator) {
  const page = item.page();
  await expect(item.first()).toBeVisible({ timeout: 10000 });
  const blockingModal = page.locator(
    '.chakra-modal__content-container:visible'
  );

  if ((await blockingModal.count()) > 0) {
    await page.keyboard.press('Escape').catch(() => {});
    await blockingModal
      .first()
      .waitFor({ state: 'hidden', timeout: 1500 })
      .catch(() => {});
  }

  const menuButton = item.getByTestId('item-toolbar-menu').first();
  await expect(menuButton).toBeVisible({ timeout: 10000 });

  for (let attempt = 0; attempt < 3; attempt++) {
    await menuButton.click({ force: true });

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

    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(100);
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
    try {
      await input.waitFor({ state: 'hidden', timeout: 7000 });
    } catch {
      // If modal stays mounted longer in CI, dismiss once and re-check.
      await page.keyboard.press('Escape').catch(() => {});
      await expect(input).toHaveCount(0, { timeout: 3000 });
    }
  },
};

/* -------------------------------------------------- */
/* Expectations */
/* -------------------------------------------------- */

const expectors = {
  async folderVisible(page: Page, name: string) {
    try {
      await expect(locators.folder(page, name)).toBeVisible();
    } catch {
      await expect(
        page.getByText(new RegExp(`^\\s*${escapeRegex(name)}\\s*$`))
      ).toBeVisible();
    }
  },

  async fileVisible(page: Page, baseName: string) {
    const name = fileName(baseName);
    try {
      await expect(locators.file(page, name)).toBeVisible();
    } catch {
      await expect(
        page.getByText(new RegExp(`^\\s*${escapeRegex(name)}\\s*$`))
      ).toBeVisible();
    }
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

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const explorer = {
  navigation,
  locators,
  create,
  search,
  trash,
  edit,
  expect: expectors,
};
