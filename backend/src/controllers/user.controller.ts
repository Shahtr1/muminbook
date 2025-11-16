import catchErrors from "../utils/catchErrors";
import UserModel from "../models/user.model";
import appAssert from "../utils/appAssert";
import { NOT_FOUND, OK } from "../constants/http";
import { assertUserAndSession } from "../utils/assertUserRoleSession";
import UserRoleModel from "../models/user-role.model";
import { RoleDocument } from "../models/role.model";

export const getUserHandler = catchErrors(async (req, res) => {
  assertUserAndSession(req);

  const user = await UserModel.findById(req.userId);
  appAssert(user, NOT_FOUND, "User not found");

  const userId = user._id;

  const userRoles = await UserRoleModel.find({ userId }).populate<{
    roleId: RoleDocument;
  }>("roleId");

  appAssert(userRoles.length > 0, NOT_FOUND, "User has no assigned roles");

  const roles = userRoles
    .map((userRole) => userRole.roleId?.type)
    .filter(Boolean);

  return res.status(OK).json({ ...user.omitPassword(), roles });
});
