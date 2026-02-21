import { test } from '@playwright/test';
import { explorer } from '../actions/explorer-actions';

test.describe('Nested Explorer Lifecycle', () => {
  test('Create parent folder → create child folder → trash parent folder → restore folder', async ({
    page,
  }) => {});

  test('trash parent folder → delete', async ({ page }) => {});

  test('file inside folder lifecycle → create → trash parent → restore parent', async ({
    page,
  }) => {});

  test('file inside folder lifecycle → trash individually → restore', async ({
    page,
  }) => {});
});
