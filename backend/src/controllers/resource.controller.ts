import catchErrors from "../utils/catchErrors";
import UserModel from "../models/user.model";
import appAssert from "../utils/appAssert";
import { NOT_FOUND, OK } from "../constants/http";
import { assertUserAndSession } from "../utils/assertUserRoleSession";
import ResourceType from "../constants/resourceType";
import ResourceModel from "../models/resource.model";

export const getResourceHandler = catchErrors(async (req, res) => {
  assertUserAndSession(req);

  const user = await UserModel.findById(req.userId);
  appAssert(user, NOT_FOUND, "User not found");

  const userId = user._id;

  const folderPath = (req.query.path as string) || "my-files";

  const folder = await ResourceModel.findOne({
    path: folderPath,
    type: ResourceType.Folder,
    userId: userId,
  });

  appAssert(folder, NOT_FOUND, "Folder not found");

  const children = await ResourceModel.find({
    parent: folder._id,
    userId: userId,
  });

  const response = children.map((child) => ({
    _id: child._id,
    name: child.name,
    type: child.type,
  }));

  return res.status(OK).json(response);
});
