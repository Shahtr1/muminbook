import { test } from '@playwright/test';
import { explorer } from '../actions/explorer-actions';

test.describe('Trash Explorer Lifecycle', () => {
  test('resource lifecycle → create → trash → restore → trash again → delete', async ({
    page,
  }) => {});

  test('resource lifecycle → create → trash → restore to original path', async ({
    page,
  }) => {});

  test('resource lifecycle → create → trash → navigate trash → restore from nested view', async ({
    page,
  }) => {});

  // You must validate restore works by ID, not name.
  test(
    'trash folder → recreate same name → trash again → trash contains duplicates, restore first duplicate → correct instance restored,' +
      ' restore second duplicate -> conflict',
    async ({ page }) => {}
  );

  test('restore folder when name exists → conflict', async ({ page }) => {});

  test('restore file when name exists → conflict', async ({ page }) => {});

  test('restore all with mixed conflicts → partial restore + conflict reporting', async ({
    page,
  }) => {});

  test('restore orphan into lost+found with name conflict, should have duplicates', async ({
    page,
  }) => {});
});
