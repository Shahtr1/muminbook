import { PrimaryId } from '../../constants/primaryId';
import ResourceModel from '../../models/resource.model';
import appAssert from '../../utils/appAssert';
import { BAD_REQUEST, CONFLICT, NOT_FOUND } from '../../constants/http';
import ResourceType from '../../constants/types/resourceType';
import {
  assertNotRootFolder,
  getAllDescendants,
} from './common-resource.service';

export const renameResource = async (
  resourceId: PrimaryId,
  newName: string,
  userId: PrimaryId
) => {
  const resource = await ResourceModel.findOne({
    _id: resourceId,
    userId,
  });

  appAssert(resource, NOT_FOUND, 'Resource not found');
  appAssert(!resource.deleted, BAD_REQUEST, 'Cannot rename a trashed resource');

  assertNotRootFolder(resource);

  const oldPath = resource.path;
  const parentPath = oldPath.split('/').slice(0, -1).join('/');
  const newPath = `${parentPath}/${newName}`.replace(/\/+/g, '/');

  const conflict = await ResourceModel.findOne({
    path: newPath,
    userId,
  });

  appAssert(
    !conflict,
    CONFLICT,
    `A ${conflict?.type === 'file' ? 'file' : 'folder'} with this name already exists in the destination path`
  );

  const ops: any[] = [];

  // Rename all descendants if it's a folder
  if (resource.type === ResourceType.Folder) {
    const descendants = await getAllDescendants(oldPath, userId, false);

    for (const desc of descendants) {
      const updatedPath = desc.path.replace(oldPath, newPath);
      ops.push({
        updateOne: {
          filter: { _id: desc._id },
          update: { $set: { path: updatedPath } },
        },
      });
    }
  }

  // Rename the resource itself
  ops.push({
    updateOne: {
      filter: { _id: resource._id },
      update: { $set: { name: newName, path: newPath } },
    },
  });

  await ResourceModel.bulkWrite(ops);

  return { message: 'Renamed successfully' };
};
