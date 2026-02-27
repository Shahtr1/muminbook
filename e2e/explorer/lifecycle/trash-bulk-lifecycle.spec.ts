import { expect, test, type Page } from '@playwright/test';
import { explorer } from '../actions/explorer-actions';

const API_BASE = 'http://localhost:4005';

const openBulkTrashMenu = async (page: Page) => {
  await page.getByTestId('trash-actions-menu').click();
  await expect(page.getByTestId('restore-all')).toBeVisible();
};

const confirmModal = async (page: Page) => {
  const confirmBtn = page.getByTestId('confirm-submit');
  await expect(confirmBtn).toBeVisible();
  await confirmBtn.click();
};

const emptyTrashViaUI = async (page: Page) => {
  await explorer.navigation.goToTrash(page);
  await openBulkTrashMenu(page);
  await page.getByTestId('empty-trash').click();
  await confirmModal(page);
};

const restoreAllViaUI = async (page: Page) => {
  await explorer.navigation.goToTrash(page);
  await openBulkTrashMenu(page);
  await page.getByTestId('restore-all').click();
  await confirmModal(page);
};

const getTrashItems = async (page: Page) => {
  const res = await page.request.get(`${API_BASE}/resources/trash`);
  expect(res.ok()).toBeTruthy();
  return res.json();
};

const isTrashEmpty = async (page: Page) => {
  const res = await page.request.get(`${API_BASE}/resources/is-trash-empty`);
  expect(res.ok()).toBeTruthy();
  return res.json();
};

const byName = (items: any[], name: string, type: 'file' | 'folder') =>
  items.find((r) => r.name === name && r.type === type);

test.describe('Trash Bulk Operations', () => {
  test.setTimeout(120_000);

  test('empty trash when already empty → no error', async ({ page }) => {
    await emptyTrashViaUI(page);
    await explorer.expect.toastVisible(page, 'Trash emptied');

    const items = await getTrashItems(page);
    expect(items).toEqual([]);
  });

  test('empty trash → permanently deletes all items', async ({ page }) => {
    const id = `${Date.now()}`;
    const a = `bulk-empty-a-${id}`;
    const b = `bulk-empty-b-${id}`;

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.folder(page, a);
    await explorer.create.folder(page, b);

    await explorer.trash.move(page, explorer.locators.folder(page, a));
    await explorer.trash.move(page, explorer.locators.folder(page, b));

    await emptyTrashViaUI(page);

    await explorer.expect.toastVisible(page, 'Trash emptied');
    const trashItems = await getTrashItems(page);
    expect(byName(trashItems, a, 'folder')).toBeFalsy();
    expect(byName(trashItems, b, 'folder')).toBeFalsy();
  });

  test('restore all when trash empty → no-op', async ({ page }) => {
    await emptyTrashViaUI(page);

    await restoreAllViaUI(page);

    await explorer.expect.toastVisible(page, 'All possible resources restored');
    const trashItems = await getTrashItems(page);
    expect(trashItems).toEqual([]);
  });

  test('restore all → restores non-conflicting items and leaves conflicting ones in trash', async ({
    page,
  }) => {
    const id = `${Date.now()}`;
    const restorable = `bulk-restore-ok-${id}`;
    const conflict = `bulk-restore-conflict-${id}`;

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.folder(page, restorable);
    await explorer.create.folder(page, conflict);

    await explorer.trash.move(page, explorer.locators.folder(page, restorable));
    await explorer.trash.move(page, explorer.locators.folder(page, conflict));

    await explorer.create.folder(page, conflict);

    await restoreAllViaUI(page);

    await explorer.navigation.openReadingRoot(page);
    await explorer.expect.folderVisible(page, restorable);
    await explorer.expect.folderVisible(page, conflict);

    const trashItems = await getTrashItems(page);
    expect(byName(trashItems, restorable, 'folder')).toBeFalsy();
    expect(byName(trashItems, conflict, 'folder')).toBeTruthy();
  });

  test('empty trash removes trashed parent and all descendants', async ({
    page,
  }) => {
    const id = `${Date.now()}`;
    const parentName = `bulk-subtree-parent-${id}`;
    const childFolder = `bulk-subtree-child-${id}`;
    const childFileBase = `bulk-subtree-file-${id}`;
    const childFile = `${childFileBase}.txt`;

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.folder(page, parentName);

    await page.goto(`/reading/my-files/${encodeURIComponent(parentName)}`);
    await explorer.create.folder(page, childFolder);
    await explorer.create.file(page, childFileBase);
    await explorer.expect.folderVisible(page, childFolder);
    await explorer.expect.fileVisible(page, childFileBase);

    await explorer.navigation.openReadingRoot(page);
    await explorer.trash.move(page, explorer.locators.folder(page, parentName));
    await explorer.navigation.goToTrash(page);
    await explorer.expect.folderVisible(page, parentName);

    await emptyTrashViaUI(page);
    await explorer.expect.toastVisible(page, 'Trash emptied');

    const empty = await isTrashEmpty(page);
    expect(empty).toBe(true);

    await explorer.navigation.openReadingRoot(page);
    await explorer.expect.folderNotVisible(page, parentName);

    await explorer.navigation.goToTrash(page);
    await explorer.expect.folderNotVisible(page, parentName);
    await explorer.expect.folderNotVisible(page, childFolder);
    await explorer.expect.fileNotVisible(page, childFileBase);
  });

  test('restore all → shows toast indicating partial success', async ({
    page,
  }) => {
    const id = `${Date.now()}`;
    const ok = `bulk-toast-ok-${id}`;
    const blocked = `bulk-toast-blocked-${id}`;

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.folder(page, ok);
    await explorer.create.folder(page, blocked);

    await explorer.trash.move(page, explorer.locators.folder(page, ok));
    await explorer.trash.move(page, explorer.locators.folder(page, blocked));
    await explorer.create.folder(page, blocked);

    await restoreAllViaUI(page);

    await explorer.expect.toastVisible(page, 'All possible resources restored');

    const trashItems = await getTrashItems(page);
    expect(byName(trashItems, ok, 'folder')).toBeFalsy();
    expect(byName(trashItems, blocked, 'folder')).toBeTruthy();
  });
});
