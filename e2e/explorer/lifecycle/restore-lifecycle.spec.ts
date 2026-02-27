import { expect, test, type Page } from '@playwright/test';
import { explorer } from '../actions/explorer-actions';

test.describe('Hierarchy Restore Semantics', () => {
  test.describe.configure({ mode: 'serial' });
  test.setTimeout(120_000);

  const API_BASE = 'http://localhost:4005';

  const openFolder = async (page: Page, ...segments: string[]) => {
    const encoded = segments.map((s) => encodeURIComponent(s)).join('/');
    await page.goto(`/reading/my-files/${encoded}`);
  };
  const openTrashFolder = async (page: Page, ...segments: string[]) => {
    const encoded = segments.map((s) => encodeURIComponent(s)).join('/');
    await page.goto(`/reading/trash/${encoded}`);
  };

  const createResource = async (
    page: Page,
    type: 'file' | 'folder',
    name: string,
    path: string
  ) => {
    const res = await page.request.post(`${API_BASE}/resources`, {
      data: { type, name, path },
    });
    expect(res.ok()).toBeTruthy();
    return res.json();
  };

  const getChildren = async (page: Page, path: string) => {
    const res = await page.request.get(
      `${API_BASE}/resources?path=${encodeURIComponent(path)}`
    );
    expect(res.ok()).toBeTruthy();
    return res.json();
  };

  const getTrashItems = async (page: Page) => {
    const res = await page.request.get(`${API_BASE}/resources/trash`);
    expect(res.ok()).toBeTruthy();
    return res.json();
  };

  const moveToTrashById = async (page: Page, id: string) => {
    const res = await page.request.patch(`${API_BASE}/resources/${id}/trash`);
    expect(res.ok()).toBeTruthy();
  };

  const restoreById = async (page: Page, id: string) => {
    const res = await page.request.patch(`${API_BASE}/resources/${id}/restore`);
    expect(res.ok()).toBeTruthy();
  };

  const deleteById = async (page: Page, id: string) => {
    const res = await page.request.delete(`${API_BASE}/resources/${id}`);
    expect(res.ok() || res.status() === 404).toBeTruthy();
  };

  const byName = (items: any[], name: string, type: 'file' | 'folder') =>
    items.find((r) => r.name === name && r.type === type);

  test('parent trash → entire subtree softDeleted', async ({ page }) => {
    const id = `${Date.now()}`;
    const parent = `restore-parent-${id}`;
    const childFolder = `restore-child-${id}`;
    const nestedFileBase = `restore-nested-${id}`;
    const nestedFile = `${nestedFileBase}.txt`;

    const parentRes = await createResource(page, 'folder', parent, 'my-files');
    await createResource(page, 'folder', childFolder, parentRes.path);
    await createResource(
      page,
      'file',
      nestedFileBase,
      `${parentRes.path}/${childFolder}`
    );

    await moveToTrashById(page, parentRes._id);

    const trashItems = await getTrashItems(page);
    expect(byName(trashItems, parent, 'folder')).toBeTruthy();
    expect(byName(trashItems, childFolder, 'folder')).toBeTruthy();
    expect(byName(trashItems, nestedFile, 'file')).toBeTruthy();
  });

  test('restore parent explicitly → entire subtree restored recursively', async ({
    page,
  }) => {
    const id = `${Date.now()}`;
    const parent = `restore-rec-parent-${id}`;
    const childFolder = `restore-rec-child-${id}`;
    const nestedFileBase = `restore-rec-file-${id}`;
    const nestedFile = `${nestedFileBase}.txt`;

    const parentRes = await createResource(page, 'folder', parent, 'my-files');
    await createResource(page, 'folder', childFolder, parentRes.path);
    await createResource(
      page,
      'file',
      nestedFileBase,
      `${parentRes.path}/${childFolder}`
    );

    await moveToTrashById(page, parentRes._id);
    await restoreById(page, parentRes._id);

    await explorer.navigation.openReadingRoot(page);
    await explorer.expect.folderVisible(page, parent);
    await openFolder(page, parent, childFolder);
    await explorer.expect.fileVisible(page, nestedFileBase);

    const children = await getChildren(
      page,
      `${parentRes.path}/${childFolder}`
    );
    expect(byName(children, nestedFile, 'file')).toBeTruthy();
  });

  test('restore child while parent softDeleted → ancestors restored, siblings remain softDeleted', async ({
    page,
  }) => {
    const id = `${Date.now()}`;
    const parent = `restore-chain-parent-${id}`;
    const fileABase = `restore-chain-a-${id}`;
    const fileBBase = `restore-chain-b-${id}`;
    const fileA = `${fileABase}.txt`;
    const fileB = `${fileBBase}.txt`;

    const parentRes = await createResource(page, 'folder', parent, 'my-files');
    const fileARes = await createResource(
      page,
      'file',
      fileABase,
      parentRes.path
    );
    await createResource(page, 'file', fileBBase, parentRes.path);

    await moveToTrashById(page, parentRes._id);
    await restoreById(page, fileARes._id);

    await explorer.navigation.openReadingRoot(page);
    await explorer.expect.folderVisible(page, parent);
    await openFolder(page, parent);
    await expect(explorer.locators.file(page, fileA)).toBeVisible();
    await expect(explorer.locators.file(page, fileB)).toHaveCount(0);

    const trashItems = await getTrashItems(page);
    expect(byName(trashItems, fileB, 'file')).toBeTruthy();
  });

  test('restore deeply nested child → full ancestor chain restored only', async ({
    page,
  }) => {
    const id = `${Date.now()}`;
    const parent = `restore-deep-parent-${id}`;
    const level1 = `restore-deep-l1-${id}`;
    const level2 = `restore-deep-l2-${id}`;
    const deepFileBase = `restore-deep-file-${id}`;
    const siblingFileBase = `restore-deep-sibling-${id}`;
    const deepFile = `${deepFileBase}.txt`;
    const siblingFile = `${siblingFileBase}.txt`;

    const parentRes = await createResource(page, 'folder', parent, 'my-files');
    const level1Res = await createResource(
      page,
      'folder',
      level1,
      parentRes.path
    );
    const level2Res = await createResource(
      page,
      'folder',
      level2,
      level1Res.path
    );
    const deepFileRes = await createResource(
      page,
      'file',
      deepFileBase,
      level2Res.path
    );
    await createResource(page, 'file', siblingFileBase, level1Res.path);

    await moveToTrashById(page, parentRes._id);
    await restoreById(page, deepFileRes._id);

    await explorer.navigation.openReadingRoot(page);
    await explorer.expect.folderVisible(page, parent);
    await openFolder(page, parent, level1, level2);
    await expect(explorer.locators.file(page, deepFile)).toBeVisible();

    await openFolder(page, parent, level1);
    await expect(explorer.locators.file(page, siblingFile)).toHaveCount(0);

    const trashItems = await getTrashItems(page);
    expect(byName(trashItems, siblingFile, 'file')).toBeTruthy();
  });

  test('restore child after parent restored → only child restored', async ({
    page,
  }) => {
    const id = `${Date.now()}`;
    const parent = `restore-post-parent-${id}`;
    const childFileBase = `restore-post-file-${id}`;
    const childFile = `${childFileBase}.txt`;

    const parentRes = await createResource(page, 'folder', parent, 'my-files');
    const childRes = await createResource(
      page,
      'file',
      childFileBase,
      parentRes.path
    );

    await moveToTrashById(page, parentRes._id);
    await restoreById(page, parentRes._id);

    await moveToTrashById(page, childRes._id);
    await restoreById(page, childRes._id);

    await explorer.navigation.openReadingRoot(page);
    await explorer.expect.folderVisible(page, parent);
    await openFolder(page, parent);
    await expect(explorer.locators.file(page, childFile)).toBeVisible();
  });

  test('restore child then re-trash parent → restored child returns to trash with sibling', async ({
    page,
  }) => {
    const id = `${Date.now()}`;
    const parent = `restore-retrash-parent-${id}`;
    const fileABase = `restore-retrash-a-${id}`;
    const fileBBase = `restore-retrash-b-${id}`;
    const fileA = `${fileABase}.txt`;
    const fileB = `${fileBBase}.txt`;

    const parentRes = await createResource(page, 'folder', parent, 'my-files');
    const fileARes = await createResource(
      page,
      'file',
      fileABase,
      parentRes.path
    );
    await createResource(page, 'file', fileBBase, parentRes.path);

    await moveToTrashById(page, parentRes._id);
    await restoreById(page, fileARes._id);

    await explorer.navigation.openReadingRoot(page);
    await explorer.expect.folderVisible(page, parent);
    await openFolder(page, parent);
    await expect(explorer.locators.file(page, fileA)).toBeVisible();
    await expect(explorer.locators.file(page, fileB)).toHaveCount(0);

    await moveToTrashById(page, parentRes._id);

    await explorer.navigation.openReadingRoot(page);
    await explorer.expect.folderNotVisible(page, parent);

    const trashItems = await getTrashItems(page);
    expect(byName(trashItems, parent, 'folder')).toBeTruthy();
    expect(byName(trashItems, fileA, 'file')).toBeTruthy();
    expect(byName(trashItems, fileB, 'file')).toBeTruthy();
  });

  test('restore A while B subtree stays trashed, then trash B and re-trash parent again → trash state remains consistent', async ({
    page,
  }) => {
    const id = `${Date.now()}`;
    const parent = `restore-cycle-parent-${id}`;
    const fileABase = `restore-cycle-a-${id}`;
    const fileA = `${fileABase}.txt`;
    const folderB = `restore-cycle-b-${id}`;
    const bNestedBase = `restore-cycle-b-nested-${id}`;
    const bNested = `${bNestedBase}.txt`;

    const parentRes = await createResource(page, 'folder', parent, 'my-files');
    const fileARes = await createResource(
      page,
      'file',
      fileABase,
      parentRes.path
    );
    const folderBRes = await createResource(
      page,
      'folder',
      folderB,
      parentRes.path
    );
    await createResource(page, 'file', bNestedBase, folderBRes.path);

    // Parent to trash, then restore only A: parent chain returns, B subtree stays trashed.
    await moveToTrashById(page, parentRes._id);
    await restoreById(page, fileARes._id);

    await explorer.navigation.openReadingRoot(page);
    await explorer.expect.folderVisible(page, parent);
    await openFolder(page, parent);
    await expect(explorer.locators.file(page, fileA)).toBeVisible();
    await expect(explorer.locators.folder(page, folderB)).toHaveCount(0);

    let trashItems = await getTrashItems(page);
    expect(byName(trashItems, folderB, 'folder')).toBeTruthy();
    expect(byName(trashItems, bNested, 'file')).toBeTruthy();

    // Re-trash parent: everything should be back in trash together.
    await moveToTrashById(page, parentRes._id);
    trashItems = await getTrashItems(page);
    expect(byName(trashItems, parent, 'folder')).toBeTruthy();
    expect(byName(trashItems, fileA, 'file')).toBeTruthy();
    expect(byName(trashItems, folderB, 'folder')).toBeTruthy();
    expect(byName(trashItems, bNested, 'file')).toBeTruthy();

    // Restore parent, trash B subtree alone, then trash parent again.
    await restoreById(page, parentRes._id);
    await moveToTrashById(page, folderBRes._id);

    await explorer.navigation.openReadingRoot(page);
    await explorer.expect.folderVisible(page, parent);
    await openFolder(page, parent);
    await expect(explorer.locators.file(page, fileA)).toBeVisible();
    await expect(explorer.locators.folder(page, folderB)).toHaveCount(0);

    await moveToTrashById(page, parentRes._id);
    trashItems = await getTrashItems(page);
    expect(byName(trashItems, parent, 'folder')).toBeTruthy();
    expect(byName(trashItems, fileA, 'file')).toBeTruthy();
    expect(byName(trashItems, folderB, 'folder')).toBeTruthy();
    expect(byName(trashItems, bNested, 'file')).toBeTruthy();
  });

  test('parent with file + two child folders across restore/trash cycles keeps expected orphan and regroup behavior', async ({
    page,
  }) => {
    const id = `${Date.now()}`;
    const parent = `parentA-${id}`;
    const fileBase = `1-${id}`;
    const fileName = `${fileBase}.txt`;
    const elder = `folderElderChild-${id}`;
    const young = `folderYoungChild-${id}`;

    const parentRes = await createResource(page, 'folder', parent, 'my-files');
    const fileRes = await createResource(
      page,
      'file',
      fileBase,
      parentRes.path
    );
    const elderRes = await createResource(
      page,
      'folder',
      elder,
      parentRes.path
    );
    const youngRes = await createResource(
      page,
      'folder',
      young,
      parentRes.path
    );

    // 1) Trash parent: all three children become trashed.
    await moveToTrashById(page, parentRes._id);

    // 2) Restore elder: parent is restored with only elder in folder view.
    await restoreById(page, elderRes._id);

    await explorer.navigation.openReadingRoot(page);
    await explorer.expect.folderVisible(page, parent);
    await openFolder(page, parent);
    await explorer.expect.folderVisible(page, elder);
    await expect(explorer.locators.file(page, fileName)).toHaveCount(0);
    await expect(explorer.locators.folder(page, young)).toHaveCount(0);

    // In trash there should be two orphans now: file + young folder.
    let trashItems = await getTrashItems(page);
    expect(byName(trashItems, fileName, 'file')).toBeTruthy();
    expect(byName(trashItems, young, 'folder')).toBeTruthy();
    expect(byName(trashItems, elder, 'folder')).toBeFalsy();

    // 3) Trash elder again: now all three child resources are trashed.
    await moveToTrashById(page, elderRes._id);
    trashItems = await getTrashItems(page);
    expect(byName(trashItems, fileName, 'file')).toBeTruthy();
    expect(byName(trashItems, young, 'folder')).toBeTruthy();
    expect(byName(trashItems, elder, 'folder')).toBeTruthy();

    // 4) Restore young: parent has only young in folder view.
    await restoreById(page, youngRes._id);

    await explorer.navigation.openReadingRoot(page);
    await explorer.expect.folderVisible(page, parent);
    await openFolder(page, parent);
    await explorer.expect.folderVisible(page, young);
    await expect(explorer.locators.folder(page, elder)).toHaveCount(0);
    await expect(explorer.locators.file(page, fileName)).toHaveCount(0);

    // 5) Move parent to trash again: all three regroup under trashed parent.
    await moveToTrashById(page, parentRes._id);

    trashItems = await getTrashItems(page);
    expect(byName(trashItems, parent, 'folder')).toBeTruthy();
    expect(byName(trashItems, fileName, 'file')).toBeTruthy();
    expect(byName(trashItems, elder, 'folder')).toBeTruthy();
    expect(byName(trashItems, young, 'folder')).toBeTruthy();

    await explorer.navigation.goToTrash(page);
    await explorer.expect.folderVisible(page, parent);
  });

  test('parent with 1.txt and 2.txt: restore 1.txt leaves orphan 2.txt, re-trash parent regroups both under parent', async ({
    page,
  }) => {
    const id = `${Date.now()}`;
    const parent = `parentA-files-${id}`;
    const file1Base = `1-${id}`;
    const file2Base = `2-${id}`;
    const file1 = `${file1Base}.txt`;
    const file2 = `${file2Base}.txt`;

    const parentRes = await createResource(page, 'folder', parent, 'my-files');
    const file1Res = await createResource(
      page,
      'file',
      file1Base,
      parentRes.path
    );
    await createResource(page, 'file', file2Base, parentRes.path);

    await moveToTrashById(page, parentRes._id);
    await restoreById(page, file1Res._id);

    // Folder view: parent restored with only 1.txt
    await explorer.navigation.openReadingRoot(page);
    await explorer.expect.folderVisible(page, parent);
    await openFolder(page, parent);
    await expect(explorer.locators.file(page, file1)).toBeVisible();
    await expect(explorer.locators.file(page, file2)).toHaveCount(0);

    // Trash view: 2.txt appears as orphan at root.
    await explorer.navigation.goToTrash(page);
    await expect(explorer.locators.file(page, file2)).toBeVisible();
    await expect(explorer.locators.folder(page, parent)).toHaveCount(0);

    // Re-trash parent: parent should have both 1.txt and 2.txt.
    await moveToTrashById(page, parentRes._id);
    await explorer.navigation.goToTrash(page);
    await explorer.expect.folderVisible(page, parent);
    await openTrashFolder(page, parent);
    await expect(explorer.locators.file(page, file1)).toBeVisible();
    await expect(explorer.locators.file(page, file2)).toBeVisible();
  });

  test('UI-visible cycle: create parent with 1.txt/2.txt, restore 1.txt, then re-trash parent regroups both', async ({
    page,
  }) => {
    const id = `${Date.now()}`;
    const parent = `ui-parent-${id}`;
    const file1Base = `1-${id}`;
    const file2Base = `2-${id}`;
    const file1 = `${file1Base}.txt`;
    const file2 = `${file2Base}.txt`;

    // Create via UI so actions are visible in headed/slow mode.
    await explorer.navigation.openReadingRoot(page);
    await explorer.create.folder(page, parent);

    await openFolder(page, parent);
    await explorer.create.file(page, file1Base);
    await explorer.create.file(page, file2Base);
    await expect(explorer.locators.file(page, file1)).toBeVisible();
    await expect(explorer.locators.file(page, file2)).toBeVisible();

    // Trash parent from root.
    await explorer.navigation.openReadingRoot(page);
    await explorer.trash.move(page, explorer.locators.folder(page, parent));

    // Restore only 1.txt from inside trashed parent.
    await explorer.navigation.goToTrash(page);
    await explorer.expect.folderVisible(page, parent);
    await openTrashFolder(page, parent);
    await explorer.trash.restore(page, explorer.locators.file(page, file1));

    // Folder view now has parent with only 1.txt.
    await explorer.navigation.openReadingRoot(page);
    await explorer.expect.folderVisible(page, parent);
    await openFolder(page, parent);
    await expect(explorer.locators.file(page, file1)).toBeVisible();
    await expect(explorer.locators.file(page, file2)).toHaveCount(0);

    // Trash root has orphan 2.txt.
    await explorer.navigation.goToTrash(page);
    await expect(explorer.locators.file(page, file2)).toBeVisible();
    await expect(explorer.locators.folder(page, parent)).toHaveCount(0);

    // Re-trash parent and verify both files are regrouped under parent.
    await explorer.navigation.openReadingRoot(page);
    await explorer.trash.move(page, explorer.locators.folder(page, parent));
    await explorer.navigation.goToTrash(page);
    await explorer.expect.folderVisible(page, parent);
    await openTrashFolder(page, parent);
    await expect(explorer.locators.file(page, file1)).toBeVisible();
    await expect(explorer.locators.file(page, file2)).toBeVisible();
  });

  test('manual mirror flow with dynamic names: parent / 1.txt / 2.txt', async ({
    page,
  }) => {
    const id = `${Date.now()}`;
    const parent = `parent-${id}`;
    const file1Base = `1-${id}`;
    const file2Base = `2-${id}`;
    const file1 = `${file1Base}.txt`;
    const file2 = `${file2Base}.txt`;

    // Cleanup any previous leftovers for deterministic reruns.
    const rootChildren = await getChildren(page, 'my-files');
    for (const item of rootChildren) {
      if (
        (item.type === 'folder' && item.name === parent) ||
        (item.type === 'file' && (item.name === file1 || item.name === file2))
      ) {
        await deleteById(page, item._id);
      }
    }
    const trashBefore = await getTrashItems(page);
    for (const item of trashBefore) {
      if (
        (item.type === 'folder' && item.name === parent) ||
        (item.type === 'file' && (item.name === file1 || item.name === file2))
      ) {
        await deleteById(page, item._id);
      }
    }

    // Create parent with 1.txt and 2.txt.
    await explorer.navigation.openReadingRoot(page);
    await explorer.create.folder(page, parent);
    await openFolder(page, parent);
    await explorer.create.file(page, file1Base);
    await explorer.create.file(page, file2Base);
    await expect(explorer.locators.file(page, file1)).toBeVisible();
    await expect(explorer.locators.file(page, file2)).toBeVisible();

    // Trash parent.
    await explorer.navigation.openReadingRoot(page);
    await explorer.trash.move(page, explorer.locators.folder(page, parent));

    // Restore 1.txt only.
    await explorer.navigation.goToTrash(page);
    await explorer.expect.folderVisible(page, parent);
    await openTrashFolder(page, parent);
    await explorer.trash.restore(page, explorer.locators.file(page, file1));

    // Trash root first: 2.txt orphan, no parent folder.
    await explorer.navigation.goToTrash(page);
    await expect(explorer.locators.file(page, file2)).toBeVisible();
    await expect(explorer.locators.folder(page, parent)).toHaveCount(0);

    // Then verify Folder view: parent with only 1.txt.
    await explorer.navigation.openReadingRoot(page);
    await explorer.expect.folderVisible(page, parent);
    await openFolder(page, parent);
    await expect(explorer.locators.file(page, file1)).toBeVisible();
    await expect(explorer.locators.file(page, file2)).toHaveCount(0);

    // Move parent to trash again.
    await explorer.navigation.openReadingRoot(page);
    await explorer.trash.move(page, explorer.locators.folder(page, parent));

    // Trash parent should now contain both 1.txt and 2.txt.
    await explorer.navigation.goToTrash(page);
    await explorer.expect.folderVisible(page, parent);
    await openTrashFolder(page, parent);
    await expect(explorer.locators.file(page, file1)).toBeVisible();
    await expect(explorer.locators.file(page, file2)).toBeVisible();
  });
});
