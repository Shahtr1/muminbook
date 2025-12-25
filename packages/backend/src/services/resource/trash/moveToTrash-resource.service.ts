import { PrimaryId } from '../../../constants/primaryId';
import ResourceModel from '../../../models/resource.model';
import appAssert from '../../../utils/appAssert';
import { NOT_FOUND } from '../../../constants/http';
import ResourceType from '../../../constants/enums/resourceType';
import {
  assertNotRootFolder,
  getAllDescendants,
} from '../common-resource.service';

export const moveToTrashResource = async (
  resourceId: PrimaryId,
  userId: PrimaryId
) => {
  const resource = await ResourceModel.findOne({ _id: resourceId, userId });
  appAssert(resource, NOT_FOUND, 'Resource not found');

  assertNotRootFolder(resource);

  const now = new Date();
  const updates: any[] = [];

  // Step 1: Remove existing trash resource(s) with same path
  await ResourceModel.deleteMany({
    path: resource.path,
    userId,
    deleted: true,
  });

  // Step 2: Handle folder descendants
  if (resource.type === ResourceType.Folder) {
    const descendants = await getAllDescendants(resource.path, userId);

    for (const child of descendants) {
      // Remove conflicting trashed child path if exists
      await ResourceModel.deleteMany({
        path: child.path,
        userId,
        deleted: true,
      });

      updates.push({
        updateOne: {
          filter: { _id: child._id },
          update: { $set: { deleted: true, deletedAt: now } },
        },
      });
    }
  }

  // Step 3: Mark resource as deleted
  updates.push({
    updateOne: {
      filter: { _id: resource._id },
      update: { $set: { deleted: true, deletedAt: now } },
    },
  });

  // Step 4: Execute bulk update
  await ResourceModel.bulkWrite(updates);
};
