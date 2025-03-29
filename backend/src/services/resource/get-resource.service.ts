import { PrimaryId } from "../../constants/primaryId";
import ResourceModel from "../../models/resource.model";
import ResourceType from "../../constants/resourceType";
import appAssert from "../../utils/appAssert";
import { NOT_FOUND } from "../../constants/http";

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
