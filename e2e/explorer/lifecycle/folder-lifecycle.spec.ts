import { test } from '@playwright/test';
import { explorer } from '../actions/explorer-actions';

test.describe('Create Folder Explorer Lifecycle', () => {
  test('Folder item -> create → trash → restore', async ({ page }) => {
    const folderName = `mb-folder-${Date.now()}`;

    await explorer.navigation.openReadingRoot(page);

    await explorer.create.folder(page, folderName);
    await explorer.expect.folderVisible(page, folderName);

    await explorer.trash.move(page, explorer.locators.folder(page, folderName));
    await explorer.expect.folderNotVisible(page, folderName);

    await explorer.navigation.goToTrash(page);
    await explorer.expect.folderVisible(page, folderName);

    await explorer.trash.restore(
      page,
      explorer.locators.folder(page, folderName)
    );

    await explorer.navigation.openReadingRoot(page);
    await explorer.expect.folderVisible(page, folderName);
  });

  test('Resource item -> create → trash → delete', async ({ page }) => {
    const folderName = `mb-folder-${Date.now()}`;

    await explorer.navigation.openReadingRoot(page);

    await explorer.create.folder(page, folderName);
    await explorer.expect.folderVisible(page, folderName);

    await explorer.trash.move(page, explorer.locators.folder(page, folderName));

    await explorer.navigation.goToTrash(page);

    await explorer.trash.delete(
      page,
      explorer.locators.folder(page, folderName)
    );

    await explorer.navigation.openReadingRoot(page);
    await explorer.expect.folderNotVisible(page, folderName);
  });

  test('create folder with valid alphanumeric name', async ({ page }) => {
    const folderName = `Valid123_${Date.now()}`;

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.folder(page, folderName);

    await explorer.expect.folderVisible(page, folderName);
  });

  test('create folder rejects name with only dash and underscore combination', async ({
    page,
  }) => {
    await explorer.navigation.openReadingRoot(page);
    await explorer.create.folder(page, '---___');

    await explorer.expect.toastVisible(
      page,
      'Name must contain at least one letter or number'
    );
  });

  test('create folder rejects name with only dashes', async ({ page }) => {
    await explorer.navigation.openReadingRoot(page);
    await explorer.create.folder(page, '------');

    await explorer.expect.toastVisible(
      page,
      'Name must contain at least one letter or number'
    );
  });

  test('create folder rejects special characters', async ({ page }) => {
    await explorer.navigation.openReadingRoot(page);
    await explorer.create.folder(page, 'folder@name');

    await explorer.expect.toastVisible(
      page,
      'Only letters, numbers, spaces, hyphen (-), and underscore (_) are allowed'
    );
  });

  test('create folder rejects empty name', async ({ page }) => {
    await explorer.navigation.openReadingRoot(page);
    await explorer.create.folder(page, '');

    await explorer.expect.toastVisible(page, 'Name is required');
  });

  test('create folder allows name at max length boundary', async ({ page }) => {
    const folderName = 'A'.repeat(100);

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.folder(page, folderName);

    await explorer.expect.folderVisible(page, folderName);
  });

  test('create folder rejects name exceeding max length', async ({ page }) => {
    const folderName = 'A'.repeat(101);

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.folder(page, folderName);

    await explorer.expect.toastVisible(page, 'Name exceeds maximum length');
  });

  test('create folder rejects name with only underscores', async ({ page }) => {
    await explorer.navigation.openReadingRoot(page);
    await explorer.create.folder(page, '_____');

    await explorer.expect.toastVisible(
      page,
      'Name must contain at least one letter or number'
    );
  });

  test('create folder rejects name with only spaces', async ({ page }) => {
    await explorer.navigation.openReadingRoot(page);
    await explorer.create.folder(page, '     ');

    await explorer.expect.toastVisible(page, 'Name is required');
  });

  test('create folder normalizes multiple spaces to single space', async ({
    page,
  }) => {
    const raw = 'My   Folder   Name';
    const expected = 'My Folder Name';

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.folder(page, raw);

    await explorer.expect.folderVisible(page, expected);
  });

  test('create folder with spaces between words', async ({ page }) => {
    const folderName = `My Folder ${Date.now()}`;

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.folder(page, folderName);

    await explorer.expect.folderVisible(page, folderName);
  });

  test('create folder with mixed case name', async ({ page }) => {
    const folderName = `TestCase${Date.now()}`;

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.folder(page, folderName);

    await explorer.expect.folderVisible(page, folderName);
  });

  test('create folder trims leading and trailing spaces', async ({ page }) => {
    const raw = '   Trim Me   ';
    const expected = 'Trim Me';

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.folder(page, raw);

    await explorer.expect.folderVisible(page, expected);
  });

  test('create folder with dash and underscore anywhere', async ({ page }) => {
    const folderName = `folder-name_${Date.now()}`;

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.folder(page, folderName);

    await explorer.expect.folderVisible(page, folderName);
  });

  test('create folder with same name as sibling file → allowed', async ({
    page,
  }) => {
    const base = `Shared${Date.now()}`;

    await explorer.navigation.openReadingRoot(page);

    await explorer.create.file(page, base);
    await explorer.create.folder(page, base);

    await explorer.expect.fileVisible(page, base);
    await explorer.expect.folderVisible(page, base);
  });

  test('rename folder to existing sibling folder name → conflict', async ({
    page,
  }) => {
    const base = Date.now();
    const folderA = `Folder-A-${base}`;
    const folderB = `Folder-B-${base}`;

    await explorer.navigation.openReadingRoot(page);

    await explorer.create.folder(page, folderA);
    await explorer.create.folder(page, folderB);

    await explorer.edit.rename(
      page,
      explorer.locators.folder(page, folderA),
      folderB
    );

    await explorer.expect.toastVisible(
      page,
      'A folder with this name already exists in the destination path'
    );
    await explorer.expect.folderVisible(page, folderA);
    await explorer.expect.folderVisible(page, folderB);
  });

  test('move folder into directory containing file with same name → allowed', async ({
    page,
  }) => {
    const base = Date.now();
    const source = `Source-${base}`;
    const target = `Target-${base}`;
    const shared = `SharedMove-${base}`;

    await explorer.navigation.openReadingRoot(page);

    await explorer.create.folder(page, source);
    await explorer.create.folder(page, target);

    await page.goto(`/reading/my-files/${encodeURIComponent(source)}`);
    await explorer.create.folder(page, shared);
    await explorer.expect.folderVisible(page, shared);

    await page.goto(`/reading/my-files/${encodeURIComponent(target)}`);
    await explorer.create.file(page, shared);
    await explorer.expect.fileVisible(page, shared);

    await page.goto(`/reading/my-files/${encodeURIComponent(source)}`);
    await explorer.edit.move(
      page,
      explorer.locators.folder(page, shared),
      `my-files/${target}`
    );
    await explorer.expect.folderNotVisible(page, shared);

    await page.goto(`/reading/my-files/${encodeURIComponent(target)}`);
    await explorer.expect.fileVisible(page, shared);
    await explorer.expect.folderVisible(page, shared);
  });

  test('restore folder when file with same name exists → allowed', async ({
    page,
  }) => {
    const base = `RestoreShared${Date.now()}`;

    await explorer.navigation.openReadingRoot(page);

    await explorer.create.folder(page, base);

    await explorer.trash.move(page, explorer.locators.folder(page, base));

    await explorer.create.file(page, base);

    await explorer.navigation.goToTrash(page);

    await explorer.trash.restore(page, explorer.locators.folder(page, base));

    await explorer.navigation.openReadingRoot(page);

    await explorer.expect.folderVisible(page, base);
  });
});
