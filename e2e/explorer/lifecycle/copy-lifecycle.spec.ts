import { expect, test } from '@playwright/test';
import { explorer } from '../actions/explorer-actions';

const API_BASE = 'http://localhost:4005';

const withIndexPrefix = (name: string, index: number) => {
  const prefix = `(${index}) `;
  const maxBaseLength = 100 - prefix.length;
  return `${prefix}${name.slice(0, maxBaseLength).trimEnd()}`;
};

const copyNTimes = async (
  page: any,
  item: any,
  destinationPath: string,
  n: number
) => {
  for (let i = 0; i < n; i++) {
    await explorer.edit.copy(page, item, destinationPath);
  }
};

const expectIndexedFoldersVisible = async (
  page: any,
  base: string,
  indexes: number[]
) => {
  for (const i of indexes) {
    await explorer.expect.folderVisible(page, `(${i}) ${base}`);
  }
};

const expectIndexedFilesVisible = async (
  page: any,
  base: string,
  indexes: number[]
) => {
  for (const i of indexes) {
    await expect(
      explorer.locators.file(page, `(${i}) ${base}.txt`)
    ).toBeVisible();
  }
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
    await expect(explorer.locators.file(page, `(1) ${base}.txt`)).toBeVisible();

    await explorer.trash.move(
      page,
      explorer.locators.file(page, `${base}.txt`)
    );
    await explorer.search.set(page, base);
    await expect(explorer.locators.file(page, `${base}.txt`)).toHaveCount(0);
    await expect(explorer.locators.file(page, `(1) ${base}.txt`)).toBeVisible();

    await explorer.navigation.goToTrash(page);
    await expect(explorer.locators.file(page, `${base}.txt`)).toBeVisible();

    await restoreTrashedByName(page, `${base}.txt`, 'file');

    await explorer.navigation.openReadingRoot(page);
    await explorer.search.set(page, base);
    await expect(explorer.locators.file(page, `${base}.txt`)).toBeVisible();
    await expect(explorer.locators.file(page, `(1) ${base}.txt`)).toBeVisible();
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
    await explorer.expect.folderVisible(page, `(1) ${base}`);

    await explorer.trash.move(page, explorer.locators.folder(page, base));
    await explorer.search.set(page, base);
    await explorer.expect.folderNotVisible(page, base);
    await explorer.expect.folderVisible(page, `(1) ${base}`);

    await explorer.navigation.goToTrash(page);
    await explorer.expect.folderVisible(page, base);

    await restoreTrashedByName(page, base, 'folder');

    await explorer.navigation.openReadingRoot(page);
    await explorer.search.set(page, base);
    await explorer.expect.folderVisible(page, base);
    await explorer.expect.folderVisible(page, `(1) ${base}`);
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
      explorer.locators.file(page, `(1) ${base}.txt`)
    );
    await explorer.search.set(page, base);
    await expect(explorer.locators.file(page, `(1) ${base}.txt`)).toHaveCount(
      0
    );

    await explorer.navigation.goToTrash(page);
    await expect(explorer.locators.file(page, `(1) ${base}.txt`)).toBeVisible();

    await restoreTrashedByName(page, `(1) ${base}.txt`, 'file');

    await explorer.navigation.openReadingRoot(page);
    await explorer.search.set(page, base);
    await expect(explorer.locators.file(page, `(1) ${base}.txt`)).toBeVisible();
  });

  test('copy folder into same directory → auto-rename with (1) prefix → (2) prefix → (3) prefix', async ({
    page,
  }) => {
    const base = `folder-seq-${Date.now()}`;

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.folder(page, base);
    await explorer.search.set(page, base);

    await copyNTimes(page, explorer.locators.folder(page, base), 'my-files', 3);

    await expectIndexedFoldersVisible(page, base, [1, 2, 3]);
  });

  test('copy file into same directory → auto-rename with (1) prefix → (2) prefix → (3) prefix', async ({
    page,
  }) => {
    const base = `file-seq-${Date.now()}`;

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.file(page, base);
    await explorer.search.set(page, base);

    await copyNTimes(
      page,
      explorer.locators.file(page, `${base}.txt`),
      'my-files',
      3
    );

    await expectIndexedFilesVisible(page, base, [1, 2, 3]);
  });

  test('copy item at max length boundary → base truncated to fit (1) prefix', async ({
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

    await explorer.expect.folderVisible(page, withIndexPrefix(base, 1));
  });

  test('copy item when (1) exists → uses max + 1 strategy', async ({
    page,
  }) => {
    const base = `copy-max-${Date.now()}`;

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.folder(page, base);
    await explorer.search.set(page, base);

    await copyNTimes(page, explorer.locators.folder(page, base), 'my-files', 2);

    await expectIndexedFoldersVisible(page, base, [1, 2]);
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
    await explorer.expect.folderVisible(page, `(1) ${normalized}`);
  });

  test('copy item when truncated base conflicts → increments suffix deterministically', async ({
    page,
  }) => {
    const suffix = `${Date.now()}`.slice(-10);
    const base = `${'B'.repeat(90)}${suffix}`;

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.folder(page, base);
    await explorer.search.set(page, base);

    await copyNTimes(page, explorer.locators.folder(page, base), 'my-files', 3);

    await explorer.expect.folderVisible(page, withIndexPrefix(base, 1));
    await explorer.expect.folderVisible(page, withIndexPrefix(base, 2));
    await explorer.expect.folderVisible(page, withIndexPrefix(base, 3));
  });
});
