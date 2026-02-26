import { expect, test, type Page } from '@playwright/test';
import { explorer } from '../actions/explorer-actions';

test.describe('Parent-Child Trash Semantics', () => {
  const API_BASE = 'http://localhost:4005';

  const openFolder = async (page: Page, ...segments: string[]) => {
    const encoded = segments.map((s) => encodeURIComponent(s)).join('/');
    await page.goto(`/reading/my-files/${encoded}`);
  };
  const openTrashFolder = async (page: Page, ...segments: string[]) => {
    const encoded = segments.map((s) => encodeURIComponent(s)).join('/');
    await page.goto(`/reading/trash/${encoded}`);
  };

  const getTrashItems = async (page: Page) => {
    const res = await page.request.get(`${API_BASE}/resources/trash`);
    expect(res.ok()).toBeTruthy();
    return res.json();
  };

  const deleteById = async (page: Page, id: string) => {
    const res = await page.request.delete(`${API_BASE}/resources/${id}`);
    expect(res.ok()).toBeTruthy();
  };

  const restoreById = async (page: Page, id: string) => {
    const res = await page.request.patch(`${API_BASE}/resources/${id}/restore`);
    expect(res.ok()).toBeTruthy();
  };

  test('child trash only → parent remains visible', async ({ page }) => {
    const id = `${Date.now()}`;
    const parent = `pct-parent-${id}`;
    const childFile = `pct-child-file-${id}`;

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.folder(page, parent);

    await openFolder(page, parent);
    await explorer.create.file(page, childFile);
    await explorer.expect.fileVisible(page, childFile);

    await explorer.trash.move(
      page,
      explorer.locators.file(page, `${childFile}.txt`)
    );
    await explorer.expect.fileNotVisible(page, childFile);

    await explorer.navigation.openReadingRoot(page);
    await explorer.expect.folderVisible(page, parent);
  });

  test('child trashed first then parent trashed → child consolidates under trashed parent', async ({
    page,
  }) => {
    const id = `${Date.now()}`;
    const parent = `pct-chain-parent-${id}`;
    const childFile = `pct-chain-child-${id}`;
    const childFileWithExt = `${childFile}.txt`;

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.folder(page, parent);

    await openFolder(page, parent);
    await explorer.create.file(page, childFile);
    await explorer.expect.fileVisible(page, childFile);

    await explorer.trash.move(
      page,
      explorer.locators.file(page, childFileWithExt)
    );
    await explorer.expect.fileNotVisible(page, childFile);

    await explorer.navigation.openReadingRoot(page);
    await explorer.expect.folderVisible(page, parent);
    await explorer.trash.move(page, explorer.locators.folder(page, parent));
    await explorer.expect.folderNotVisible(page, parent);

    const trashItems = await getTrashItems(page);
    const trashedParents = trashItems.filter(
      (r: any) => r.name === parent && r.type === 'folder'
    );
    const trashedChildren = trashItems.filter(
      (r: any) => r.name === childFileWithExt && r.type === 'file'
    );

    expect(trashedParents).toHaveLength(1);
    expect(trashedChildren).toHaveLength(1);

    await explorer.navigation.goToTrash(page);
    await explorer.expect.folderVisible(page, parent);
    await explorer.expect.fileNotVisible(page, childFile);

    await openTrashFolder(page, parent);
    await explorer.expect.fileVisible(page, childFile);
  });

  test('parent trash → children implicitly softDeleted', async ({ page }) => {
    const id = `${Date.now()}`;
    const parent = `pct-soft-parent-${id}`;
    const childFolder = `pct-soft-child-${id}`;
    const nestedFile = `pct-soft-file-${id}`;

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.folder(page, parent);

    await openFolder(page, parent);
    await explorer.create.folder(page, childFolder);
    await openFolder(page, parent, childFolder);
    await explorer.create.file(page, nestedFile);

    await explorer.navigation.openReadingRoot(page);
    await explorer.trash.move(page, explorer.locators.folder(page, parent));
    await explorer.expect.folderNotVisible(page, parent);

    const trashItems = await getTrashItems(page);
    const trashedParent = trashItems.find(
      (r: any) => r.name === parent && r.type === 'folder'
    );
    const trashedChildFolder = trashItems.find(
      (r: any) => r.name === childFolder && r.type === 'folder'
    );
    const trashedNestedFile = trashItems.find(
      (r: any) => r.name === `${nestedFile}.txt` && r.type === 'file'
    );

    expect(trashedParent).toBeTruthy();
    expect(trashedChildFolder).toBeTruthy();
    expect(trashedNestedFile).toBeTruthy();

    await explorer.navigation.goToTrash(page);
    await explorer.expect.folderVisible(page, parent);
  });

  test('restore child while parent softDeleted → parent restored automatically', async ({
    page,
  }) => {
    const id = `${Date.now()}`;
    const parent = `pct-restore-parent-${id}`;
    const childFile = `pct-restore-child-${id}`;

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.folder(page, parent);
    await openFolder(page, parent);
    await explorer.create.file(page, childFile);

    await explorer.navigation.openReadingRoot(page);
    await explorer.trash.move(page, explorer.locators.folder(page, parent));

    const trashItems = await getTrashItems(page);
    const trashedChild = trashItems.find(
      (r: any) => r.name === `${childFile}.txt` && r.type === 'file'
    );
    expect(trashedChild).toBeTruthy();

    await restoreById(page, trashedChild._id);

    await explorer.navigation.openReadingRoot(page);
    await explorer.expect.folderVisible(page, parent);
    await openFolder(page, parent);
    await explorer.expect.fileVisible(page, childFile);
  });

  test('parent permanent delete → children permanently deleted', async ({
    page,
  }) => {
    const id = `${Date.now()}`;
    const parent = `pct-del-parent-${id}`;
    const childFolder = `pct-del-child-${id}`;
    const nestedFile = `pct-del-file-${id}`;

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.folder(page, parent);

    await openFolder(page, parent);
    await explorer.create.folder(page, childFolder);
    await openFolder(page, parent, childFolder);
    await explorer.create.file(page, nestedFile);

    await explorer.navigation.openReadingRoot(page);
    await explorer.trash.move(page, explorer.locators.folder(page, parent));

    const trashItems = await getTrashItems(page);
    const parentItem = trashItems.find(
      (r: any) => r.name === parent && r.type === 'folder'
    );
    expect(parentItem).toBeTruthy();

    await deleteById(page, parentItem._id);

    await explorer.navigation.goToTrash(page);
    await explorer.expect.folderNotVisible(page, parent);
    await explorer.expect.folderNotVisible(page, childFolder);
    await explorer.expect.fileNotVisible(page, nestedFile);
  });
});
