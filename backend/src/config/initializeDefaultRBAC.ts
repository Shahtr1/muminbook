import RoleModel from "../models/role.model";
import RoleType from "../constants/enums/roleType";
import UserModel from "../models/user.model";
import {
  ADMIN_DATE_OF_BIRTH,
  ADMIN_EMAIL,
  ADMIN_FIRSTNAME,
  ADMIN_GENDER,
  ADMIN_LASTNAME,
  ADMIN_PASSWORD,
} from "../constants/env";
import UserRoleModel from "../models/user-role.model";
import ResourceModel from "../models/resource.model";
import ResourceType from "../constants/enums/resourceType";

const initializeDefaultRBAC = async () => {
  try {
    let userRole = await RoleModel.findOne({ type: RoleType.User });
    if (!userRole) {
      userRole = await RoleModel.create({
        type: RoleType.User,
        description: "This is the role assigned to user",
      });
    }

    const userRoleId = userRole._id;

    let adminRole = await RoleModel.findOne({ type: RoleType.Admin });
    if (!adminRole) {
      adminRole = await RoleModel.create({
        type: RoleType.Admin,
        description: "This is the role assigned to admin",
      });
    }
    const adminRoleId = adminRole._id;

    let admin = await UserModel.findOne({ email: ADMIN_EMAIL });
    if (!admin) {
      admin = await UserModel.create({
        firstname: ADMIN_FIRSTNAME,
        lastname: ADMIN_LASTNAME,
        dateOfBirth: ADMIN_DATE_OF_BIRTH,
        gender: ADMIN_GENDER,
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        verified: true,
      });
    }
    const adminId = admin._id;

    const existingAdminRole = await UserRoleModel.findOne({
      userId: adminId,
      roleId: adminRoleId,
    });

    if (!existingAdminRole) {
      await UserRoleModel.create({
        userId: adminId,
        roleId: adminRoleId,
      });
    }

    const existingUserRoleForAdmin = await UserRoleModel.findOne({
      userId: adminId,
      roleId: userRoleId,
    });

    if (!existingUserRoleForAdmin) {
      await UserRoleModel.create({
        userId: adminId,
        roleId: userRoleId,
      });
    }

    const existingResourceForAdmin = await ResourceModel.findOne({
      userId: adminId,
      name: "my-files",
      type: ResourceType.Folder,
    });

    if (!existingResourceForAdmin) {
      await ResourceModel.create({
        name: "my-files",
        type: ResourceType.Folder,
        path: "my-files",
        parent: null,
        userId: adminId,
        pinned: true,
      });
    }
  } catch (error) {
    console.log("Error while initializing default RBAC configuration", error);
    process.exit(1);
  }
};

export default initializeDefaultRBAC;
