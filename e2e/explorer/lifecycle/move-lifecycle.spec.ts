import { test } from '@playwright/test';
import { explorer } from '../actions/explorer-actions';

test.describe('Move Explorer Lifecycle', () => {
  test('file lifecycle → create → move to another folder → trash → restore', async ({
    page,
  }) => {});

  test('folder lifecycle → create → move → trash → restore', async ({
    page,
  }) => {});

  test('file lifecycle → create → move → trash → delete', async ({
    page,
  }) => {});

  test('folder lifecycle → create → move → trash → delete', async ({
    page,
  }) => {});

  test('move folder to directory containing same name → conflict', async ({
    page,
  }) => {});

  test('move file to directory containing same name → conflict', async ({
    page,
  }) => {});

  test('move folder into same parent → no-op or conflict', async ({
    page,
  }) => {});
});
