import { expect, test } from '@playwright/test';
import { explorer } from '../actions/explorer-actions';

const API_BASE = 'http://localhost:4005';

const withIndexSuffix = (name: string, index: number) => {
  const suffix = ` (${index})`;
  const maxBaseLength = 100 - suffix.length;
  return `${name.slice(0, maxBaseLength)}${suffix}`;
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

test.describe('Copy Explorer Lifecycle', () => {
  test.setTimeout(120_000);

  test('file lifecycle → create → copy → trash original → restore', async ({
    page,
  }) => {
    const base = `copy-file-${Date.now()}`;

    await explorer.navigation.openReadingRoot(page);

    await explorer.create.file(page, base);
    await explorer.search.set(page, base);
    await explorer.edit.copy(
      page,
      explorer.locators.file(page, `${base}.txt`),
      'my-files'
    );

    await expect(explorer.locators.file(page, `${base}.txt`)).toBeVisible();
    await expect(explorer.locators.file(page, `${base}.txt (1)`)).toBeVisible();

    await explorer.trash.move(
      page,
      explorer.locators.file(page, `${base}.txt`)
    );
    await explorer.search.set(page, base);
    await expect(explorer.locators.file(page, `${base}.txt`)).toHaveCount(0);
    await expect(explorer.locators.file(page, `${base}.txt (1)`)).toBeVisible();

    await explorer.navigation.goToTrash(page);
    await expect(explorer.locators.file(page, `${base}.txt`)).toBeVisible();

    await restoreTrashedByName(page, `${base}.txt`, 'file');

    await explorer.navigation.openReadingRoot(page);
    await explorer.search.set(page, base);
    await expect(explorer.locators.file(page, `${base}.txt`)).toBeVisible();
    await expect(explorer.locators.file(page, `${base}.txt (1)`)).toBeVisible();
  });

  test('folder lifecycle → create → copy → trash original → restore', async ({
    page,
  }) => {
    const base = `copy-folder-${Date.now()}`;

    await explorer.navigation.openReadingRoot(page);

    await explorer.create.folder(page, base);
    await explorer.search.set(page, base);
    await explorer.edit.copy(
      page,
      explorer.locators.folder(page, base),
      'my-files'
    );

    await explorer.expect.folderVisible(page, base);
    await explorer.expect.folderVisible(page, `${base} (1)`);

    await explorer.trash.move(page, explorer.locators.folder(page, base));
    await explorer.search.set(page, base);
    await explorer.expect.folderNotVisible(page, base);
    await explorer.expect.folderVisible(page, `${base} (1)`);

    await explorer.navigation.goToTrash(page);
    await explorer.expect.folderVisible(page, base);

    await restoreTrashedByName(page, base, 'folder');

    await explorer.navigation.openReadingRoot(page);
    await explorer.search.set(page, base);
    await explorer.expect.folderVisible(page, base);
    await explorer.expect.folderVisible(page, `${base} (1)`);
  });

  test('copied file lifecycle → trash copy → restore', async ({ page }) => {
    const base = `copy-trash-${Date.now()}`;

    await explorer.navigation.openReadingRoot(page);

    await explorer.create.file(page, base);
    await explorer.search.set(page, base);
    await explorer.edit.copy(
      page,
      explorer.locators.file(page, `${base}.txt`),
      'my-files'
    );

    await explorer.trash.move(
      page,
      explorer.locators.file(page, `${base}.txt (1)`)
    );
    await explorer.search.set(page, base);
    await expect(explorer.locators.file(page, `${base}.txt (1)`)).toHaveCount(
      0
    );

    await explorer.navigation.goToTrash(page);
    await expect(explorer.locators.file(page, `${base}.txt (1)`)).toBeVisible();

    await restoreTrashedByName(page, `${base}.txt (1)`, 'file');

    await explorer.navigation.openReadingRoot(page);
    await explorer.search.set(page, base);
    await expect(explorer.locators.file(page, `${base}.txt (1)`)).toBeVisible();
  });

  test('copy folder into same directory → auto-rename with (1) → (2) → (3)', async ({
    page,
  }) => {
    const base = `folder-seq-${Date.now()}`;

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.folder(page, base);
    await explorer.search.set(page, base);

    await explorer.edit.copy(
      page,
      explorer.locators.folder(page, base),
      'my-files'
    );
    await explorer.edit.copy(
      page,
      explorer.locators.folder(page, base),
      'my-files'
    );
    await explorer.edit.copy(
      page,
      explorer.locators.folder(page, base),
      'my-files'
    );

    await explorer.expect.folderVisible(page, `${base} (1)`);
    await explorer.expect.folderVisible(page, `${base} (2)`);
    await explorer.expect.folderVisible(page, `${base} (3)`);
  });

  test('copy file into same directory → auto-rename with (1) → (2) → (3)', async ({
    page,
  }) => {
    const base = `file-seq-${Date.now()}`;

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.file(page, base);
    await explorer.search.set(page, base);

    await explorer.edit.copy(
      page,
      explorer.locators.file(page, `${base}.txt`),
      'my-files'
    );
    await explorer.edit.copy(
      page,
      explorer.locators.file(page, `${base}.txt`),
      'my-files'
    );
    await explorer.edit.copy(
      page,
      explorer.locators.file(page, `${base}.txt`),
      'my-files'
    );

    await expect(explorer.locators.file(page, `${base}.txt (1)`)).toBeVisible();
    await expect(explorer.locators.file(page, `${base}.txt (2)`)).toBeVisible();
    await expect(explorer.locators.file(page, `${base}.txt (3)`)).toBeVisible();
  });

  test('copy item at max length boundary → base truncated to fit (1) suffix', async ({
    page,
  }) => {
    const suffix = `${Date.now()}`.slice(-10);
    const base = `${'A'.repeat(90)}${suffix}`;

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.folder(page, base);
    await explorer.search.set(page, base);
    await explorer.edit.copy(
      page,
      explorer.locators.folder(page, base),
      'my-files'
    );

    await explorer.expect.folderVisible(page, withIndexSuffix(base, 1));
  });

  test('copy item when (1) exists → uses max + 1 strategy', async ({
    page,
  }) => {
    const base = `copy-max-${Date.now()}`;

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.folder(page, base);
    await explorer.search.set(page, base);

    await explorer.edit.copy(
      page,
      explorer.locators.folder(page, base),
      'my-files'
    );
    await explorer.edit.copy(
      page,
      explorer.locators.folder(page, base),
      'my-files'
    );

    await explorer.expect.folderVisible(page, `${base} (1)`);
    await explorer.expect.folderVisible(page, `${base} (2)`);
  });

  test('copy item respects normalization before conflict detection', async ({
    page,
  }) => {
    const token = Date.now();
    const raw = `My   Folder   Name   ${token}`;
    const normalized = `My Folder Name ${token}`;

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.folder(page, raw);
    await explorer.search.set(page, normalized);

    await explorer.edit.copy(
      page,
      explorer.locators.folder(page, normalized),
      'my-files'
    );

    await explorer.expect.folderVisible(page, normalized);
    await explorer.expect.folderVisible(page, `${normalized} (1)`);
  });

  test('copy item when truncated base conflicts → increments suffix deterministically', async ({
    page,
  }) => {
    const suffix = `${Date.now()}`.slice(-10);
    const base = `${'B'.repeat(90)}${suffix}`;

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.folder(page, base);
    await explorer.search.set(page, base);

    await explorer.edit.copy(
      page,
      explorer.locators.folder(page, base),
      'my-files'
    );
    await explorer.edit.copy(
      page,
      explorer.locators.folder(page, base),
      'my-files'
    );
    await explorer.edit.copy(
      page,
      explorer.locators.folder(page, base),
      'my-files'
    );

    await explorer.expect.folderVisible(page, withIndexSuffix(base, 1));
    await explorer.expect.folderVisible(page, withIndexSuffix(base, 2));
    await explorer.expect.folderVisible(page, withIndexSuffix(base, 3));
  });
});
