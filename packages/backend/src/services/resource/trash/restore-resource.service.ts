/**
 * @fileoverview Restore Resource Service
 *
 * Service for restoring resources from trash:
 * - restoreResource: Restores a single resource from trash
 * - restoreAllResources: Restores all possible resources from trash
 * - Handles parent validation and lost+found restoration
 * - Manages conflict detection
 * - Updates descendants paths and deleted status
 */

import ResourceModel from '../../../models/resource.model.js';
import ResourceType from '../../../constants/types/resourceType.js';
import { PrimaryId } from '../../../constants/ids.js';
import appAssert from '../../../utils/appAssert.js';
import { BAD_REQUEST, CONFLICT, NOT_FOUND } from '../../../constants/http.js';
import { findOrCreateLostAndFound } from '../utils/findOrCreateLostAndFound.js';
import { findDescendantsByPath } from '../common-resource.service.js';
import { normalizeSlashes } from '../utils/normalizeSlashes.js';

const hasConflict = async (path: string, userId: PrimaryId) => {
  return ResourceModel.findOne({
    path,
    userId,
    deleted: false,
  });
};

const shouldRestoreAsLostAndFound = async (
  resource: any,
  userId: PrimaryId
) => {
  const parentPath = resource.path.split('/').slice(0, -1).join('/');

  const parentFolder = await ResourceModel.findOne({
    path: parentPath,
    type: ResourceType.Folder,
    userId,
    deleted: false,
  });

  return !parentFolder;
};

const buildRestoreUpdates = async ({
  resource,
  userId,
  newBasePath,
  newParentId,
}: {
  resource: any;
  userId: PrimaryId;
  newBasePath: string;
  newParentId: PrimaryId;
}) => {
  const updates: any[] = [];

  const descendants =
    resource.type === ResourceType.Folder
      ? await findDescendantsByPath(resource.path, userId)
      : [];

  for (const desc of descendants) {
    const relativePath = desc.path.replace(resource.path, '');
    const newPath = normalizeSlashes(`${newBasePath}${relativePath}`);

    updates.push({
      updateOne: {
        filter: { _id: desc._id },
        update: {
          $set: {
            deleted: false,
            deletedAt: null,
            path: newPath,
            parent:
              desc.parent?.toString() === resource._id.toString()
                ? resource._id
                : desc.parent,
          },
        },
      },
    });
  }

  updates.push({
    updateOne: {
      filter: { _id: resource._id },
      update: {
        $set: {
          deleted: false,
          deletedAt: null,
          path: newBasePath,
          parent: newParentId,
        },
      },
    },
  });

  return updates;
};

export const restoreResource = async (
  resourceId: PrimaryId,
  userId: PrimaryId
) => {
  const resource = await ResourceModel.findOne({ _id: resourceId, userId });
  appAssert(resource, NOT_FOUND, 'Resource not found');
  appAssert(resource.deleted, BAD_REQUEST, 'Resource is not in trash');

  if (await shouldRestoreAsLostAndFound(resource, userId)) {
    const lostAndFound = await findOrCreateLostAndFound(userId);
    const newBasePath = normalizeSlashes(
      `${lostAndFound.path}/${resource.name}`
    );
    const updates = await buildRestoreUpdates({
      resource,
      userId,
      newBasePath,
      newParentId: lostAndFound._id as PrimaryId,
    });

    await ResourceModel.bulkWrite(updates);
    return { message: 'Restored to lost+found' };
  }

  if (await hasConflict(resource.path, userId)) {
    const conflict = await hasConflict(resource.path, userId);
    appAssert(
      !conflict,
      CONFLICT,
      `A ${conflict?.type === 'file' ? 'file' : 'folder'} with this name already exists in the destination path`
    );
  }

  const updates = await buildRestoreUpdates({
    resource,
    userId,
    newBasePath: resource.path,
    newParentId: resource.parent as PrimaryId,
  });

  await ResourceModel.bulkWrite(updates);
  return { message: 'Restored successfully' };
};

export const restoreAllResources = async (userId: PrimaryId) => {
  const resources = await ResourceModel.find({ userId, deleted: true });
  appAssert(resources.length > 0, NOT_FOUND, 'No trashed resources found');

  for (const resource of resources) {
    const isLostAndFound = await shouldRestoreAsLostAndFound(resource, userId);

    if (!isLostAndFound && (await hasConflict(resource.path, userId))) {
      continue;
    }

    const lostAndFound = isLostAndFound
      ? await findOrCreateLostAndFound(userId)
      : null;

    const newBasePath = isLostAndFound
      ? normalizeSlashes(`${lostAndFound!.path}/${resource.name}`)
      : resource.path;

    const newParentId = (
      isLostAndFound ? lostAndFound!._id : resource.parent
    ) as PrimaryId;

    const updates = await buildRestoreUpdates({
      resource,
      userId,
      newBasePath,
      newParentId,
    });

    await ResourceModel.bulkWrite(updates);
  }

  return { message: 'All possible resources restored from trash' };
};
