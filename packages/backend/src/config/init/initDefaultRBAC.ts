import RoleModel from '../../models/role.model';
import RoleType from '../../constants/types/roleType';
import UserModel from '../../models/user.model';
import {
  ADMIN_DATE_OF_BIRTH,
  ADMIN_EMAIL,
  ADMIN_FIRSTNAME,
  ADMIN_GENDER,
  ADMIN_LASTNAME,
  ADMIN_PASSWORD,
  NODE_ENV,
} from '../../constants/env';
import UserRoleModel from '../../models/user-role.model';
import ResourceModel from '../../models/resource.model';
import ResourceType from '../../constants/types/resourceType';
import { log } from '../../utils/log';

const ensureRole = async (type: RoleType, description: string) => {
  let role = await RoleModel.findOne({ type });
  if (!role) {
    role = await RoleModel.create({ type, description });
    log.success(`${type} role created`);
  } else {
    log.info(`${type} role already exists`);
  }
  return role;
};

const ensureAdminUser = async () => {
  const email = NODE_ENV === 'test' ? 'admin.e2e@muminbook.com' : ADMIN_EMAIL;

  const password = NODE_ENV === 'test' ? 'E2ETestPassword123!' : ADMIN_PASSWORD;

  let admin = await UserModel.findOne({ email });

  if (!admin) {
    admin = await UserModel.create({
      firstname: ADMIN_FIRSTNAME,
      lastname: ADMIN_LASTNAME,
      dateOfBirth: ADMIN_DATE_OF_BIRTH,
      gender: ADMIN_GENDER,
      email,
      password,
      verified: true,
    });
    log.success('Admin user created');
  } else {
    log.info('Admin user already exists');
  }

  return admin;
};

const assignRoleToUserIfMissing = async (
  userId: unknown,
  roleId: unknown,
  messageOnAssign: string
) => {
  const exists = await UserRoleModel.findOne({ userId, roleId });
  if (!exists) {
    await UserRoleModel.create({ userId, roleId });
    log.success(messageOnAssign);
  }
};

const ensureAdminFolder = async (adminId: unknown) => {
  const folder = await ResourceModel.findOne({
    userId: adminId,
    name: 'my-files',
    type: ResourceType.Folder,
  });

  if (!folder) {
    await ResourceModel.create({
      name: 'my-files',
      type: ResourceType.Folder,
      path: 'my-files',
      parent: null,
      userId: adminId,
      pinned: true,
    });
    log.success('Root resource folder for admin created');
  } else {
    log.info('Resource folder already exists');
  }
};

const initDefaultRBAC = async (): Promise<void> => {
  try {
    log.debug('🔐 Initializing default RBAC...');

    const userRole = await ensureRole(
      RoleType.User,
      'This is the role assigned to user'
    );
    const adminRole = await ensureRole(
      RoleType.Admin,
      'This is the role assigned to admin'
    );

    const admin = await ensureAdminUser();
    const adminId = admin._id;

    await assignRoleToUserIfMissing(
      adminId,
      adminRole._id,
      'Assigned Admin role to admin user'
    );
    await assignRoleToUserIfMissing(
      adminId,
      userRole._id,
      'Also assigned User role to admin user'
    );

    await ensureAdminFolder(adminId);

    log.success('Default RBAC initialized successfully.');
  } catch (error) {
    log.error('Error while initializing default RBAC configuration:', error);
    process.exit(1);
  }
};

export default initDefaultRBAC;
