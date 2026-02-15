import ResourceType from '../../constants/types/resourceType.js';
import { PrimaryId } from '../../constants/ids.js';
import ResourceModel from '../../models/resource.model.js';
import appAssert from '../../utils/appAssert.js';
import { CONFLICT, NOT_FOUND } from '../../constants/http.js';
import { normalizeSlashes } from './utils/normalizeSlashes.js';

export type CreateResourceParams = {
  name: string;
  type: ResourceType;
  path: string;
  fileUrl?: string;
  contentType?: string;
};

export const createResource = async (
  data: CreateResourceParams,
  userId: PrimaryId
) => {
  const { name, type, path, fileUrl, contentType } = data;
  const parentPath = decodeURIComponent(path);
  const fullPath = normalizeSlashes(`${parentPath}/${name}`);

  const parentFolder = await ResourceModel.findOne({
    path: parentPath,
    type: ResourceType.Folder,
    userId,
    deleted: false,
  });

  appAssert(parentFolder, NOT_FOUND, 'Parent folder not found');

  const alreadyExists = await ResourceModel.findOne({
    name,
    path: fullPath,
    userId,
    deleted: false,
  });

  appAssert(
    !alreadyExists,
    CONFLICT,
    `A ${alreadyExists?.type === 'file' ? 'file' : 'folder'} with this name already exists`
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
