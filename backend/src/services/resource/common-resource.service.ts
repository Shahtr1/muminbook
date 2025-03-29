import { BAD_REQUEST } from "../../constants/http";
import appAssert from "../../utils/appAssert";
import ResourceModel, { ResourceDocument } from "../../models/resource.model";
import { PrimaryId } from "../../constants/primaryId";

export const assertNotRootFolder = (
  resource: ResourceDocument,
  message = "Cannot modify root folder",
) => {
  const isRoot = resource.path === "my-files" || resource.parent === null;
  appAssert(!isRoot, BAD_REQUEST, message);
};

export const getAllDescendants = async (
  parentPath: string,
  userId: PrimaryId,
  includeDeleted = true,
) => {
  const escapedPath = parentPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const filter: any = {
    path: new RegExp(`^${escapedPath}/`),
    userId,
  };

  if (!includeDeleted) {
    filter.deleted = false;
  }

  return ResourceModel.find(filter);
};
