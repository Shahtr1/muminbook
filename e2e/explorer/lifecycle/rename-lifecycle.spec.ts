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
// test.describe('Rename Explorer Lifecycle', () => {
//   /**
//    * =========================
//    * FOLDER RENAME VALIDATION
//    * =========================
//    */
//
//   test('rename folder with valid name', async ({ page }) => {});
//
//   test('rename folder trims and normalizes spaces', async ({ page }) => {});
//
//   test('rename folder rejects invalid characters', async ({ page }) => {});
//
//   test('rename folder rejects name with no alphanumeric characters', async ({
//     page,
//   }) => {});
//
//   test('rename folder rejects name exceeding max length', async ({
//     page,
//   }) => {});
//
//   test('rename folder rejects empty after normalization', async ({
//     page,
//   }) => {});
//
//   test('rename folder to existing sibling name → conflict error', async ({
//     page,
//   }) => {});
//
//   /**
//    * =========================
//    * FILE RENAME VALIDATION
//    * =========================
//    */
//
//   test('rename file with valid name', async ({ page }) => {});
//
//   test('rename file trims and normalizes spaces', async ({ page }) => {});
//
//   test('rename file rejects invalid characters', async ({ page }) => {});
//
//   test('rename file rejects name with no alphanumeric characters', async ({
//     page,
//   }) => {});
//
//   test('rename file rejects name exceeding max length', async ({ page }) => {});
//
//   test('rename file rejects empty after normalization', async ({ page }) => {});
//
//   test('rename file to existing sibling name → conflict error', async ({
//     page,
//   }) => {});
//
//   /**
//    * =========================
//    * LIFECYCLE TESTS
//    * =========================
//    */
//
//   test('folder lifecycle → create → rename → trash → restore', async ({
//     page,
//   }) => {});
//
//   test('file lifecycle → create → rename → trash → restore', async ({
//     page,
//   }) => {});
//
//   test('folder lifecycle → create → rename → trash → delete', async ({
//     page,
//   }) => {});
//
//   test('file lifecycle → create → rename → trash → delete', async ({
//     page,
//   }) => {});
// });
