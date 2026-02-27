import { expect, test } from '@playwright/test';
import { explorer } from '../actions/explorer-actions';

test.describe('Rename Explorer Lifecycle', () => {
  test('rename folder with valid name', async ({ page }) => {
    const id = `${Date.now()}`;
    const oldName = `rn-folder-old-${id}`;
    const newName = `rn-folder-new-${id}`;

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.folder(page, oldName);

    await explorer.edit.rename(
      page,
      explorer.locators.folder(page, oldName),
      newName
    );

    await explorer.expect.folderNotVisible(page, oldName);
    await explorer.expect.folderVisible(page, newName);
  });

  test('rename folder trims and normalizes spaces', async ({ page }) => {
    const id = `${Date.now()}`;
    const oldName = `rn-folder-trim-${id}`;
    const rawName = '   Renamed    Folder   Name   ';
    const normalized = 'Renamed Folder Name';

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.folder(page, oldName);

    await explorer.edit.rename(
      page,
      explorer.locators.folder(page, oldName),
      rawName
    );

    await explorer.expect.folderVisible(page, normalized);
  });

  test('rename folder rejects invalid characters', async ({ page }) => {
    const id = `${Date.now()}`;
    const oldName = `rn-folder-invalid-${id}`;

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.folder(page, oldName);

    await explorer.edit.rename(
      page,
      explorer.locators.folder(page, oldName),
      'invalid@name'
    );

    await explorer.expect.toastVisible(
      page,
      'Only letters, numbers, spaces, hyphen (-), and underscore (_) are allowed'
    );
    await explorer.expect.folderVisible(page, oldName);
  });

  test('rename folder rejects name with no alphanumeric characters', async ({
    page,
  }) => {
    const id = `${Date.now()}`;
    const oldName = `rn-folder-symbol-${id}`;

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.folder(page, oldName);

    await explorer.edit.rename(
      page,
      explorer.locators.folder(page, oldName),
      '---___'
    );

    await explorer.expect.toastVisible(
      page,
      'Name must contain at least one letter or number'
    );
    await explorer.expect.folderVisible(page, oldName);
  });

  test('rename folder rejects name exceeding max length', async ({ page }) => {
    const id = `${Date.now()}`;
    const oldName = `rn-folder-len-${id}`;

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.folder(page, oldName);

    await explorer.edit.rename(
      page,
      explorer.locators.folder(page, oldName),
      'A'.repeat(101)
    );

    await explorer.expect.toastVisible(page, 'Name exceeds maximum length');
    await explorer.expect.folderVisible(page, oldName);
  });

  test('rename folder rejects empty after normalization', async ({ page }) => {
    const id = `${Date.now()}`;
    const oldName = `rn-folder-empty-${id}`;

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.folder(page, oldName);

    await explorer.edit.rename(
      page,
      explorer.locators.folder(page, oldName),
      '     '
    );

    await expect(page.getByText('Name is required.')).toBeVisible();
    await explorer.expect.folderVisible(page, oldName);
  });

  test('rename folder to existing sibling name → conflict error', async ({
    page,
  }) => {
    const id = `${Date.now()}`;
    const source = `rn-folder-source-${id}`;
    const sibling = `rn-folder-sibling-${id}`;

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.folder(page, source);
    await explorer.create.folder(page, sibling);

    await explorer.edit.rename(
      page,
      explorer.locators.folder(page, source),
      sibling
    );

    await explorer.expect.toastVisible(
      page,
      'A folder with this name already exists in the destination path'
    );
    await explorer.expect.folderVisible(page, source);
    await explorer.expect.folderVisible(page, sibling);
  });

  test('rename file with valid name', async ({ page }) => {
    const id = `${Date.now()}`;
    const oldBase = `rn-file-old-${id}`;
    const newBase = `rn-file-new-${id}`;

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.file(page, oldBase);

    await explorer.edit.rename(
      page,
      explorer.locators.file(page, `${oldBase}.txt`),
      newBase
    );

    await explorer.expect.fileNotVisible(page, oldBase);
    await explorer.expect.fileVisible(page, newBase);
  });

  test('rename file trims and normalizes spaces', async ({ page }) => {
    const id = `${Date.now()}`;
    const oldBase = `rn-file-trim-${id}`;
    const rawName = '   Renamed    File   Name   ';
    const normalized = 'Renamed File Name';

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.file(page, oldBase);

    await explorer.edit.rename(
      page,
      explorer.locators.file(page, `${oldBase}.txt`),
      rawName
    );

    await explorer.expect.fileVisible(page, normalized);
  });

  test('rename file rejects invalid characters', async ({ page }) => {
    const id = `${Date.now()}`;
    const oldBase = `rn-file-invalid-${id}`;

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.file(page, oldBase);

    await explorer.edit.rename(
      page,
      explorer.locators.file(page, `${oldBase}.txt`),
      'invalid@name'
    );

    await explorer.expect.toastVisible(
      page,
      'Only letters, numbers, spaces, hyphen (-), and underscore (_) are allowed'
    );
    await explorer.expect.fileVisible(page, oldBase);
  });

  test('rename file rejects name with no alphanumeric characters', async ({
    page,
  }) => {
    const id = `${Date.now()}`;
    const oldBase = `rn-file-symbol-${id}`;

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.file(page, oldBase);

    await explorer.edit.rename(
      page,
      explorer.locators.file(page, `${oldBase}.txt`),
      '---___'
    );

    await explorer.expect.toastVisible(
      page,
      'Name must contain at least one letter or number'
    );
    await explorer.expect.fileVisible(page, oldBase);
  });

  test('rename file rejects name exceeding max length', async ({ page }) => {
    const id = `${Date.now()}`;
    const oldBase = `rn-file-len-${id}`;

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.file(page, oldBase);

    await explorer.edit.rename(
      page,
      explorer.locators.file(page, `${oldBase}.txt`),
      'A'.repeat(101)
    );

    await explorer.expect.toastVisible(page, 'Name exceeds maximum length');
    await explorer.expect.fileVisible(page, oldBase);
  });

  test('rename file rejects empty after normalization', async ({ page }) => {
    const id = `${Date.now()}`;
    const oldBase = `rn-file-empty-${id}`;

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.file(page, oldBase);

    await explorer.edit.rename(
      page,
      explorer.locators.file(page, `${oldBase}.txt`),
      '     '
    );

    await expect(page.getByText('Name is required.')).toBeVisible();
    await explorer.expect.fileVisible(page, oldBase);
  });

  test('rename file to existing sibling name → conflict error', async ({
    page,
  }) => {
    const id = `${Date.now()}`;
    const sourceBase = `rn-file-source-${id}`;
    const siblingBase = `rn-file-sibling-${id}`;

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.file(page, sourceBase);
    await explorer.create.file(page, siblingBase);

    await explorer.edit.rename(
      page,
      explorer.locators.file(page, `${sourceBase}.txt`),
      siblingBase
    );

    await explorer.expect.toastVisible(
      page,
      'A file with this name already exists in the destination path'
    );
    await explorer.expect.fileVisible(page, sourceBase);
    await explorer.expect.fileVisible(page, siblingBase);
  });

  test('folder lifecycle → create → rename → trash → restore', async ({
    page,
  }) => {
    const id = `${Date.now()}`;
    const oldName = `rn-life-folder-old-${id}`;
    const renamed = `rn-life-folder-new-${id}`;

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.folder(page, oldName);

    await explorer.edit.rename(
      page,
      explorer.locators.folder(page, oldName),
      renamed
    );
    await explorer.expect.folderVisible(page, renamed);

    await explorer.trash.move(page, explorer.locators.folder(page, renamed));
    await explorer.expect.folderNotVisible(page, renamed);

    await explorer.navigation.goToTrash(page);
    await explorer.trash.restore(page, explorer.locators.folder(page, renamed));

    await explorer.navigation.openReadingRoot(page);
    await explorer.expect.folderVisible(page, renamed);
  });

  test('file lifecycle → create → rename → trash → restore', async ({
    page,
  }) => {
    const id = `${Date.now()}`;
    const oldBase = `rn-life-file-old-${id}`;
    const renamedBase = `rn-life-file-new-${id}`;

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.file(page, oldBase);

    await explorer.edit.rename(
      page,
      explorer.locators.file(page, `${oldBase}.txt`),
      renamedBase
    );
    await explorer.expect.fileVisible(page, renamedBase);

    await explorer.trash.move(
      page,
      explorer.locators.file(page, `${renamedBase}.txt`)
    );
    await explorer.expect.fileNotVisible(page, renamedBase);

    await explorer.navigation.goToTrash(page);
    await explorer.trash.restore(
      page,
      explorer.locators.file(page, `${renamedBase}.txt`)
    );

    await explorer.navigation.openReadingRoot(page);
    await explorer.expect.fileVisible(page, renamedBase);
  });

  test('folder lifecycle → create → rename → trash → delete', async ({
    page,
  }) => {
    const id = `${Date.now()}`;
    const oldName = `rn-del-folder-old-${id}`;
    const renamed = `rn-del-folder-new-${id}`;

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.folder(page, oldName);

    await explorer.edit.rename(
      page,
      explorer.locators.folder(page, oldName),
      renamed
    );
    await explorer.trash.move(page, explorer.locators.folder(page, renamed));

    await explorer.navigation.goToTrash(page);
    await explorer.trash.delete(page, explorer.locators.folder(page, renamed));

    await explorer.navigation.openReadingRoot(page);
    await explorer.expect.folderNotVisible(page, renamed);
  });

  test('file lifecycle → create → rename → trash → delete', async ({
    page,
  }) => {
    const id = `${Date.now()}`;
    const oldBase = `rn-del-file-old-${id}`;
    const renamedBase = `rn-del-file-new-${id}`;

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.file(page, oldBase);

    await explorer.edit.rename(
      page,
      explorer.locators.file(page, `${oldBase}.txt`),
      renamedBase
    );
    await explorer.trash.move(
      page,
      explorer.locators.file(page, `${renamedBase}.txt`)
    );

    await explorer.navigation.goToTrash(page);
    await explorer.trash.delete(
      page,
      explorer.locators.file(page, `${renamedBase}.txt`)
    );

    await explorer.navigation.openReadingRoot(page);
    await explorer.expect.fileNotVisible(page, renamedBase);
  });
});
