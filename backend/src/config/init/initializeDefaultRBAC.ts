import RoleModel from "../../models/role.model";
import RoleType from "../../constants/enums/roleType";
import UserModel from "../../models/user.model";
import {
  ADMIN_DATE_OF_BIRTH,
  ADMIN_EMAIL,
  ADMIN_FIRSTNAME,
  ADMIN_GENDER,
  ADMIN_LASTNAME,
  ADMIN_PASSWORD,
} from "../../constants/env";
import UserRoleModel from "../../models/user-role.model";
import ResourceModel from "../../models/resource.model";
import ResourceType from "../../constants/enums/resourceType";

const initializeDefaultRBAC = async () => {
  try {
    console.log("🔐 Initializing default RBAC...");

    let userRole = await RoleModel.findOne({ type: RoleType.User });
    if (!userRole) {
      userRole = await RoleModel.create({
        type: RoleType.User,
        description: "This is the role assigned to user",
      });
      console.log("✅ Created User role");
    } else {
      console.log("ℹ️  User role already exists");
    }

    let adminRole = await RoleModel.findOne({ type: RoleType.Admin });
    if (!adminRole) {
      adminRole = await RoleModel.create({
        type: RoleType.Admin,
        description: "This is the role assigned to admin",
      });
      console.log("✅ Created Admin role");
    } else {
      console.log("ℹ️  Admin role already exists");
    }

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
      console.log("✅ Created admin user");
    } else {
      console.log("ℹ️  Admin user already exists");
    }

    const adminId = admin._id;

    const adminUserRole = await UserRoleModel.findOne({
      userId: adminId,
      roleId: adminRole._id,
    });

    if (!adminUserRole) {
      await UserRoleModel.create({
        userId: adminId,
        roleId: adminRole._id,
      });
      console.log("✅ Assigned Admin role to admin user");
    }

    const adminHasUserRole = await UserRoleModel.findOne({
      userId: adminId,
      roleId: userRole._id,
    });

    if (!adminHasUserRole) {
      await UserRoleModel.create({
        userId: adminId,
        roleId: userRole._id,
      });
      console.log("✅ Also assigned User role to admin user");
    }

    const adminFolder = await ResourceModel.findOne({
      userId: adminId,
      name: "my-files",
      type: ResourceType.Folder,
    });

    if (!adminFolder) {
      await ResourceModel.create({
        name: "my-files",
        type: ResourceType.Folder,
        path: "my-files",
        parent: null,
        userId: adminId,
        pinned: true,
      });
      console.log("✅ Created root resource folder for admin");
    } else {
      console.log("ℹ️  Resource folder already exists");
    }

    console.log("🎉 Default RBAC initialized successfully.");
  } catch (error) {
    console.error(
      "❌ Error while initializing default RBAC configuration:",
      error,
    );
    process.exit(1);
  }
};

export default initializeDefaultRBAC;
