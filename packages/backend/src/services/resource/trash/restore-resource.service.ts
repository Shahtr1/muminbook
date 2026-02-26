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
import { BAD_REQUEST, NOT_FOUND } from '../../../constants/http.js';
import { findOrCreateLostAndFound } from '../utils/findOrCreateLostAndFound.js';
import { findDescendantsByPath } from '../common-resource.service.js';
import { normalizeSlashes } from '../utils/normalizeSlashes.js';

const MAX_NAME_LENGTH = 100;

const hasConflict = async (path: string, userId: PrimaryId) => {
  return ResourceModel.findOne({
    path,
    userId,
    deleted: false,
  });
};

const withIndexedPrefix = (name: string, index: number) => {
  const prefix = `(${index}) `;
  const maxBaseLength = Math.max(1, MAX_NAME_LENGTH - prefix.length);
  const base = name.slice(0, maxBaseLength).trimEnd();
  return `${prefix}${base}`;
};

const getParentPath = (path: string) => path.split('/').slice(0, -1).join('/');

const getNextRestoreName = async (
  originalName: string,
  parentPath: string,
  userId: PrimaryId
) => {
  const originalPath = normalizeSlashes(`${parentPath}/${originalName}`);
  const hasOriginalConflict = await hasConflict(originalPath, userId);
  if (!hasOriginalConflict) return originalName;

  const escapedParentPath = parentPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const siblings = await ResourceModel.find({
    userId,
    deleted: false,
    path: new RegExp(`^${escapedParentPath}/[^/]+$`),
  }).select('name');

  const siblingNames = new Set(siblings.map((s: any) => s.name));
  let maxIndex = 0;

  for (const name of siblingNames) {
    if (name === originalName) {
      maxIndex = Math.max(maxIndex, 0);
      continue;
    }

    const match = name.match(/^\((\d+)\)\s+(.+)$/);
    if (!match) continue;

    const index = Number(match[1]);
    if (Number.isNaN(index) || index < 1) continue;

    if (withIndexedPrefix(originalName, index) === name) {
      maxIndex = Math.max(maxIndex, index);
    }
  }

  let index = maxIndex + 1;
  while (true) {
    const candidateName = withIndexedPrefix(originalName, index);
    const candidatePath = normalizeSlashes(`${parentPath}/${candidateName}`);
    const conflict = await hasConflict(candidatePath, userId);
    if (!conflict) return candidateName;
    index++;
  }
};

const shouldRestoreAsLostAndFound = async (
  resource: any,
  userId: PrimaryId
) => {
  const parentPath = getParentPath(resource.path);

  const parentFolder = await ResourceModel.findOne({
    path: parentPath,
    type: ResourceType.Folder,
    userId,
    deleted: false,
  });

  return !parentFolder;
};

const restoreDeletedParentChainIfNeeded = async (
  resource: any,
  userId: PrimaryId
) => {
  const updates: any[] = [];
  let parentPath = getParentPath(resource.path);

  while (parentPath) {
    const parentFolder = await ResourceModel.findOne({
      path: parentPath,
      type: ResourceType.Folder,
      userId,
    });

    if (!parentFolder || !parentFolder.deleted) break;

    updates.push({
      updateOne: {
        filter: { _id: parentFolder._id },
        update: { $set: { deleted: false, deletedAt: null } },
      },
    });

    parentPath = parentPath.split('/').slice(0, -1).join('/');
  }

  if (updates.length > 0) {
    await ResourceModel.bulkWrite(updates);
  }
};

const buildRestoreUpdates = async ({
  resource,
  userId,
  newBasePath,
  newParentId,
  newName,
}: {
  resource: any;
  userId: PrimaryId;
  newBasePath: string;
  newParentId: PrimaryId;
  newName?: string;
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
          ...(newName ? { name: newName } : {}),
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

  // If parent folder exists but is soft-deleted, restore parent chain first.
  await restoreDeletedParentChainIfNeeded(resource, userId);

  if (await shouldRestoreAsLostAndFound(resource, userId)) {
    const lostAndFound = await findOrCreateLostAndFound(userId);
    let restoredName = resource.name;
    let newBasePath = normalizeSlashes(`${lostAndFound.path}/${restoredName}`);
    let index = 1;

    while (await hasConflict(newBasePath, userId)) {
      restoredName = withIndexedPrefix(resource.name, index);
      newBasePath = normalizeSlashes(`${lostAndFound.path}/${restoredName}`);
      index++;
    }

    const updates = await buildRestoreUpdates({
      resource,
      userId,
      newBasePath,
      newParentId: lostAndFound._id as PrimaryId,
      newName: restoredName !== resource.name ? restoredName : undefined,
    });

    await ResourceModel.bulkWrite(updates);
    return { message: 'Restored to lost+found' };
  }

  const parentPath = getParentPath(resource.path);
  const restoredName = await getNextRestoreName(
    resource.name,
    parentPath,
    userId
  );
  const restoredPath = normalizeSlashes(`${parentPath}/${restoredName}`);

  const updates = await buildRestoreUpdates({
    resource,
    userId,
    newBasePath: restoredPath,
    newParentId: resource.parent as PrimaryId,
    newName: restoredName !== resource.name ? restoredName : undefined,
  });

  await ResourceModel.bulkWrite(updates);
  return { message: 'Restored successfully' };
};

export const restoreAllResources = async (userId: PrimaryId) => {
  const resources = await ResourceModel.find({ userId, deleted: true });
  if (resources.length === 0) {
    return { message: 'All possible resources restored from trash' };
  }

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
