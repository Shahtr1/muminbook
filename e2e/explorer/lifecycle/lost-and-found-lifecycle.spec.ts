import { expect, test, type Page } from '@playwright/test';
import { explorer } from '../actions/explorer-actions';

test.describe('Lost+Found Semantics', () => {
  test.describe.configure({ mode: 'serial' });
  test.setTimeout(120_000);

  const API_BASE = 'http://localhost:4005';

  const byName = (items: any[], name: string, type: 'file' | 'folder') =>
    items.find((r) => r.name === name && r.type === type);

  const rootPath = `${API_BASE}/resources?path=my-files`;
  const lostPath = `${API_BASE}/resources?path=my-files/lost%2Bfound`;

  async function getResources(page: Page, path: string) {
    const res = await page.request.get(path);
    expect(res.ok()).toBeTruthy();
    return res.json();
  }

  async function moveToTrashById(page: Page, id: string) {
    const res = await page.request.patch(`${API_BASE}/resources/${id}/trash`);
    expect(res.ok()).toBeTruthy();
  }

  async function deleteById(page: Page, id: string) {
    const res = await page.request.delete(`${API_BASE}/resources/${id}`);
    expect(res.ok()).toBeTruthy();
  }

  async function removeLostAndFoundIfExists(page: Page) {
    const root = await getResources(page, rootPath);
    const lost = byName(root, 'lost+found', 'folder');

    if (!lost) return;

    await moveToTrashById(page, lost._id);
    await deleteById(page, lost._id);
  }

  async function createOrphanedFileByParentRename(
    page: Page,
    base: string,
    childName?: string
  ) {
    const parent = `lf-parent-${base}`;
    const parentRenamed = `lf-parent-renamed-${base}`;
    const child = childName ?? `lf-child-${base}`;

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.folder(page, parent);

    await page.goto(`/reading/my-files/${encodeURIComponent(parent)}`);
    await explorer.create.file(page, child);
    await explorer.trash.move(
      page,
      explorer.locators.file(page, `${child}.txt`)
    );

    await explorer.navigation.openReadingRoot(page);
    await explorer.edit.rename(
      page,
      explorer.locators.folder(page, parent),
      parentRenamed
    );

    await explorer.navigation.goToTrash(page);
    await explorer.trash.restore(
      page,
      explorer.locators.file(page, `${child}.txt`)
    );

    return { child };
  }

  test('restore orphan preserves subtree structure', async ({ page }) => {
    const base = `${Date.now()}`;
    const parent = `lf-tree-parent-${base}`;
    const parentRenamed = `lf-tree-parent-renamed-${base}`;
    const orphanFolder = `lf-orphan-folder-${base}`;
    const nestedFile = `lf-nested-file-${base}`;

    await removeLostAndFoundIfExists(page);
    await explorer.navigation.openReadingRoot(page);

    await explorer.create.folder(page, parent);
    await page.goto(`/reading/my-files/${encodeURIComponent(parent)}`);

    await explorer.create.folder(page, orphanFolder);
    await explorer.expect.folderVisible(page, orphanFolder);
    await page.goto(
      `/reading/my-files/${encodeURIComponent(parent)}/${encodeURIComponent(orphanFolder)}`
    );
    await explorer.create.file(page, nestedFile);
    await explorer.expect.fileVisible(page, nestedFile);

    await page.goto(`/reading/my-files/${encodeURIComponent(parent)}`);
    await explorer.expect.folderVisible(page, orphanFolder);
    await explorer.trash.move(
      page,
      explorer.locators.folder(page, orphanFolder)
    );

    await explorer.navigation.openReadingRoot(page);
    await explorer.edit.rename(
      page,
      explorer.locators.folder(page, parent),
      parentRenamed
    );

    await explorer.navigation.goToTrash(page);
    await explorer.trash.restore(
      page,
      explorer.locators.folder(page, orphanFolder)
    );

    await explorer.navigation.openReadingRoot(page);
    await explorer.expect.folderVisible(page, 'lost+found');

    await page.goto('/reading/my-files/lost%2Bfound');
    const lostItems = await getResources(page, lostPath);
    const restoredFolder = lostItems.find(
      (r: any) =>
        r.type === 'folder' &&
        (r.name === orphanFolder || r.name.startsWith(`${orphanFolder} (`))
    );
    expect(restoredFolder).toBeTruthy();
    await explorer.expect.folderVisible(page, restoredFolder.name);

    await page.goto(
      `/reading/my-files/lost%2Bfound/${encodeURIComponent(restoredFolder.name)}`
    );
    await explorer.expect.fileVisible(page, nestedFile);
  });

  test('restore orphan when conflict exists in lost+found → auto-rename applied', async ({
    page,
  }) => {
    const base = `${Date.now()}`;
    const fixedName = `lf-same-${base}`;

    await removeLostAndFoundIfExists(page);

    await createOrphanedFileByParentRename(page, `${base}-1`, fixedName);
    await explorer.navigation.openReadingRoot(page);
    await page.goto('/reading/my-files/lost%2Bfound');
    await explorer.expect.fileVisible(page, fixedName);

    // second orphan with the same child name to force rename in lost+found
    const parent = `lf-parent-${base}-2`;
    const parentRenamed = `lf-parent-renamed-${base}-2`;

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.folder(page, parent);
    await page.goto(`/reading/my-files/${encodeURIComponent(parent)}`);
    await explorer.create.file(page, fixedName);
    await explorer.trash.move(
      page,
      explorer.locators.file(page, `${fixedName}.txt`)
    );

    await explorer.navigation.openReadingRoot(page);
    await explorer.edit.rename(
      page,
      explorer.locators.folder(page, parent),
      parentRenamed
    );

    await explorer.navigation.goToTrash(page);
    await explorer.trash.restore(
      page,
      explorer.locators.file(page, `${fixedName}.txt`)
    );

    await page.goto('/reading/my-files/lost%2Bfound');
    await explorer.expect.fileVisible(page, fixedName);
    await expect(
      explorer.locators.file(page, `${fixedName}.txt (1)`)
    ).toBeVisible();
  });

  test('lost+found renders only when orphan exists', async ({ page }) => {
    const base = `${Date.now()}`;

    await removeLostAndFoundIfExists(page);
    await explorer.navigation.openReadingRoot(page);
    await explorer.expect.folderNotVisible(page, 'lost+found');

    await createOrphanedFileByParentRename(page, base);

    await explorer.navigation.openReadingRoot(page);
    await explorer.expect.folderVisible(page, 'lost+found');
  });

  test('lost+found empty should not render', async ({ page }) => {
    const base = `${Date.now()}`;

    await removeLostAndFoundIfExists(page);
    const { child } = await createOrphanedFileByParentRename(page, base);

    const lostItems = await getResources(page, lostPath);
    const orphan = byName(lostItems, `${child}.txt`, 'file');
    expect(orphan).toBeTruthy();

    await moveToTrashById(page, orphan._id);
    await deleteById(page, orphan._id);

    await explorer.navigation.openReadingRoot(page);
    await explorer.expect.folderNotVisible(page, 'lost+found');
  });

  test('system recreates lost+found automatically when needed', async ({
    page,
  }) => {
    const base = `${Date.now()}`;

    await removeLostAndFoundIfExists(page);
    await explorer.navigation.openReadingRoot(page);
    await explorer.expect.folderNotVisible(page, 'lost+found');

    await createOrphanedFileByParentRename(page, base);

    await explorer.navigation.openReadingRoot(page);
    await explorer.expect.folderVisible(page, 'lost+found');
  });

  test('parent renamed without cascading path update → restore child → child moves to lost+found', async ({
    page,
  }) => {
    const base = `${Date.now()}`;
    const { child } = await createOrphanedFileByParentRename(page, base);

    await explorer.navigation.openReadingRoot(page);
    await explorer.expect.folderVisible(page, 'lost+found');

    await page.goto('/reading/my-files/lost%2Bfound');
    await explorer.expect.fileVisible(page, child);
  });

  test('move parent after child trashed without cascading path update → restore child → moves to lost+found', async ({
    page,
  }) => {
    const base = `${Date.now()}`;
    const parent = `lf-move-parent-${base}`;
    const destination = `lf-move-dst-${base}`;
    const child = `lf-move-child-${base}`;

    await removeLostAndFoundIfExists(page);
    await explorer.navigation.openReadingRoot(page);

    await explorer.create.folder(page, parent);
    await explorer.create.folder(page, destination);

    await page.goto(`/reading/my-files/${encodeURIComponent(parent)}`);
    await explorer.create.file(page, child);
    await explorer.trash.move(
      page,
      explorer.locators.file(page, `${child}.txt`)
    );

    await explorer.navigation.openReadingRoot(page);
    await explorer.edit.move(
      page,
      explorer.locators.folder(page, parent),
      `my-files/${destination}`
    );

    await explorer.navigation.goToTrash(page);
    await explorer.trash.restore(
      page,
      explorer.locators.file(page, `${child}.txt`)
    );

    await explorer.navigation.openReadingRoot(page);
    await explorer.expect.folderVisible(page, 'lost+found');

    await page.goto('/reading/my-files/lost%2Bfound');
    await explorer.expect.fileVisible(page, child);
  });
});
