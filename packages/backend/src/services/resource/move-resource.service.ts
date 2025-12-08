import { PrimaryId } from '../../constants/primaryId';
import ResourceModel from '../../models/resource.model';
import appAssert from '../../utils/appAssert';
import { BAD_REQUEST, CONFLICT, NOT_FOUND } from '../../constants/http';
import ResourceType from '../../constants/enums/resourceType';
import {
  assertNotRootFolder,
  getAllDescendants,
} from './common-resource.service';

export const moveResource = async (
  resourceId: PrimaryId,
  destinationPath: string,
  userId: PrimaryId
) => {
  destinationPath = decodeURIComponent(destinationPath);
  const resource = await ResourceModel.findOne({ _id: resourceId, userId });
  appAssert(resource, NOT_FOUND, 'Resource not found');
  assertNotRootFolder(resource);

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

  const newPath = `${destinationPath}/${resource.name}`.replace(/\/+/g, '/');

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
    const descendants = await getAllDescendants(resource.path, userId, false);

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
