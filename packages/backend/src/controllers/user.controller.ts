import catchErrors from '../utils/catchErrors.js';
import UserModel from '../models/user.model.js';
import appAssert from '../utils/appAssert.js';
import { NOT_FOUND, OK } from '../constants/http.js';
import UserRoleModel from '../models/user-role.model.js';
import { RoleDocument } from '../models/role.model.js';

export const getUserHandler = catchErrors(async (req, res) => {
  const user = await UserModel.findById(req.userId);
  appAssert(user, NOT_FOUND, 'User not found');

  const userId = user._id;

  const userRoles = await UserRoleModel.find({ userId }).populate<{
    roleId: RoleDocument;
  }>('roleId');

  appAssert(userRoles.length > 0, NOT_FOUND, 'User has no assigned roles');

  const roles = userRoles
    .map((userRole) => userRole.roleId?.type)
    .filter(Boolean);

  return res.status(OK).json({ ...user.omitPassword(), roles });
});
