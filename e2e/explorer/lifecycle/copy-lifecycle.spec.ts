import { test } from '@playwright/test';
import { explorer } from '../actions/explorer-actions';

test.describe('Copy Explorer Lifecycle', () => {
  test('file lifecycle → create → copy → trash original → restore', async ({
    page,
  }) => {});

  test('folder lifecycle → create → copy → trash original → restore', async ({
    page,
  }) => {});

  test('copied file lifecycle → trash copy → restore', async ({ page }) => {});

  test('copied folder lifecycle → trash copy → delete', async ({ page }) => {});

  test('copy folder into same directory → auto append (Copy) -> again -> auto append (Copy 2) -> again -> auto append (Copy 3)', async ({
    page,
  }) => {});

  test('copy file into same directory → auto append (Copy) -> again -> auto append (Copy 2) -> again -> auto append (Copy 3)', async ({
    page,
  }) => {});

  test('copy folder into another directory with same resource name → auto append (Copy) -> again -> auto append (Copy 2) -> again -> auto append (Copy 3)', async ({
    page,
  }) => {});

  test('copy file into another directory with same resource name → auto append (Copy) -> again -> auto append (Copy 2) -> again -> auto append (Copy 3)', async ({
    page,
  }) => {});
});
