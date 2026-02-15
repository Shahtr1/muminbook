import { PrimaryId } from '../../constants/ids.js';
import ResourceModel from '../../models/resource.model.js';
import appAssert from '../../utils/appAssert.js';
import { BAD_REQUEST, CONFLICT, NOT_FOUND } from '../../constants/http.js';
import ResourceType from '../../constants/types/resourceType.js';
import {
  assertNotRootFolder,
  findDescendantsByPath,
} from './common-resource.service.js';
import { normalizeSlashes } from './utils/normalizeSlashes.js';

export const moveResource = async (
  resourceId: PrimaryId,
  destinationPath: string,
  userId: PrimaryId
) => {
  destinationPath = decodeURIComponent(destinationPath);
  const resource = await ResourceModel.findOne({ _id: resourceId, userId });
  appAssert(resource, NOT_FOUND, 'Resource not found');

  assertNotRootFolder(resource, 'Cannot move root folder');

  const destinationFolder = await ResourceModel.findOne({
    path: destinationPath,
    type: ResourceType.Folder,
    userId,
    deleted: false,
  });

  appAssert(destinationFolder, NOT_FOUND, 'Destination folder not found');

  // Prevent moving into self or its own children
  appAssert(
    resource.path !== destinationPath &&
      !destinationPath.startsWith(`${resource.path}/`),
    BAD_REQUEST,
    'Cannot copy a folder into itself or its subfolders.'
  );

  const newPath = normalizeSlashes(`${destinationPath}/${resource.name}`);

  const conflict = await ResourceModel.findOne({
    path: newPath,
    userId,
  });
  appAssert(
    !conflict,
    CONFLICT,
    'A resource with the same name already exists in target folder'
  );

  const updates: any[] = [];

  if (resource.type === ResourceType.Folder) {
    const descendants = await findDescendantsByPath(
      resource.path,
      userId,
      false
    );

    for (const doc of descendants) {
      const updatedPath = doc.path.replace(resource.path, newPath);
      updates.push({
        updateOne: {
          filter: { _id: doc._id },
          update: { $set: { path: updatedPath } },
        },
      });
    }
  }

  updates.push({
    updateOne: {
      filter: { _id: resource._id },
      update: {
        $set: {
          parent: destinationFolder._id,
          path: newPath,
        },
      },
    },
  });

  await ResourceModel.bulkWrite(updates);

  return { message: 'Moved successfully' };
};
