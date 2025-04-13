import ResourceModel from "../../../models/resource.model";
import ResourceType from "../../../constants/enums/resourceType";
import { PrimaryId } from "../../../constants/primaryId";
import appAssert from "../../../utils/appAssert";
import { BAD_REQUEST, CONFLICT, NOT_FOUND } from "../../../constants/http";
import { getOrCreateLostAndFound } from "../../../utils/resource-helpers/getOrCreateLostAndFound";
import { getAllDescendants } from "../common-resource.service";

const hasConflict = async (path: string, userId: PrimaryId) => {
  return ResourceModel.findOne({
    path,
    userId,
    deleted: false,
  });
};

const shouldRestoreAsLostAndFound = async (
  resource: any,
  userId: PrimaryId,
) => {
  const parentPath = resource.path.split("/").slice(0, -1).join("/");

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
      ? await getAllDescendants(resource.path, userId, true)
      : [];

  for (const desc of descendants) {
    const relativePath = desc.path.replace(resource.path, "");
    const newPath = `${newBasePath}${relativePath}`.replace(/\/+/g, "/");

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
  userId: PrimaryId,
) => {
  const resource = await ResourceModel.findOne({ _id: resourceId, userId });
  appAssert(resource, NOT_FOUND, "Resource not found");
  appAssert(resource.deleted, BAD_REQUEST, "Resource is not in trash");

  if (await shouldRestoreAsLostAndFound(resource, userId)) {
    const lostAndFound = await getOrCreateLostAndFound(userId);
    const newBasePath = `${lostAndFound.path}/${resource.name}`.replace(
      /\/+/g,
      "/",
    );
    const updates = await buildRestoreUpdates({
      resource,
      userId,
      newBasePath,
      newParentId: lostAndFound._id as PrimaryId,
    });

    await ResourceModel.bulkWrite(updates);
    return { message: "Restored to lost+found" };
  }

  if (await hasConflict(resource.path, userId)) {
    const conflict = await hasConflict(resource.path, userId);
    appAssert(
      !conflict,
      CONFLICT,
      `A ${conflict?.type === "file" ? "file" : "folder"} with this name already exists in the destination path`,
    );
  }

  const updates = await buildRestoreUpdates({
    resource,
    userId,
    newBasePath: resource.path,
    newParentId: resource.parent as PrimaryId,
  });

  await ResourceModel.bulkWrite(updates);
  return { message: "Restored successfully" };
};

export const restoreAllResources = async (userId: PrimaryId) => {
  const resources = await ResourceModel.find({ userId, deleted: true });
  appAssert(resources.length > 0, NOT_FOUND, "No trashed resources found");

  for (const resource of resources) {
    const isLostAndFound = await shouldRestoreAsLostAndFound(resource, userId);

    if (!isLostAndFound && (await hasConflict(resource.path, userId))) {
      continue;
    }

    const lostAndFound = isLostAndFound
      ? await getOrCreateLostAndFound(userId)
      : null;

    const newBasePath = isLostAndFound
      ? `${lostAndFound!.path}/${resource.name}`.replace(/\/+/g, "/")
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

  return { message: "All possible resources restored from trash" };
};
