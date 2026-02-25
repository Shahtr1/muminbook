import { expect, test, type Page } from '@playwright/test';
import { explorer } from '../actions/explorer-actions';

test.describe('Hierarchy Restore Semantics', () => {
  test.describe.configure({ mode: 'serial' });
  test.setTimeout(120_000);

  const API_BASE = 'http://localhost:4005';

  const openFolder = async (page: Page, ...segments: string[]) => {
    const encoded = segments.map((s) => encodeURIComponent(s)).join('/');
    await page.goto(`/reading/my-files/${encoded}`);
  };

  const createResource = async (
    page: Page,
    type: 'file' | 'folder',
    name: string,
    path: string
  ) => {
    const res = await page.request.post(`${API_BASE}/resources`, {
      data: { type, name, path },
    });
    expect(res.ok()).toBeTruthy();
    return res.json();
  };

  const getChildren = async (page: Page, path: string) => {
    const res = await page.request.get(
      `${API_BASE}/resources?path=${encodeURIComponent(path)}`
    );
    expect(res.ok()).toBeTruthy();
    return res.json();
  };

  const getTrashItems = async (page: Page) => {
    const res = await page.request.get(`${API_BASE}/resources/trash`);
    expect(res.ok()).toBeTruthy();
    return res.json();
  };

  const moveToTrashById = async (page: Page, id: string) => {
    const res = await page.request.patch(`${API_BASE}/resources/${id}/trash`);
    expect(res.ok()).toBeTruthy();
  };

  const restoreById = async (page: Page, id: string) => {
    const res = await page.request.patch(`${API_BASE}/resources/${id}/restore`);
    expect(res.ok()).toBeTruthy();
  };

  const byName = (items: any[], name: string, type: 'file' | 'folder') =>
    items.find((r) => r.name === name && r.type === type);

  test('parent trash → entire subtree softDeleted', async ({ page }) => {
    const id = `${Date.now()}`;
    const parent = `restore-parent-${id}`;
    const childFolder = `restore-child-${id}`;
    const nestedFileBase = `restore-nested-${id}`;
    const nestedFile = `${nestedFileBase}.txt`;

    const parentRes = await createResource(page, 'folder', parent, 'my-files');
    await createResource(page, 'folder', childFolder, parentRes.path);
    await createResource(
      page,
      'file',
      nestedFileBase,
      `${parentRes.path}/${childFolder}`
    );

    await moveToTrashById(page, parentRes._id);

    const trashItems = await getTrashItems(page);
    expect(byName(trashItems, parent, 'folder')).toBeTruthy();
    expect(byName(trashItems, childFolder, 'folder')).toBeTruthy();
    expect(byName(trashItems, nestedFile, 'file')).toBeTruthy();
  });

  test('restore parent explicitly → entire subtree restored recursively', async ({
    page,
  }) => {
    const id = `${Date.now()}`;
    const parent = `restore-rec-parent-${id}`;
    const childFolder = `restore-rec-child-${id}`;
    const nestedFileBase = `restore-rec-file-${id}`;
    const nestedFile = `${nestedFileBase}.txt`;

    const parentRes = await createResource(page, 'folder', parent, 'my-files');
    await createResource(page, 'folder', childFolder, parentRes.path);
    await createResource(
      page,
      'file',
      nestedFileBase,
      `${parentRes.path}/${childFolder}`
    );

    await moveToTrashById(page, parentRes._id);
    await restoreById(page, parentRes._id);

    await explorer.navigation.openReadingRoot(page);
    await explorer.expect.folderVisible(page, parent);
    await openFolder(page, parent, childFolder);
    await explorer.expect.fileVisible(page, nestedFileBase);

    const children = await getChildren(
      page,
      `${parentRes.path}/${childFolder}`
    );
    expect(byName(children, nestedFile, 'file')).toBeTruthy();
  });

  test('restore child while parent softDeleted → ancestors restored, siblings remain softDeleted', async ({
    page,
  }) => {
    const id = `${Date.now()}`;
    const parent = `restore-chain-parent-${id}`;
    const fileABase = `restore-chain-a-${id}`;
    const fileBBase = `restore-chain-b-${id}`;
    const fileA = `${fileABase}.txt`;
    const fileB = `${fileBBase}.txt`;

    const parentRes = await createResource(page, 'folder', parent, 'my-files');
    const fileARes = await createResource(
      page,
      'file',
      fileABase,
      parentRes.path
    );
    await createResource(page, 'file', fileBBase, parentRes.path);

    await moveToTrashById(page, parentRes._id);
    await restoreById(page, fileARes._id);

    await explorer.navigation.openReadingRoot(page);
    await explorer.expect.folderVisible(page, parent);
    await openFolder(page, parent);
    await expect(explorer.locators.file(page, fileA)).toBeVisible();
    await expect(explorer.locators.file(page, fileB)).toHaveCount(0);

    const trashItems = await getTrashItems(page);
    expect(byName(trashItems, fileB, 'file')).toBeTruthy();
  });

  test('restore deeply nested child → full ancestor chain restored only', async ({
    page,
  }) => {
    const id = `${Date.now()}`;
    const parent = `restore-deep-parent-${id}`;
    const level1 = `restore-deep-l1-${id}`;
    const level2 = `restore-deep-l2-${id}`;
    const deepFileBase = `restore-deep-file-${id}`;
    const siblingFileBase = `restore-deep-sibling-${id}`;
    const deepFile = `${deepFileBase}.txt`;
    const siblingFile = `${siblingFileBase}.txt`;

    const parentRes = await createResource(page, 'folder', parent, 'my-files');
    const level1Res = await createResource(
      page,
      'folder',
      level1,
      parentRes.path
    );
    const level2Res = await createResource(
      page,
      'folder',
      level2,
      level1Res.path
    );
    const deepFileRes = await createResource(
      page,
      'file',
      deepFileBase,
      level2Res.path
    );
    await createResource(page, 'file', siblingFileBase, level1Res.path);

    await moveToTrashById(page, parentRes._id);
    await restoreById(page, deepFileRes._id);

    await explorer.navigation.openReadingRoot(page);
    await explorer.expect.folderVisible(page, parent);
    await openFolder(page, parent, level1, level2);
    await expect(explorer.locators.file(page, deepFile)).toBeVisible();

    await openFolder(page, parent, level1);
    await expect(explorer.locators.file(page, siblingFile)).toHaveCount(0);

    const trashItems = await getTrashItems(page);
    expect(byName(trashItems, siblingFile, 'file')).toBeTruthy();
  });

  test('restore child after parent restored → only child restored', async ({
    page,
  }) => {
    const id = `${Date.now()}`;
    const parent = `restore-post-parent-${id}`;
    const childFileBase = `restore-post-file-${id}`;
    const childFile = `${childFileBase}.txt`;

    const parentRes = await createResource(page, 'folder', parent, 'my-files');
    const childRes = await createResource(
      page,
      'file',
      childFileBase,
      parentRes.path
    );

    await moveToTrashById(page, parentRes._id);
    await restoreById(page, parentRes._id);

    await moveToTrashById(page, childRes._id);
    await restoreById(page, childRes._id);

    await explorer.navigation.openReadingRoot(page);
    await explorer.expect.folderVisible(page, parent);
    await openFolder(page, parent);
    await expect(explorer.locators.file(page, childFile)).toBeVisible();
  });
});
