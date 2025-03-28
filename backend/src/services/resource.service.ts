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

export const deleteResource = async (
  resourceId: PrimaryId,
  userId: PrimaryId,
) => {
  const resource = await ResourceModel.findOne({
    _id: resourceId,
    userId,
  });

  appAssert(resource, NOT_FOUND, "Resource not found");

  const isRootFolder = resource.path === "my-files" || resource.parent === null;
  appAssert(!isRootFolder, BAD_REQUEST, "Cannot delete root folder");

  if (resource.type === ResourceType.Folder) {
    await deleteResourceTree(resource._id as PrimaryId, userId);
  }

  await ResourceModel.deleteOne({ _id: resource._id });
};

const deleteResourceTree = async (parentId: PrimaryId, userId: PrimaryId) => {
  const children = await ResourceModel.find({ parent: parentId, userId });

  for (const child of children) {
    if (child.type === ResourceType.Folder) {
      await deleteResourceTree(child._id as PrimaryId, userId);
    }
    await ResourceModel.deleteOne({ _id: child._id });
  }
};

export const moveToTrashResource = async (
  resourceId: PrimaryId,
  userId: PrimaryId,
) => {
  const resource = await ResourceModel.findOne({
    _id: resourceId,
    userId,
  });

  appAssert(resource, NOT_FOUND, "Resource not found");

  const isRootFolder = resource.path === "my-files" || resource.parent === null;
  appAssert(!isRootFolder, BAD_REQUEST, "Cannot delete root folder");

  if (resource.type === ResourceType.Folder) {
    await markResourceTreeDeleted(resource._id as PrimaryId, userId);
  }

  await ResourceModel.findByIdAndUpdate(resource._id, {
    deleted: true,
    deletedAt: new Date(),
  });
};

const markResourceTreeDeleted = async (
  parentId: PrimaryId,
  userId: PrimaryId,
) => {
  const children = await ResourceModel.find({ parent: parentId, userId });

  for (const child of children) {
    if (child.type === ResourceType.Folder) {
      await markResourceTreeDeleted(child._id as PrimaryId, userId);
    }

    await ResourceModel.findByIdAndUpdate(child._id, {
      deleted: true,
      deletedAt: new Date(),
    });
  }
};

export const restoreResource = async (
  resourceId: PrimaryId,
  userId: PrimaryId,
) => {
  const resource = await ResourceModel.findOne({
    _id: resourceId,
    userId,
  });

  appAssert(resource, NOT_FOUND, "Resource not found");
  appAssert(resource.deleted, BAD_REQUEST, "Resource is not in trash");

  if (resource.type === ResourceType.Folder) {
    await restoreResourceTree(resource._id as PrimaryId, userId);
  }

  await ResourceModel.findByIdAndUpdate(resource._id, {
    deleted: false,
    deletedAt: null,
  });
};

const restoreResourceTree = async (parentId: PrimaryId, userId: PrimaryId) => {
  const children = await ResourceModel.find({ parent: parentId, userId });

  for (const child of children) {
    if (child.type === ResourceType.Folder) {
      await restoreResourceTree(child._id as PrimaryId, userId);
    }

    await ResourceModel.findByIdAndUpdate(child._id, {
      deleted: false,
      deletedAt: null,
    });
  }
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
  const trashed = await ResourceModel.find({
    userId,
    deleted: true,
  });

  for (const resource of trashed) {
    if (resource.type === ResourceType.Folder) {
      await deleteResourceTree(resource._id as PrimaryId, userId);
    }
    await ResourceModel.deleteOne({ _id: resource._id });
  }
};

export const permanentlyDeleteTrashedResourcesforJob =
  async (): Promise<number> => {
    const trashed = await ResourceModel.find({
      deleted: true,
      deletedAt: { $lte: thirtyDaysAgo() },
    });

    for (const resource of trashed) {
      if (resource.type === ResourceType.Folder) {
        await deleteResourceTree(resource._id as PrimaryId, resource.userId);
      }

      await ResourceModel.deleteOne({ _id: resource._id });
    }

    return trashed.length;
  };
