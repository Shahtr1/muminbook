import { test } from '@playwright/test';
import { explorer } from '../actions/explorer-actions';

test.describe('Move Explorer Lifecycle', () => {
  const openFolder = async (page: any, ...segments: string[]) => {
    const encoded = segments.map((s) => encodeURIComponent(s)).join('/');
    await page.goto(`/reading/my-files/${encoded}`);
  };

  test('file lifecycle → create → move to another folder → trash → restore', async ({
    page,
  }) => {
    const id = `${Date.now()}`;
    const source = `mv-file-src-${id}`;
    const target = `mv-file-dst-${id}`;
    const fileBase = `mv-file-${id}`;

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.folder(page, source);
    await explorer.create.folder(page, target);

    await openFolder(page, source);
    await explorer.create.file(page, fileBase);
    await explorer.expect.fileVisible(page, fileBase);

    await explorer.edit.move(
      page,
      explorer.locators.file(page, `${fileBase}.txt`),
      `my-files/${target}`
    );
    await explorer.expect.fileNotVisible(page, fileBase);

    await openFolder(page, target);
    await explorer.expect.fileVisible(page, fileBase);

    await explorer.trash.move(page, explorer.locators.file(page, `${fileBase}.txt`));
    await explorer.expect.fileNotVisible(page, fileBase);

    await explorer.navigation.goToTrash(page);
    await explorer.trash.restore(
      page,
      explorer.locators.file(page, `${fileBase}.txt`)
    );

    await openFolder(page, target);
    await explorer.expect.fileVisible(page, fileBase);
  });

  test('folder lifecycle → create → move → trash → restore', async ({
    page,
  }) => {
    const id = `${Date.now()}`;
    const source = `mv-folder-src-${id}`;
    const target = `mv-folder-dst-${id}`;
    const movedFolder = `mv-folder-${id}`;

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.folder(page, source);
    await explorer.create.folder(page, target);

    await openFolder(page, source);
    await explorer.create.folder(page, movedFolder);
    await explorer.expect.folderVisible(page, movedFolder);

    await explorer.edit.move(
      page,
      explorer.locators.folder(page, movedFolder),
      `my-files/${target}`
    );
    await explorer.expect.folderNotVisible(page, movedFolder);

    await openFolder(page, target);
    await explorer.expect.folderVisible(page, movedFolder);

    await explorer.trash.move(page, explorer.locators.folder(page, movedFolder));
    await explorer.expect.folderNotVisible(page, movedFolder);

    await explorer.navigation.goToTrash(page);
    await explorer.trash.restore(
      page,
      explorer.locators.folder(page, movedFolder)
    );

    await openFolder(page, target);
    await explorer.expect.folderVisible(page, movedFolder);
  });

  test('file lifecycle → create → move → trash → delete', async ({ page }) => {
    const id = `${Date.now()}`;
    const source = `mv-file-del-src-${id}`;
    const target = `mv-file-del-dst-${id}`;
    const fileBase = `mv-file-del-${id}`;

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.folder(page, source);
    await explorer.create.folder(page, target);

    await openFolder(page, source);
    await explorer.create.file(page, fileBase);

    await explorer.edit.move(
      page,
      explorer.locators.file(page, `${fileBase}.txt`),
      `my-files/${target}`
    );

    await openFolder(page, target);
    await explorer.expect.fileVisible(page, fileBase);

    await explorer.trash.move(page, explorer.locators.file(page, `${fileBase}.txt`));

    await explorer.navigation.goToTrash(page);
    await explorer.trash.delete(
      page,
      explorer.locators.file(page, `${fileBase}.txt`)
    );
    await explorer.expect.fileNotVisible(page, fileBase);

    await openFolder(page, target);
    await explorer.expect.fileNotVisible(page, fileBase);
  });

  test('folder lifecycle → create → move → trash → delete', async ({
    page,
  }) => {
    const id = `${Date.now()}`;
    const source = `mv-folder-del-src-${id}`;
    const target = `mv-folder-del-dst-${id}`;
    const movedFolder = `mv-folder-del-${id}`;

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.folder(page, source);
    await explorer.create.folder(page, target);

    await openFolder(page, source);
    await explorer.create.folder(page, movedFolder);

    await explorer.edit.move(
      page,
      explorer.locators.folder(page, movedFolder),
      `my-files/${target}`
    );

    await openFolder(page, target);
    await explorer.expect.folderVisible(page, movedFolder);

    await explorer.trash.move(page, explorer.locators.folder(page, movedFolder));

    await explorer.navigation.goToTrash(page);
    await explorer.trash.delete(
      page,
      explorer.locators.folder(page, movedFolder)
    );
    await explorer.expect.folderNotVisible(page, movedFolder);

    await openFolder(page, target);
    await explorer.expect.folderNotVisible(page, movedFolder);
  });

  test('move folder to directory containing same name → conflict', async ({
    page,
  }) => {
    const id = `${Date.now()}`;
    const source = `mv-conf-folder-src-${id}`;
    const target = `mv-conf-folder-dst-${id}`;
    const same = `mv-same-folder-${id}`;

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.folder(page, source);
    await explorer.create.folder(page, target);

    await openFolder(page, source);
    await explorer.create.folder(page, same);

    await openFolder(page, target);
    await explorer.create.folder(page, same);

    await openFolder(page, source);
    await explorer.edit.move(
      page,
      explorer.locators.folder(page, same),
      `my-files/${target}`
    );

    await explorer.expect.toastVisible(
      page,
      'A resource with the same name already exists in target folder'
    );
    await explorer.expect.folderVisible(page, same);
  });

  test('move file to directory containing same name → conflict', async ({
    page,
  }) => {
    const id = `${Date.now()}`;
    const source = `mv-conf-file-src-${id}`;
    const target = `mv-conf-file-dst-${id}`;
    const sameBase = `mv-same-file-${id}`;

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.folder(page, source);
    await explorer.create.folder(page, target);

    await openFolder(page, source);
    await explorer.create.file(page, sameBase);

    await openFolder(page, target);
    await explorer.create.file(page, sameBase);

    await openFolder(page, source);
    await explorer.edit.move(
      page,
      explorer.locators.file(page, `${sameBase}.txt`),
      `my-files/${target}`
    );

    await explorer.expect.toastVisible(
      page,
      'A resource with the same name already exists in target folder'
    );
    await explorer.expect.fileVisible(page, sameBase);
  });

  test('move folder into same parent → no-op or conflict', async ({ page }) => {
    const id = `${Date.now()}`;
    const source = `mv-same-parent-src-${id}`;
    const folder = `mv-same-parent-folder-${id}`;

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.folder(page, source);

    await openFolder(page, source);
    await explorer.create.folder(page, folder);

    await explorer.edit.move(
      page,
      explorer.locators.folder(page, folder),
      `my-files/${source}`
    );

    await explorer.expect.toastVisible(
      page,
      'A resource with the same name already exists in target folder'
    );
    await explorer.expect.folderVisible(page, folder);
  });

  test('move item → trash → restore without parent rename/move → restores to original parent', async ({
    page,
  }) => {
    const id = `${Date.now()}`;
    const source = `mv-restore-src-${id}`;
    const target = `mv-restore-dst-${id}`;
    const fileBase = `mv-restore-file-${id}`;

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.folder(page, source);
    await explorer.create.folder(page, target);

    await openFolder(page, source);
    await explorer.create.file(page, fileBase);

    await explorer.edit.move(
      page,
      explorer.locators.file(page, `${fileBase}.txt`),
      `my-files/${target}`
    );

    await openFolder(page, target);
    await explorer.expect.fileVisible(page, fileBase);

    await explorer.trash.move(page, explorer.locators.file(page, `${fileBase}.txt`));

    await explorer.navigation.goToTrash(page);
    await explorer.trash.restore(
      page,
      explorer.locators.file(page, `${fileBase}.txt`)
    );

    await openFolder(page, target);
    await explorer.expect.fileVisible(page, fileBase);

    await openFolder(page, source);
    await explorer.expect.fileNotVisible(page, fileBase);
  });
});
