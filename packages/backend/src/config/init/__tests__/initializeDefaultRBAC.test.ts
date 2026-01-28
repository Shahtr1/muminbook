/**
 * @fileoverview Test Suite for Default RBAC Initialization
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Types } from 'mongoose';

/* ------------------ MOCK LOGGER ------------------ */

vi.mock('../../../utils/log', () => ({
  log: {
    info: vi.fn(),
    success: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
  },
}));

/* ------------------ MOCK MODELS ------------------ */

vi.mock('../../../models/role.model', () => ({
  default: {
    findOne: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('../../../models/user.model', () => ({
  default: {
    findOne: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('../../../models/user-role.model', () => ({
  default: {
    findOne: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('../../../models/resource.model', () => ({
  default: {
    findOne: vi.fn(),
    create: vi.fn(),
  },
}));

/* ------------------ MOCK ENV ------------------ */

vi.mock('../../../constants/env', () => ({
  ADMIN_FIRSTNAME: 'TestAdmin',
  ADMIN_LASTNAME: 'User',
  ADMIN_DATE_OF_BIRTH: '1990-01-01',
  ADMIN_GENDER: 'male',
  ADMIN_EMAIL: 'admin@test.com',
  ADMIN_PASSWORD: 'SecurePassword123!',
}));

/* ------------------ IMPORTS AFTER MOCKS ------------------ */

import initDefaultRBAC from '../initDefaultRBAC';
import RoleModel from '../../../models/role.model';
import UserModel from '../../../models/user.model';
import UserRoleModel from '../../../models/user-role.model';
import ResourceModel from '../../../models/resource.model';
import RoleType from '../../../constants/types/roleType';
import ResourceType from '../../../constants/types/resourceType';
import { log } from '../../../utils/log';

/* ========================================================= */

describe('initDefaultRBAC', () => {
  let processExitSpy: any;

  const expectSuccess = (msg: string) =>
    expect(log.success).toHaveBeenCalledWith(msg);

  const expectInfo = (msg: string) =>
    expect(log.info).toHaveBeenCalledWith(msg);

  const expectError = (msg: string, err: unknown) =>
    expect(log.error).toHaveBeenCalledWith(msg, err);

  beforeEach(() => {
    vi.clearAllMocks();
    processExitSpy = vi
      .spyOn(process, 'exit')
      .mockImplementation((() => {}) as any);
  });

  afterEach(() => {
    processExitSpy.mockRestore();
  });

  /* ========================================================= */
  /* SUCCESSFUL INITIALIZATION */
  /* ========================================================= */

  it('should create everything when nothing exists', async () => {
    const userRoleId = new Types.ObjectId();
    const adminRoleId = new Types.ObjectId();
    const adminUserId = new Types.ObjectId();

    vi.mocked(RoleModel.findOne)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    vi.mocked(RoleModel.create)
      .mockResolvedValueOnce({ _id: userRoleId } as any)
      .mockResolvedValueOnce({ _id: adminRoleId } as any);

    vi.mocked(UserModel.findOne).mockResolvedValueOnce(null);
    vi.mocked(UserModel.create).mockResolvedValueOnce({
      _id: adminUserId,
    } as any);

    vi.mocked(UserRoleModel.findOne)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    vi.mocked(UserRoleModel.create)
      .mockResolvedValueOnce({} as any)
      .mockResolvedValueOnce({} as any);

    vi.mocked(ResourceModel.findOne).mockResolvedValueOnce(null);
    vi.mocked(ResourceModel.create).mockResolvedValueOnce({} as any);

    await initDefaultRBAC();

    expect(RoleModel.create).toHaveBeenCalledTimes(2);
    expect(UserModel.create).toHaveBeenCalledTimes(1);
    expect(UserRoleModel.create).toHaveBeenCalledTimes(2);
    expect(ResourceModel.create).toHaveBeenCalledTimes(1);

    expectSuccess(`${RoleType.User} role created`);
    expectSuccess(`${RoleType.Admin} role created`);
    expectSuccess('Admin user created');
    expectSuccess('Assigned Admin role to admin user');
    expectSuccess('Also assigned User role to admin user');
    expectSuccess('Root resource folder for admin created');
    expectSuccess('Default RBAC initialized successfully.');
  });

  /* ========================================================= */
  /* IDEMPOTENT */
  /* ========================================================= */

  it('should skip everything if already exists', async () => {
    const userRoleId = new Types.ObjectId();
    const adminRoleId = new Types.ObjectId();
    const adminUserId = new Types.ObjectId();

    vi.mocked(RoleModel.findOne)
      .mockResolvedValueOnce({ _id: userRoleId } as any)
      .mockResolvedValueOnce({ _id: adminRoleId } as any);

    vi.mocked(UserModel.findOne).mockResolvedValueOnce({
      _id: adminUserId,
    } as any);

    vi.mocked(UserRoleModel.findOne)
      .mockResolvedValueOnce({} as any)
      .mockResolvedValueOnce({} as any);

    vi.mocked(ResourceModel.findOne).mockResolvedValueOnce({} as any);

    await initDefaultRBAC();

    expect(RoleModel.create).not.toHaveBeenCalled();
    expect(UserModel.create).not.toHaveBeenCalled();
    expect(UserRoleModel.create).not.toHaveBeenCalled();
    expect(ResourceModel.create).not.toHaveBeenCalled();

    expectInfo(`${RoleType.User} role already exists`);
    expectInfo(`${RoleType.Admin} role already exists`);
    expectInfo('Admin user already exists');
    expectInfo('Resource folder already exists');
    expectSuccess('Default RBAC initialized successfully.');
  });

  /* ========================================================= */
  /* ERROR HANDLING */
  /* ========================================================= */

  it('should exit process on failure', async () => {
    const error = new Error('DB failure');

    vi.mocked(RoleModel.findOne).mockRejectedValueOnce(error);

    await initDefaultRBAC();

    expectError('Error while initializing default RBAC configuration:', error);

    expect(processExitSpy).toHaveBeenCalledWith(1);
  });

  /* ========================================================= */
  /* ROOT FOLDER CREATION */
  /* ========================================================= */

  it('should create pinned root folder', async () => {
    const userRoleId = new Types.ObjectId();
    const adminRoleId = new Types.ObjectId();
    const adminUserId = new Types.ObjectId();

    vi.mocked(RoleModel.findOne)
      .mockResolvedValueOnce({ _id: userRoleId } as any)
      .mockResolvedValueOnce({ _id: adminRoleId } as any);

    vi.mocked(UserModel.findOne).mockResolvedValueOnce({
      _id: adminUserId,
    } as any);

    vi.mocked(UserRoleModel.findOne)
      .mockResolvedValueOnce({} as any)
      .mockResolvedValueOnce({} as any);

    vi.mocked(ResourceModel.findOne).mockResolvedValueOnce(null);
    vi.mocked(ResourceModel.create).mockResolvedValueOnce({} as any);

    await initDefaultRBAC();

    expect(ResourceModel.create).toHaveBeenCalledWith({
      name: 'my-files',
      type: ResourceType.Folder,
      path: 'my-files',
      parent: null,
      userId: adminUserId,
      pinned: true,
    });
  });
});
