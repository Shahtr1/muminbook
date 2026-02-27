import { expect, test } from '@playwright/test';
import { explorer } from '../actions/explorer-actions';

const API_BASE = 'http://localhost:4005';
const MAX_NAME_LENGTH = 100;

const withIndexedPrefix = (name: string, index: number) => {
  const prefix = `(${index}) `;
  const maxBaseLength = Math.max(1, MAX_NAME_LENGTH - prefix.length);
  const base = name.slice(0, maxBaseLength).trimEnd();
  return `${prefix}${base}`;
};

const getTrashItems = async (page: any) => {
  const res = await page.request.get(`${API_BASE}/resources/trash`);
  expect(res.ok()).toBeTruthy();
  return res.json();
};

const restoreTrashedByName = async (
  page: any,
  name: string,
  type: 'file' | 'folder'
) => {
  const items = await getTrashItems(page);
  const match = items.find((r: any) => r.name === name && r.type === type);
  expect(match).toBeTruthy();

  const res = await page.request.patch(
    `${API_BASE}/resources/${match._id}/restore`
  );
  expect(res.ok()).toBeTruthy();
};

test.describe('Trash Conflict & Rename Semantics', () => {
  test.setTimeout(120_000);

  test('trash folder → recreate same name → trash again → trash allows duplicates', async ({
    page,
  }) => {
    const folder = `trash-dup-${Date.now()}`;

    await explorer.navigation.openReadingRoot(page);

    await explorer.create.folder(page, folder);
    await explorer.trash.move(page, explorer.locators.folder(page, folder));

    await explorer.create.folder(page, folder);
    await explorer.trash.move(page, explorer.locators.folder(page, folder));

    await explorer.navigation.goToTrash(page);
    await explorer.expect.folderVisible(page, folder);

    const trashItems = await getTrashItems(page);
    const sameNameFolders = trashItems.filter(
      (r: any) => r.type === 'folder' && r.name === folder
    );

    expect(sameNameFolders.length).toBeGreaterThanOrEqual(1);
  });

  test('restore folder when active name conflict exists → auto-rename with (1)', async ({
    page,
  }) => {
    const base = `trash-restore-${Date.now()}`;

    await explorer.navigation.openReadingRoot(page);

    await explorer.create.folder(page, base);
    await explorer.trash.move(page, explorer.locators.folder(page, base));

    await explorer.create.folder(page, base);
    await explorer.expect.folderVisible(page, base);

    await explorer.navigation.goToTrash(page);
    await restoreTrashedByName(page, base, 'folder');

    await explorer.navigation.openReadingRoot(page);
    await explorer.expect.folderVisible(page, base);
    await explorer.expect.folderVisible(page, `(1) ${base}`);
  });

  test('restore folder when (1) exists → auto-increment using max + 1 strategy', async ({
    page,
  }) => {
    const base = `trash-restore-max-${Date.now()}`;

    await explorer.navigation.openReadingRoot(page);

    await explorer.create.folder(page, base);
    await explorer.trash.move(page, explorer.locators.folder(page, base));

    await explorer.create.folder(page, base);
    await explorer.trash.move(page, explorer.locators.folder(page, base));
    await explorer.create.folder(page, base);

    await explorer.navigation.goToTrash(page);
    await restoreTrashedByName(page, base, 'folder');

    // Generate a fresh trashed original while keeping both base and "(1)" active.
    await explorer.navigation.openReadingRoot(page);
    await explorer.trash.move(page, explorer.locators.folder(page, base));
    await explorer.create.folder(page, base);

    await explorer.navigation.goToTrash(page);
    await restoreTrashedByName(page, base, 'folder');

    await explorer.navigation.openReadingRoot(page);
    await explorer.expect.folderVisible(page, base);
    await explorer.expect.folderVisible(page, `(1) ${base}`);
    await explorer.expect.folderVisible(page, `(2) ${base}`);
  });

  test('restore folder respects normalization before conflict detection', async ({
    page,
  }) => {
    const token = Date.now();
    const raw = `My   Restored   Folder   ${token}`;
    const normalized = `My Restored Folder ${token}`;

    await explorer.navigation.openReadingRoot(page);

    await explorer.create.folder(page, raw);
    await explorer.trash.move(page, explorer.locators.folder(page, normalized));

    await explorer.create.folder(page, normalized);

    await explorer.navigation.goToTrash(page);
    await restoreTrashedByName(page, normalized, 'folder');

    await explorer.navigation.openReadingRoot(page);
    await explorer.expect.folderVisible(page, normalized);
    await explorer.expect.folderVisible(page, `(1) ${normalized}`);
  });

  test('restore folder respects case sensitivity', async ({ page }) => {
    const base = `case-${Date.now()}`;
    const lower = `${base}-folder`;
    const upper = `${base}-FOLDER`;

    await explorer.navigation.openReadingRoot(page);

    await explorer.create.folder(page, lower);
    await explorer.trash.move(page, explorer.locators.folder(page, lower));

    await explorer.create.folder(page, upper);

    await explorer.navigation.goToTrash(page);
    await restoreTrashedByName(page, lower, 'folder');

    await explorer.navigation.openReadingRoot(page);
    await explorer.expect.folderVisible(page, lower);
    await explorer.expect.folderVisible(page, upper);
  });

  test('restore at max length boundary → base truncated to fit suffix', async ({
    page,
  }) => {
    const suffix = `${Date.now()}`.slice(-10);
    const base = `${'R'.repeat(90)}${suffix}`;

    await explorer.navigation.openReadingRoot(page);

    await explorer.create.folder(page, base);
    await explorer.trash.move(page, explorer.locators.folder(page, base));

    await explorer.create.folder(page, base);

    await explorer.navigation.goToTrash(page);
    await restoreTrashedByName(page, base, 'folder');

    await explorer.navigation.openReadingRoot(page);
    await explorer.expect.folderVisible(page, base);
    await explorer.expect.folderVisible(page, withIndexedPrefix(base, 1));
  });
});
