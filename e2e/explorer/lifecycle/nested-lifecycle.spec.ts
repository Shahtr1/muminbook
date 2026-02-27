import { test } from '@playwright/test';
import { explorer } from '../actions/explorer-actions';

test.describe('Nested Explorer Lifecycle', () => {
  const openFolder = async (page: any, ...segments: string[]) => {
    const encoded = segments.map((s) => encodeURIComponent(s)).join('/');
    await page.goto(`/reading/my-files/${encoded}`);
  };

  test('trash parent folder → delete', async ({ page }) => {
    const id = `${Date.now()}`;
    const parent = `nested-parent-${id}`;
    const childFolder = `nested-child-${id}`;
    const fileBase = `nested-file-${id}`;

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.folder(page, parent);

    await openFolder(page, parent);
    await explorer.create.folder(page, childFolder);
    await openFolder(page, parent, childFolder);
    await explorer.create.file(page, fileBase);
    await explorer.expect.fileVisible(page, fileBase);

    await explorer.navigation.openReadingRoot(page);
    await explorer.trash.move(page, explorer.locators.folder(page, parent));
    await explorer.expect.folderNotVisible(page, parent);

    await explorer.navigation.goToTrash(page);
    await explorer.expect.folderVisible(page, parent);

    await explorer.trash.delete(page, explorer.locators.folder(page, parent));
    await explorer.expect.folderNotVisible(page, parent);

    await explorer.navigation.openReadingRoot(page);
    await explorer.expect.folderNotVisible(page, parent);
  });

  test('file inside folder lifecycle → trash individually → restore', async ({
    page,
  }) => {
    const id = `${Date.now()}`;
    const parent = `nested-file-parent-${id}`;
    const fileBase = `nested-file-child-${id}`;

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.folder(page, parent);

    await openFolder(page, parent);
    await explorer.create.file(page, fileBase);
    await explorer.expect.fileVisible(page, fileBase);

    await explorer.trash.move(
      page,
      explorer.locators.file(page, `${fileBase}.txt`)
    );
    await explorer.expect.fileNotVisible(page, fileBase);

    await explorer.navigation.openReadingRoot(page);
    await explorer.expect.folderVisible(page, parent);

    await explorer.navigation.goToTrash(page);
    await explorer.expect.fileVisible(page, fileBase);

    await explorer.trash.restore(
      page,
      explorer.locators.file(page, `${fileBase}.txt`)
    );

    await openFolder(page, parent);
    await explorer.expect.fileVisible(page, fileBase);
  });
});
