import ResourceType from "../../constants/resourceType";
import { PrimaryId } from "../../constants/primaryId";
import ResourceModel from "../../models/resource.model";
import appAssert from "../../utils/appAssert";
import { BAD_REQUEST, CONFLICT, NOT_FOUND } from "../../constants/http";

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

  // Prevent creating inside trashed folder
  appAssert(
    !parentFolder.deleted,
    BAD_REQUEST,
    "Cannot create inside a trashed folder",
  );

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
