// import { test } from '@playwright/test';
// import { explorer } from '../actions/explorer-actions';
//
// /**
//  ✅ Letters (a–z, A–Z)
//
//  ✅ Numbers (0–9)
//
//  ✅ - and _ anywhere
//
//  ✅ Spaces allowed (but normalized)
//
//  ❌ No leading/trailing spaces
//
//  ❌ No multiple consecutive spaces
//
//  ❌ No special characters beyond - _
//
//  ✅ Must contain at least one letter or number
//
//  ✅ Max length enforced
//
//  ✅ Case-sensitive (Test and test are different)
//
//  ✅ Conflict if normalized name matches existing name
//
//  **/
//
// test.describe('Create Folder Explorer Lifecycle', () => {
//   test('Folder item -> create → trash → restore', async ({ page }) => {
//     const folderName = `mb-folder-${Date.now()}`;
//
//     // OPEN ROOT
//     await explorer.navigation.openReadingRoot(page);
//
//     // CREATE FOLDER
//     await explorer.create.folder(page, folderName);
//     await explorer.expect.folderVisible(page, folderName);
//
//     // MOVE TO TRASH
//     await explorer.trash.move(page, explorer.locators.folder(page, folderName));
//     await explorer.expect.folderNotVisible(page, folderName);
//
//     // GO TO TRASH
//     await explorer.navigation.goToTrash(page);
//
//     await explorer.expect.folderVisible(page, folderName);
//
//     // RESTORE FOLDER
//     await explorer.trash.restore(
//       page,
//       explorer.locators.folder(page, folderName)
//     );
//
//     // VERIFY REMOVED FROM TRASH
//     await explorer.expect.folderNotVisible(page, folderName);
//
//     // VERIFY BACK IN MY FILES
//     await explorer.navigation.openReadingRoot(page);
//
//     await explorer.expect.folderVisible(page, folderName);
//   });
//
//   test('Resource item -> create → trash → delete', async ({ page }) => {
//     const folderName = `mb-folder-${Date.now()}`;
//
//     // OPEN ROOT
//     await explorer.navigation.openReadingRoot(page);
//
//     // CREATE FOLDER
//     await explorer.create.folder(page, folderName);
//     await explorer.expect.folderVisible(page, folderName);
//
//     // MOVE TO TRASH
//     await explorer.trash.move(page, explorer.locators.folder(page, folderName));
//     await explorer.expect.folderNotVisible(page, folderName);
//
//     // GO TO TRASH
//     await explorer.navigation.goToTrash(page);
//
//     await explorer.expect.folderVisible(page, folderName);
//
//     // DELETE FOLDER
//     await explorer.trash.delete(
//       page,
//       explorer.locators.folder(page, folderName)
//     );
//
//     // VERIFY REMOVED FROM TRASH
//     await explorer.expect.folderNotVisible(page, folderName);
//
//     // VERIFY STILL REMOVED IN MY FILES
//     await explorer.navigation.openReadingRoot(page);
//
//     await explorer.expect.folderNotVisible(page, folderName);
//   });
//
//   test('create folder with valid alphanumeric name', async ({ page }) => {});
//   test('create folder rejects name with only dash and underscore combination', async ({
//     page,
//   }) => {});
//   test('create folder rejects name with only dashes', async ({ page }) => {});
//   test('create folder rejects special characters', async ({ page }) => {});
//   test('create folder rejects empty name', async ({ page }) => {});
//   test('create folder allows name at max length boundary', async ({
//     page,
//   }) => {});
//   test('create folder rejects name exceeding max length', async ({
//     page,
//   }) => {});
//   test('create folder rejects name with only underscores', async ({
//     page,
//   }) => {});
//   test('create folder rejects name with only spaces', async ({ page }) => {});
//   test('create folder normalizes multiple spaces to single space', async ({
//     page,
//   }) => {});
//   test('create folder with spaces between words', async ({ page }) => {});
//   test('create folder with mixed case name', async ({ page }) => {});
//   test('create folder trims leading and trailing spaces', async ({
//     page,
//   }) => {});
//   test('create folder with dash and underscore anywhere', async ({
//     page,
//   }) => {});
//   test('create folder with same name as sibling file → allowed', async ({
//     page,
//   }) => {});
//   test('rename folder to same name as sibling folder → allowed', async ({
//     page,
//   }) => {});
//   test('move folder into directory containing file with same name → allowed', async ({
//     page,
//   }) => {});
//   test('restore folder when file with same name exists → allowed', async ({
//     page,
//   }) => {});
// });
