import ResourceType from "../constants/resourceType";
import { BAD_REQUEST, CONFLICT, NOT_FOUND } from "../constants/http";
import appAssert from "../utils/appAssert";
import ResourceModel from "../models/resource.model";
import { PrimaryId } from "../constants/primaryId";
import { thirtyDaysAgo } from "../utils/date";

export const getResourceChildren = async (
  folderPath: string,
  userId: PrimaryId,
) => {
  const path = folderPath || "my-files";

  const folder = await ResourceModel.findOne({
    path,
    type: ResourceType.Folder,
    userId,
    deleted: false,
  });

  appAssert(folder, NOT_FOUND, "Folder not found");

  const children = await ResourceModel.find({
    parent: folder._id,
    userId,
    deleted: false,
  });

  return children.map((child) => ({
    _id: child._id,
    name: child.name,
    type: child.type,
  }));
};

export type CreateResourceParams = {
  name: string;
  type: ResourceType;
  path: string;
  fileUrl?: string;
  contentType?: string;
};

export const createResource = async (
  data: CreateResourceParams,
  userId: PrimaryId,
) => {
  const { name, type, path, fileUrl, contentType } = data;
  const parentPath = path;
  const fullPath = `${path}/${name}`.replace(/\/+/g, "/");

  const parentFolder = await ResourceModel.findOne({
    path: parentPath,
    type: ResourceType.Folder,
    userId,
  });

  appAssert(parentFolder, NOT_FOUND, "Parent folder not found");

  const alreadyExists = await ResourceModel.findOne({
    name,
    path: fullPath,
    userId,
  });

  appAssert(
    !alreadyExists,
    CONFLICT,
    "A file or folder with this name already exists",
  );

  const resource = await ResourceModel.create({
    name,
    type,
    path: fullPath,
    parent: parentFolder._id,
    userId,
    fileUrl: type === ResourceType.File ? fileUrl : undefined,
    contentType: type === ResourceType.File ? contentType : undefined,
  });

  return {
    _id: resource._id,
    name: resource.name,
    type: resource.type,
    path: resource.path,
  };
};

const getAllDescendants = async (parentPath: string, userId: PrimaryId) => {
  return ResourceModel.find({
    path: new RegExp(`^${parentPath}/`),
    userId,
  });
};

export const deleteResource = async (
  resourceId: PrimaryId,
  userId: PrimaryId,
) => {
  const resource = await ResourceModel.findOne({ _id: resourceId, userId });
  appAssert(resource, NOT_FOUND, "Resource not found");

  const isRootFolder = resource.path === "my-files" || resource.parent === null;
  appAssert(!isRootFolder, BAD_REQUEST, "Cannot delete root folder");

  if (resource.type === ResourceType.Folder) {
    const descendants = await getAllDescendants(resource.path, userId);

    await ResourceModel.bulkWrite([
      ...descendants.map((child) => ({
        deleteOne: { filter: { _id: child._id } },
      })),
      { deleteOne: { filter: { _id: resource._id } } },
    ]);
  } else {
    await ResourceModel.deleteOne({ _id: resource._id });
  }
};

export const moveToTrashResource = async (
  resourceId: PrimaryId,
  userId: PrimaryId,
) => {
  const resource = await ResourceModel.findOne({ _id: resourceId, userId });
  appAssert(resource, NOT_FOUND, "Resource not found");

  const isRootFolder = resource.path === "my-files" || resource.parent === null;
  appAssert(!isRootFolder, BAD_REQUEST, "Cannot delete root folder");

  const updates: any[] = [];

  if (resource.type === ResourceType.Folder) {
    const descendants = await getAllDescendants(resource.path, userId);
    updates.push(
      ...descendants.map((child) => ({
        updateOne: {
          filter: { _id: child._id },
          update: { $set: { deleted: true, deletedAt: new Date() } },
        },
      })),
    );
  }

  updates.push({
    updateOne: {
      filter: { _id: resource._id },
      update: { $set: { deleted: true, deletedAt: new Date() } },
    },
  });

  await ResourceModel.bulkWrite(updates);
};

export const restoreResource = async (
  resourceId: PrimaryId,
  userId: PrimaryId,
) => {
  const resource = await ResourceModel.findOne({ _id: resourceId, userId });
  appAssert(resource, NOT_FOUND, "Resource not found");
  appAssert(resource.deleted, BAD_REQUEST, "Resource is not in trash");

  const updates: any[] = [];

  if (resource.type === ResourceType.Folder) {
    const descendants = await getAllDescendants(resource.path, userId);
    updates.push(
      ...descendants.map((child) => ({
        updateOne: {
          filter: { _id: child._id },
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
};

export const getTrashedResources = async (userId: PrimaryId) => {
  const resources = await ResourceModel.find({
    userId,
    deleted: true,
  }).sort({ deletedAt: -1 });

  return resources.map((r: any) => ({
    _id: r._id,
    name: r.name,
    type: r.type,
    path: r.path,
    deletedAt: r.deletedAt,
  }));
};

export const permanentlyDeleteTrashedResources = async (userId: PrimaryId) => {
  const trashed = await ResourceModel.find({ userId, deleted: true });

  const deletes = trashed.map((r) => ({
    deleteOne: { filter: { _id: r._id } },
  }));

  await ResourceModel.bulkWrite(deletes);
};

export const permanentlyDeleteTrashedResourcesForJob =
  async (): Promise<number> => {
    const trashed = await ResourceModel.find({
      deleted: true,
      deletedAt: { $lte: thirtyDaysAgo() },
    });

    const deletes = trashed.map((r) => ({
      deleteOne: { filter: { _id: r._id } },
    }));

    await ResourceModel.bulkWrite(deletes);

    return trashed.length;
  };
