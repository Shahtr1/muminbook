import ResourceModel from "../../../models/resource.model";
import ResourceType from "../../../constants/resourceType";
import { PrimaryId } from "../../../constants/primaryId";
import appAssert from "../../../utils/appAssert";
import { BAD_REQUEST, NOT_FOUND } from "../../../constants/http";
import { getOrCreateLostAndFound } from "../../../utils/resource-helpers/getOrCreateLostAndFound";
import { getAllDescendants } from "../common-resource.service";

const restoreAsLostAndFound = async (resource: any, userId: PrimaryId) => {
  const lostAndFound = await getOrCreateLostAndFound(userId);
  const newBasePath = `${lostAndFound.path}/${resource.name}`.replace(
    /\/+/g,
    "/",
  );

  const updates: any[] = [];

  const descendants =
    resource.type === ResourceType.Folder
      ? await getAllDescendants(resource.path, userId, true)
      : [];

  // Descendants
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

  // Root resource
  updates.push({
    updateOne: {
      filter: { _id: resource._id },
      update: {
        $set: {
          deleted: false,
          deletedAt: null,
          path: newBasePath,
          parent: lostAndFound._id,
        },
      },
    },
  });

  await ResourceModel.bulkWrite(updates);
  return { message: "Restored to lost+found" };
};

const restoreNormally = async (resource: any, userId: PrimaryId) => {
  const updates: any[] = [];

  if (resource.type === ResourceType.Folder) {
    const descendants = await getAllDescendants(resource.path, userId, true);
    updates.push(
      ...descendants.map((desc) => ({
        updateOne: {
          filter: { _id: desc._id },
          update: { $set: { deleted: false, deletedAt: null } },
        },
      })),
    );
  }

  updates.push({
    updateOne: {
      filter: { _id: resource._id },
      update: { $set: { deleted: false, deletedAt: null } },
    },
  });

  await ResourceModel.bulkWrite(updates);
  return { message: "Restored successfully" };
};

export const restoreResource = async (
  resourceId: PrimaryId,
  userId: PrimaryId,
) => {
  const resource = await ResourceModel.findOne({ _id: resourceId, userId });
  appAssert(resource, NOT_FOUND, "Resource not found");
  appAssert(resource.deleted, BAD_REQUEST, "Resource is not in trash");

  const parentPath = resource.path.split("/").slice(0, -1).join("/");

  const parentFolder = await ResourceModel.findOne({
    path: parentPath,
    type: ResourceType.Folder,
    userId,
    deleted: false,
  });

  if (!parentFolder) {
    return await restoreAsLostAndFound(resource, userId);
  }

  return await restoreNormally(resource, userId);
};
