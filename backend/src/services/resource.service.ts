import ResourceType from "../constants/resourceType";
import { CONFLICT, NOT_FOUND } from "../constants/http";
import appAssert from "../utils/appAssert";
import ResourceModel from "../models/resource.model";
import { PrimaryId } from "../constants/primaryId";

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

  if (resource.type === "folder") {
    await deleteResourceTree(resource._id as PrimaryId, userId);
  }

  await ResourceModel.deleteOne({ _id: resource._id });
};

const deleteResourceTree = async (parentId: PrimaryId, userId: PrimaryId) => {
  const children = await ResourceModel.find({ parent: parentId, userId });

  for (const child of children) {
    if (child.type === "folder") {
      await deleteResourceTree(child._id as PrimaryId, userId);
    }
    await ResourceModel.deleteOne({ _id: child._id });
  }
};
