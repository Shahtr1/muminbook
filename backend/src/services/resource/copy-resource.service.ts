import { PrimaryId } from "../../constants/primaryId";
import ResourceModel from "../../models/resource.model";
import appAssert from "../../utils/appAssert";
import { NOT_FOUND } from "../../constants/http";
import ResourceType from "../../constants/resourceType";
import {
  buildClonedDescendants,
  buildClonedRootResource,
  generateCopyName,
} from "../../utils/resource-helpers/copyHelpers";
import {
  assertNotRootFolder,
  getAllDescendants,
} from "./common-resource.service";

export const copyResource = async (
  resourceId: PrimaryId,
  destinationPath: string,
  userId: PrimaryId,
) => {
  const resource = await ResourceModel.findOne({ _id: resourceId, userId });
  appAssert(resource, NOT_FOUND, "Resource not found");
  assertNotRootFolder(resource, "Cannot copy root folder");

  const destinationFolder = await ResourceModel.findOne({
    path: destinationPath,
    type: ResourceType.Folder,
    userId,
    deleted: false,
  });
  appAssert(destinationFolder, NOT_FOUND, "Destination folder not found");

  const copyName = await generateCopyName(
    resource.name,
    destinationPath,
    userId,
  );
  const baseNewPath = `${destinationPath}/${copyName}`.replace(/\/+/g, "/");

  const ops: any[] = [];

  const { newId: rootNewId, op: rootInsertOp } = buildClonedRootResource(
    resource,
    copyName,
    baseNewPath,
    destinationFolder._id as PrimaryId,
    userId,
  );
  ops.push(rootInsertOp);

  if (resource.type === ResourceType.Folder) {
    const descendants = await getAllDescendants(resource.path, userId, false);
    const descendantOps = buildClonedDescendants(
      descendants,
      resource.path,
      baseNewPath,
      userId,
      destinationFolder._id as PrimaryId,
      rootNewId as PrimaryId,
    );
    ops.push(...descendantOps);
  }

  await ResourceModel.bulkWrite(ops);
  return { message: "Copied successfully" };
};
