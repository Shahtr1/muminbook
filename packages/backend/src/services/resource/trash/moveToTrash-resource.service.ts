import { PrimaryId } from '../../../constants/ids.js';
import ResourceModel from '../../../models/resource.model.js';
import appAssert from '../../../utils/appAssert.js';
import { NOT_FOUND } from '../../../constants/http.js';
import ResourceType from '../../../constants/types/resourceType.js';
import {
  assertNotRootFolder,
  findDescendantsByPath,
} from '../common-resource.service.js';

/**
 * Move a resource (file or folder) into trash (soft-delete).
 * For folders: ensures any existing trashed resources with the same paths are removed,
 * then marks each descendant and the folder itself as `deleted: true` with the same timestamp.
 *
 * This function performs the following steps:
 * 1. Validate resource exists and is not the protected root folder.
 * 2. Remove any existing trashed documents that have the same path(s) to avoid conflicts.
 * 3. For folders, fetch descendants and schedule them for soft-delete.
 * 4. Schedule the target resource for soft-delete and execute a bulkWrite.
 *
 * Note: The service intentionally uses `ResourceModel.deleteMany` to remove conflicting trashed
 * documents before inserting soft-delete operations to avoid unique/path conflicts.
 */
export const moveToTrashResource = async (
  resourceId: PrimaryId,
  userId: PrimaryId
) => {
  const target = await ResourceModel.findOne({ _id: resourceId, userId });
  appAssert(target, NOT_FOUND, 'Resource not found');

  assertNotRootFolder(target);

  const deletedAt = new Date();

  const bulkOps: any[] = [];

  // Step 1: Remove any existing trashed document(s) that match the target's path
  // (prevents path collisions when restoring or re-creating trashed documents)
  await ResourceModel.deleteMany({
    path: target.path,
    userId,
    deleted: true,
  });

  // Step 2: If it's a folder, mark its descendants as trashed
  if (target.type === ResourceType.Folder) {
    // By default `findDescendantsByPath` includes trashed items; we only need descendants
    const descendants = await findDescendantsByPath(target.path, userId);

    for (const child of descendants) {
      // Remove any existing trashed documents that match the child's path
      await ResourceModel.deleteMany({
        path: child.path,
        userId,
        deleted: true,
      });

      // Schedule descendant soft-delete update
      bulkOps.push({
        updateOne: {
          filter: { _id: child._id },
          update: { $set: { deleted: true, deletedAt } },
        },
      });
    }
  }

  // Step 3: Schedule the target resource for soft-delete
  bulkOps.push({
    updateOne: {
      filter: { _id: target._id },
      update: { $set: { deleted: true, deletedAt } },
    },
  });

  // Step 4: Execute bulk update if there is anything to apply
  if (bulkOps.length > 0) {
    await ResourceModel.bulkWrite(bulkOps);
  }
};
