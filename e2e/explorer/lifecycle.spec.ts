import { test } from '@playwright/test';
import { explorer } from './actions/explorer-actions';

test.describe('Explorer Lifecycle', () => {
  test('Resource item -> create → trash → restore', async ({ page }) => {
    const folderName = `mb-folder-${Date.now()}`;
    const fileName = `mb-file-${Date.now()}`;

    // OPEN ROOT
    await explorer.navigation.openReadingRoot(page);

    // CREATE FOLDER
    await explorer.create.folder(page, folderName);
    await explorer.expect.folderVisible(page, folderName);

    // CREATE FILE
    await explorer.create.file(page, fileName);
    await explorer.expect.fileVisible(page, fileName);

    // MOVE TO TRASH
    await explorer.trash.move(page, explorer.locators.folder(page, folderName));
    await explorer.expect.folderNotVisible(page, folderName);

    await explorer.trash.move(page, explorer.locators.file(page, fileName));
    await explorer.expect.fileNotVisible(page, fileName);

    // GO TO TRASH
    await explorer.navigation.goToTrash(page);

    await explorer.expect.folderVisible(page, folderName);
    await explorer.expect.fileVisible(page, fileName);

    // RESTORE FOLDER
    await explorer.trash.restore(
      page,
      explorer.locators.folder(page, folderName)
    );

    // RESTORE FILE
    await explorer.trash.restore(page, explorer.locators.file(page, fileName));

    // VERIFY REMOVED FROM TRASH
    await explorer.expect.folderNotVisible(page, folderName);
    await explorer.expect.fileNotVisible(page, fileName);

    // VERIFY BACK IN MY FILES
    await explorer.navigation.openReadingRoot(page);

    await explorer.expect.folderVisible(page, folderName);
    await explorer.expect.fileVisible(page, fileName);
  });
});
