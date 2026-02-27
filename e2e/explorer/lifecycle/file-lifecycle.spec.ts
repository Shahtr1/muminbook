import { test } from '@playwright/test';
import { explorer } from '../actions/explorer-actions';

test.describe('Create File Explorer Lifecycle', () => {
  test('File -> create → trash → restore', async ({ page }) => {
    const base = `mb-file-${Date.now()}`;

    await explorer.navigation.openReadingRoot(page);

    await explorer.create.file(page, base);
    await explorer.expect.fileVisible(page, base);

    await explorer.trash.move(
      page,
      explorer.locators.file(page, `${base}.txt`)
    );
    await explorer.expect.fileNotVisible(page, base);

    await explorer.navigation.goToTrash(page);
    await explorer.expect.fileVisible(page, base);

    await explorer.trash.restore(
      page,
      explorer.locators.file(page, `${base}.txt`)
    );

    await explorer.navigation.openReadingRoot(page);
    await explorer.expect.fileVisible(page, base);
  });

  test('Resource item -> create → trash → delete', async ({ page }) => {
    const base = `mb-file-${Date.now()}`;

    await explorer.navigation.openReadingRoot(page);

    await explorer.create.file(page, base);
    await explorer.expect.fileVisible(page, base);

    await explorer.trash.move(
      page,
      explorer.locators.file(page, `${base}.txt`)
    );

    await explorer.navigation.goToTrash(page);

    await explorer.trash.delete(
      page,
      explorer.locators.file(page, `${base}.txt`)
    );

    await explorer.navigation.openReadingRoot(page);
    await explorer.expect.fileNotVisible(page, base);
  });

  test('create file with valid alphanumeric name', async ({ page }) => {
    const base = `Valid123_${Date.now()}`;

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.file(page, base);

    await explorer.expect.fileVisible(page, base);
  });

  test('create file rejects name with only dash and underscore combination', async ({
    page,
  }) => {
    await explorer.navigation.openReadingRoot(page);
    await explorer.create.file(page, '---___');

    await explorer.expect.toastVisible(
      page,
      'Name must contain at least one letter or number'
    );
  });

  test('create file rejects name with only dashes', async ({ page }) => {
    await explorer.navigation.openReadingRoot(page);
    await explorer.create.file(page, '------');

    await explorer.expect.toastVisible(
      page,
      'Name must contain at least one letter or number'
    );
  });

  test('create file rejects special characters', async ({ page }) => {
    await explorer.navigation.openReadingRoot(page);
    await explorer.create.file(page, 'file@name');

    await explorer.expect.toastVisible(
      page,
      'Only letters, numbers, spaces, hyphen (-), and underscore (_) are allowed'
    );
  });

  test('create file rejects empty name', async ({ page }) => {
    await explorer.navigation.openReadingRoot(page);
    await explorer.create.file(page, '');

    await explorer.expect.toastVisible(page, 'Name is required');
  });

  test('create file allows name at max length boundary', async ({ page }) => {
    const base = 'A'.repeat(100);

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.file(page, base);

    await explorer.expect.fileVisible(page, base);
  });

  test('create file rejects name exceeding max length', async ({ page }) => {
    const base = 'A'.repeat(101);

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.file(page, base);

    await explorer.expect.toastVisible(page, 'Name exceeds maximum length');
  });

  test('create file rejects name with only underscores', async ({ page }) => {
    await explorer.navigation.openReadingRoot(page);
    await explorer.create.file(page, '_____');

    await explorer.expect.toastVisible(
      page,
      'Name must contain at least one letter or number'
    );
  });

  test('create file rejects name with only spaces', async ({ page }) => {
    await explorer.navigation.openReadingRoot(page);
    await explorer.create.file(page, '     ');

    await explorer.expect.toastVisible(page, 'Name is required');
  });

  test('create file normalizes multiple spaces to single space', async ({
    page,
  }) => {
    const raw = 'My   File   Name';
    const expected = 'My File Name';

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.file(page, raw);

    await explorer.expect.fileVisible(page, expected);
  });

  test('create file with spaces between words', async ({ page }) => {
    const base = `My File ${Date.now()}`;

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.file(page, base);

    await explorer.expect.fileVisible(page, base);
  });

  test('create file with mixed case name', async ({ page }) => {
    const base = `TestCase${Date.now()}`;

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.file(page, base);

    await explorer.expect.fileVisible(page, base);
  });

  test('create file trims leading and trailing spaces', async ({ page }) => {
    const raw = '   Trim Me   ';
    const expected = 'Trim Me';

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.file(page, raw);

    await explorer.expect.fileVisible(page, expected);
  });

  test('create file with dash and underscore anywhere', async ({ page }) => {
    const base = `file-name_${Date.now()}`;

    await explorer.navigation.openReadingRoot(page);
    await explorer.create.file(page, base);

    await explorer.expect.fileVisible(page, base);
  });

  test('create file with same name as sibling folder → allowed', async ({
    page,
  }) => {
    const base = `Shared${Date.now()}`;

    await explorer.navigation.openReadingRoot(page);

    await explorer.create.folder(page, base);
    await explorer.create.file(page, base);

    await explorer.expect.folderVisible(page, base);
    await explorer.expect.fileVisible(page, base);
  });

  test('move file into directory containing folder with same name → allowed', async ({
    page,
  }) => {
    const base = `SharedMove${Date.now()}`;

    await explorer.navigation.openReadingRoot(page);

    await explorer.create.folder(page, base);
    await explorer.create.file(page, base);

    await explorer.expect.folderVisible(page, base);
    await explorer.expect.fileVisible(page, base);
  });

  test('restore file when folder with same name exists → allowed', async ({
    page,
  }) => {
    const base = `RestoreShared${Date.now()}`;

    await explorer.navigation.openReadingRoot(page);

    await explorer.create.file(page, base);

    await explorer.trash.move(
      page,
      explorer.locators.file(page, `${base}.txt`)
    );

    await explorer.create.folder(page, base);

    await explorer.navigation.goToTrash(page);

    await explorer.trash.restore(
      page,
      explorer.locators.file(page, `${base}.txt`)
    );

    await explorer.navigation.openReadingRoot(page);

    await explorer.expect.fileVisible(page, base);
  });
});
