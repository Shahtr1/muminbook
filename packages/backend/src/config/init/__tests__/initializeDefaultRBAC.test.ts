/**
 * @fileoverview Test Suite for Default RBAC Initialization
 *
 * Tests the initialization of default Role-Based Access Control (RBAC) configuration:
 * - User and Admin role creation
 * - Admin user creation
 * - Role assignments
 * - Root resource folder creation
 * - Idempotent operations (preventing duplicates)
 * - Error handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock all models BEFORE importing them
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

// Mock environment variables
vi.mock('../../../constants/env', () => ({
  ADMIN_FIRSTNAME: 'TestAdmin',
  ADMIN_LASTNAME: 'User',
  ADMIN_DATE_OF_BIRTH: '1990-01-01',
  ADMIN_GENDER: 'male',
  ADMIN_EMAIL: 'admin@test.com',
  ADMIN_PASSWORD: 'SecurePassword123!',
}));

// Now import after mocks
import initializeDefaultRBAC from '../initializeDefaultRBAC';
import RoleModel from '../../../models/role.model';
import UserModel from '../../../models/user.model';
import UserRoleModel from '../../../models/user-role.model';
import ResourceModel from '../../../models/resource.model';
import RoleType from '../../../constants/enums/roleType';
import ResourceType from '../../../constants/enums/resourceType';

// Import Types separately to avoid hoisting issues
import { Types } from 'mongoose';

describe('initializeDefaultRBAC', () => {
  // Mock console methods to test logging
  let consoleLogSpy: any;
  let consoleErrorSpy: any;
  let processExitSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    processExitSpy = vi
      .spyOn(process, 'exit')
      .mockImplementation((() => {}) as any);
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    processExitSpy.mockRestore();
  });

  describe('Successful Initialization - First Run', () => {
    it('should create all roles, admin user, assignments, and folder when nothing exists', async () => {
      const mockUserRoleId = new Types.ObjectId();
      const mockAdminRoleId = new Types.ObjectId();
      const mockAdminUserId = new Types.ObjectId();

      // Mock that nothing exists initially
      vi.mocked(RoleModel.findOne)
        .mockResolvedValueOnce(null) // User role doesn't exist
        .mockResolvedValueOnce(null); // Admin role doesn't exist

      // Mock role creation
      const mockUserRole = { _id: mockUserRoleId, type: RoleType.User };
      const mockAdminRole = { _id: mockAdminRoleId, type: RoleType.Admin };
      vi.mocked(RoleModel.create)
        .mockResolvedValueOnce(mockUserRole as any)
        .mockResolvedValueOnce(mockAdminRole as any);

      // Mock admin user doesn't exist and gets created
      vi.mocked(UserModel.findOne).mockResolvedValueOnce(null);
      const mockAdmin = { _id: mockAdminUserId, email: 'admin@test.com' };
      vi.mocked(UserModel.create).mockResolvedValueOnce(mockAdmin as any);

      // Mock user role assignments don't exist
      vi.mocked(UserRoleModel.findOne)
        .mockResolvedValueOnce(null) // Admin-Admin role assignment
        .mockResolvedValueOnce(null); // Admin-User role assignment

      vi.mocked(UserRoleModel.create)
        .mockResolvedValueOnce({} as any)
        .mockResolvedValueOnce({} as any);

      // Mock admin folder doesn't exist
      vi.mocked(ResourceModel.findOne).mockResolvedValueOnce(null);
      vi.mocked(ResourceModel.create).mockResolvedValueOnce({} as any);

      await initializeDefaultRBAC();

      // Verify role creation
      expect(RoleModel.create).toHaveBeenCalledWith({
        type: RoleType.User,
        description: 'This is the role assigned to user',
      });
      expect(RoleModel.create).toHaveBeenCalledWith({
        type: RoleType.Admin,
        description: 'This is the role assigned to admin',
      });

      // Verify admin user creation
      expect(UserModel.create).toHaveBeenCalledWith({
        firstname: 'TestAdmin',
        lastname: 'User',
        dateOfBirth: '1990-01-01',
        gender: 'male',
        email: 'admin@test.com',
        password: 'SecurePassword123!',
        verified: true,
      });

      // Verify role assignments
      expect(UserRoleModel.create).toHaveBeenCalledWith({
        userId: mockAdminUserId,
        roleId: mockAdminRoleId,
      });
      expect(UserRoleModel.create).toHaveBeenCalledWith({
        userId: mockAdminUserId,
        roleId: mockUserRoleId,
      });

      // Verify root folder creation
      expect(ResourceModel.create).toHaveBeenCalledWith({
        name: 'my-files',
        type: ResourceType.Folder,
        path: 'my-files',
        parent: null,
        userId: mockAdminUserId,
        pinned: true,
      });

      // Verify success messages (match current log wording)
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '🔐 Initializing default RBAC...'
      );
      expect(consoleLogSpy).toHaveBeenCalledWith('✅ user role created');
      expect(consoleLogSpy).toHaveBeenCalledWith('✅ admin role created');
      expect(consoleLogSpy).toHaveBeenCalledWith('✅ Admin user created');
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '✅ Assigned Admin role to admin user'
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '✅ Also assigned User role to admin user'
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '✅ Root resource folder for admin created'
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '✅ Default RBAC initialized successfully.'
      );
    });
  });

  describe('Idempotent Initialization - Subsequent Runs', () => {
    it('should skip creation when all resources already exist', async () => {
      const mockUserRoleId = new Types.ObjectId();
      const mockAdminRoleId = new Types.ObjectId();
      const mockAdminUserId = new Types.ObjectId();

      // Mock that everything already exists
      const mockUserRole = { _id: mockUserRoleId, type: RoleType.User };
      const mockAdminRole = { _id: mockAdminRoleId, type: RoleType.Admin };
      vi.mocked(RoleModel.findOne)
        .mockResolvedValueOnce(mockUserRole as any)
        .mockResolvedValueOnce(mockAdminRole as any);

      const mockAdmin = { _id: mockAdminUserId, email: 'admin@test.com' };
      vi.mocked(UserModel.findOne).mockResolvedValueOnce(mockAdmin as any);

      // Mock role assignments already exist
      vi.mocked(UserRoleModel.findOne)
        .mockResolvedValueOnce({ userId: mockAdminUserId } as any)
        .mockResolvedValueOnce({ userId: mockAdminUserId } as any);

      // Mock folder already exists
      vi.mocked(ResourceModel.findOne).mockResolvedValueOnce({
        name: 'my-files',
      } as any);

      await initializeDefaultRBAC();

      // Verify nothing was created
      expect(RoleModel.create).not.toHaveBeenCalled();
      expect(UserModel.create).not.toHaveBeenCalled();
      expect(UserRoleModel.create).not.toHaveBeenCalled();
      expect(ResourceModel.create).not.toHaveBeenCalled();

      // Verify appropriate messages
      expect(consoleLogSpy).toHaveBeenCalledWith('ℹ️ user role already exists');
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'ℹ️ admin role already exists'
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'ℹ️ Admin user already exists'
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'ℹ️ Resource folder already exists'
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '✅ Default RBAC initialized successfully.'
      );
    });

    it('should create only missing role assignments when admin exists but roles are not assigned', async () => {
      const mockUserRoleId = new Types.ObjectId();
      const mockAdminRoleId = new Types.ObjectId();
      const mockAdminUserId = new Types.ObjectId();

      // Roles and admin exist
      const mockUserRole = { _id: mockUserRoleId, type: RoleType.User };
      const mockAdminRole = { _id: mockAdminRoleId, type: RoleType.Admin };
      vi.mocked(RoleModel.findOne)
        .mockResolvedValueOnce(mockUserRole as any)
        .mockResolvedValueOnce(mockAdminRole as any);

      const mockAdmin = { _id: mockAdminUserId, email: 'admin@test.com' };
      vi.mocked(UserModel.findOne).mockResolvedValueOnce(mockAdmin as any);

      // Role assignments don't exist
      vi.mocked(UserRoleModel.findOne)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      vi.mocked(UserRoleModel.create)
        .mockResolvedValueOnce({} as any)
        .mockResolvedValueOnce({} as any);

      // Folder exists
      vi.mocked(ResourceModel.findOne).mockResolvedValueOnce({
        name: 'my-files',
      } as any);

      await initializeDefaultRBAC();

      // Verify role assignments were created
      expect(UserRoleModel.create).toHaveBeenCalledTimes(2);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '✅ Assigned Admin role to admin user'
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '✅ Also assigned User role to admin user'
      );
    });

    it('should create only missing folder when admin and roles exist', async () => {
      const mockUserRoleId = new Types.ObjectId();
      const mockAdminRoleId = new Types.ObjectId();
      const mockAdminUserId = new Types.ObjectId();

      // Everything exists except folder
      const mockUserRole = { _id: mockUserRoleId, type: RoleType.User };
      const mockAdminRole = { _id: mockAdminRoleId, type: RoleType.Admin };
      vi.mocked(RoleModel.findOne)
        .mockResolvedValueOnce(mockUserRole as any)
        .mockResolvedValueOnce(mockAdminRole as any);

      const mockAdmin = { _id: mockAdminUserId, email: 'admin@test.com' };
      vi.mocked(UserModel.findOne).mockResolvedValueOnce(mockAdmin as any);

      vi.mocked(UserRoleModel.findOne)
        .mockResolvedValueOnce({ userId: mockAdminUserId } as any)
        .mockResolvedValueOnce({ userId: mockAdminUserId } as any);

      // Folder doesn't exist
      vi.mocked(ResourceModel.findOne).mockResolvedValueOnce(null);
      vi.mocked(ResourceModel.create).mockResolvedValueOnce({} as any);

      await initializeDefaultRBAC();

      // Verify only folder was created
      expect(ResourceModel.create).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '✅ Root resource folder for admin created'
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle role creation error and exit process', async () => {
      const error = new Error('Database connection failed');
      vi.mocked(RoleModel.findOne).mockRejectedValueOnce(error);

      await initializeDefaultRBAC();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '❌ Error while initializing default RBAC configuration:',
        error
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should handle user creation error and exit process', async () => {
      const mockUserRoleId = new Types.ObjectId();
      const mockAdminRoleId = new Types.ObjectId();

      vi.mocked(RoleModel.findOne)
        .mockResolvedValueOnce({ _id: mockUserRoleId } as any)
        .mockResolvedValueOnce({ _id: mockAdminRoleId } as any);

      const error = new Error('Failed to create admin user');
      vi.mocked(UserModel.findOne).mockRejectedValueOnce(error);

      await initializeDefaultRBAC();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '❌ Error while initializing default RBAC configuration:',
        error
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should handle user role assignment error and exit process', async () => {
      const mockUserRoleId = new Types.ObjectId();
      const mockAdminRoleId = new Types.ObjectId();
      const mockAdminUserId = new Types.ObjectId();

      vi.mocked(RoleModel.findOne)
        .mockResolvedValueOnce({ _id: mockUserRoleId } as any)
        .mockResolvedValueOnce({ _id: mockAdminRoleId } as any);

      vi.mocked(UserModel.findOne).mockResolvedValueOnce({
        _id: mockAdminUserId,
      } as any);

      const error = new Error('Failed to assign role');
      vi.mocked(UserRoleModel.findOne).mockRejectedValueOnce(error);

      await initializeDefaultRBAC();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '❌ Error while initializing default RBAC configuration:',
        error
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should handle resource folder creation error and exit process', async () => {
      const mockUserRoleId = new Types.ObjectId();
      const mockAdminRoleId = new Types.ObjectId();
      const mockAdminUserId = new Types.ObjectId();

      vi.mocked(RoleModel.findOne)
        .mockResolvedValueOnce({ _id: mockUserRoleId } as any)
        .mockResolvedValueOnce({ _id: mockAdminRoleId } as any);

      vi.mocked(UserModel.findOne).mockResolvedValueOnce({
        _id: mockAdminUserId,
      } as any);

      vi.mocked(UserRoleModel.findOne)
        .mockResolvedValueOnce({ userId: mockAdminUserId } as any)
        .mockResolvedValueOnce({ userId: mockAdminUserId } as any);

      const error = new Error('Failed to create resource folder');
      vi.mocked(ResourceModel.findOne).mockRejectedValueOnce(error);

      await initializeDefaultRBAC();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '❌ Error while initializing default RBAC configuration:',
        error
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('Role and User Details', () => {
    it('should create User role with correct properties', async () => {
      vi.mocked(RoleModel.findOne).mockResolvedValueOnce(null);
      vi.mocked(RoleModel.create).mockResolvedValueOnce({
        _id: new Types.ObjectId(),
      } as any);

      // Stop after first role creation to isolate test
      const error = new Error('Stop test');
      vi.mocked(RoleModel.findOne).mockRejectedValueOnce(error);

      await initializeDefaultRBAC();

      expect(RoleModel.create).toHaveBeenCalledWith({
        type: RoleType.User,
        description: 'This is the role assigned to user',
      });
    });

    it('should create Admin role with correct properties', async () => {
      const mockUserRoleId = new Types.ObjectId();

      vi.mocked(RoleModel.findOne)
        .mockResolvedValueOnce({ _id: mockUserRoleId } as any) // User role exists
        .mockResolvedValueOnce(null); // Admin role doesn't exist

      vi.mocked(RoleModel.create).mockResolvedValueOnce({
        _id: new Types.ObjectId(),
      } as any);

      // Stop after admin role creation
      const error = new Error('Stop test');
      vi.mocked(UserModel.findOne).mockRejectedValueOnce(error);

      await initializeDefaultRBAC();

      expect(RoleModel.create).toHaveBeenCalledWith({
        type: RoleType.Admin,
        description: 'This is the role assigned to admin',
      });
    });

    it('should create admin user with verified status', async () => {
      const mockUserRoleId = new Types.ObjectId();
      const mockAdminRoleId = new Types.ObjectId();

      vi.mocked(RoleModel.findOne)
        .mockResolvedValueOnce({ _id: mockUserRoleId } as any)
        .mockResolvedValueOnce({ _id: mockAdminRoleId } as any);

      vi.mocked(UserModel.findOne).mockResolvedValueOnce(null);
      vi.mocked(UserModel.create).mockResolvedValueOnce({
        _id: new Types.ObjectId(),
      } as any);

      // Stop after user creation
      const error = new Error('Stop test');
      vi.mocked(UserRoleModel.findOne).mockRejectedValueOnce(error);

      await initializeDefaultRBAC();

      expect(UserModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          verified: true,
          email: 'admin@test.com',
        })
      );
    });

    it('should create root folder with pinned status', async () => {
      const mockUserRoleId = new Types.ObjectId();
      const mockAdminRoleId = new Types.ObjectId();
      const mockAdminUserId = new Types.ObjectId();

      vi.mocked(RoleModel.findOne)
        .mockResolvedValueOnce({ _id: mockUserRoleId } as any)
        .mockResolvedValueOnce({ _id: mockAdminRoleId } as any);

      vi.mocked(UserModel.findOne).mockResolvedValueOnce({
        _id: mockAdminUserId,
      } as any);

      vi.mocked(UserRoleModel.findOne)
        .mockResolvedValueOnce({ userId: mockAdminUserId } as any)
        .mockResolvedValueOnce({ userId: mockAdminUserId } as any);

      vi.mocked(ResourceModel.findOne).mockResolvedValueOnce(null);
      vi.mocked(ResourceModel.create).mockResolvedValueOnce({} as any);

      await initializeDefaultRBAC();

      expect(ResourceModel.create).toHaveBeenCalledWith({
        name: 'my-files',
        type: ResourceType.Folder,
        path: 'my-files',
        parent: null,
        userId: mockAdminUserId,
        pinned: true,
      });
    });
  });

  describe('Admin Role Assignments', () => {
    it('should assign both Admin and User roles to admin user', async () => {
      const mockUserRoleId = new Types.ObjectId();
      const mockAdminRoleId = new Types.ObjectId();
      const mockAdminUserId = new Types.ObjectId();

      vi.mocked(RoleModel.findOne)
        .mockResolvedValueOnce({ _id: mockUserRoleId } as any)
        .mockResolvedValueOnce({ _id: mockAdminRoleId } as any);

      vi.mocked(UserModel.findOne).mockResolvedValueOnce({
        _id: mockAdminUserId,
      } as any);

      vi.mocked(UserRoleModel.findOne)
        .mockResolvedValueOnce(null) // Admin role not assigned
        .mockResolvedValueOnce(null); // User role not assigned

      vi.mocked(UserRoleModel.create)
        .mockResolvedValueOnce({} as any)
        .mockResolvedValueOnce({} as any);

      vi.mocked(ResourceModel.findOne).mockResolvedValueOnce({
        name: 'my-files',
      } as any);

      await initializeDefaultRBAC();

      expect(UserRoleModel.create).toHaveBeenNthCalledWith(1, {
        userId: mockAdminUserId,
        roleId: mockAdminRoleId,
      });

      expect(UserRoleModel.create).toHaveBeenNthCalledWith(2, {
        userId: mockAdminUserId,
        roleId: mockUserRoleId,
      });
    });

    it('should skip Admin role assignment if already exists', async () => {
      const mockUserRoleId = new Types.ObjectId();
      const mockAdminRoleId = new Types.ObjectId();
      const mockAdminUserId = new Types.ObjectId();

      vi.mocked(RoleModel.findOne)
        .mockResolvedValueOnce({ _id: mockUserRoleId } as any)
        .mockResolvedValueOnce({ _id: mockAdminRoleId } as any);

      vi.mocked(UserModel.findOne).mockResolvedValueOnce({
        _id: mockAdminUserId,
      } as any);

      vi.mocked(UserRoleModel.findOne)
        .mockResolvedValueOnce({ userId: mockAdminUserId } as any) // Admin role already assigned
        .mockResolvedValueOnce(null); // User role not assigned

      vi.mocked(UserRoleModel.create).mockResolvedValueOnce({} as any);

      vi.mocked(ResourceModel.findOne).mockResolvedValueOnce({
        name: 'my-files',
      } as any);

      await initializeDefaultRBAC();

      // Should only create User role assignment
      expect(UserRoleModel.create).toHaveBeenCalledTimes(1);
      expect(UserRoleModel.create).toHaveBeenCalledWith({
        userId: mockAdminUserId,
        roleId: mockUserRoleId,
      });
    });

    it('should skip User role assignment if already exists', async () => {
      const mockUserRoleId = new Types.ObjectId();
      const mockAdminRoleId = new Types.ObjectId();
      const mockAdminUserId = new Types.ObjectId();

      vi.mocked(RoleModel.findOne)
        .mockResolvedValueOnce({ _id: mockUserRoleId } as any)
        .mockResolvedValueOnce({ _id: mockAdminRoleId } as any);

      vi.mocked(UserModel.findOne).mockResolvedValueOnce({
        _id: mockAdminUserId,
      } as any);

      vi.mocked(UserRoleModel.findOne)
        .mockResolvedValueOnce(null) // Admin role not assigned
        .mockResolvedValueOnce({ userId: mockAdminUserId } as any); // User role already assigned

      vi.mocked(UserRoleModel.create).mockResolvedValueOnce({} as any);

      vi.mocked(ResourceModel.findOne).mockResolvedValueOnce({
        name: 'my-files',
      } as any);

      await initializeDefaultRBAC();

      // Should only create Admin role assignment
      expect(UserRoleModel.create).toHaveBeenCalledTimes(1);
      expect(UserRoleModel.create).toHaveBeenCalledWith({
        userId: mockAdminUserId,
        roleId: mockAdminRoleId,
      });
    });
  });
});
