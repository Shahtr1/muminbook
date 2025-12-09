/**
 * @fileoverview Auth Service Test Suite
 *
 * Tests key authentication service flows:
 * - Registration and account creation
 * - Login with credentials
 * - Token refresh and session management
 * - Email verification
 * - Password reset
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  loginUser,
  refreshUserAccessToken,
  verifyEmail,
  resetPassword,
} from '../auth.service';
import UserModel from '../../models/user.model';
import SessionModel from '../../models/session.model';
import UserRoleModel from '../../models/user-role.model';
import VerificationCodeModel from '../../models/verification-code.model';
import { signToken, verifyToken } from '../../utils/jwt';
import { hashValue } from '../../utils/bcrypt';
import { Types } from 'mongoose';
import RoleType from '../../constants/enums/roleType';
import AppError from '../../utils/AppError';

vi.mock('../../models/user.model');
vi.mock('../../models/session.model');
vi.mock('../../models/user-role.model');
vi.mock('../../models/verification-code.model');
vi.mock('../../utils/jwt');
vi.mock('../../utils/bcrypt');

describe('Auth Service - Core Flows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loginUser', () => {
    it('should login user with valid credentials', async () => {
      const mockUserId = new Types.ObjectId();
      const mockSessionId = new Types.ObjectId();
      const mockRoleId = new Types.ObjectId();

      const mockUser = {
        _id: mockUserId,
        email: 'user@example.com',
        comparePassword: vi.fn().mockResolvedValue(true),
        omitPassword: vi.fn().mockReturnValue({ _id: mockUserId }),
      };

      vi.mocked(UserModel.findOne).mockResolvedValue(mockUser as any);
      vi.mocked(SessionModel.create).mockResolvedValue({
        _id: mockSessionId,
      } as any);

      const mockUserRole = {
        roleId: { _id: mockRoleId, type: RoleType.User },
      };
      const populateMock = vi.fn().mockResolvedValue(mockUserRole);
      vi.mocked(UserRoleModel.findOne).mockReturnValue({
        populate: populateMock,
      } as any);

      vi.mocked(signToken)
        .mockReturnValueOnce('refresh-token')
        .mockReturnValueOnce('access-token');

      const result = await loginUser({
        email: 'user@example.com',
        password: 'Password123!',
      });

      expect(mockUser.comparePassword).toHaveBeenCalledWith('Password123!');
      expect(SessionModel.create).toHaveBeenCalled();
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should reject invalid password', async () => {
      const mockUser = {
        comparePassword: vi.fn().mockResolvedValue(false),
      };

      vi.mocked(UserModel.findOne).mockResolvedValue(mockUser as any);

      await expect(
        loginUser({ email: 'user@example.com', password: 'wrong' })
      ).rejects.toThrow(AppError);
    });

    it('should reject non-existent user', async () => {
      vi.mocked(UserModel.findOne).mockResolvedValue(null);

      await expect(
        loginUser({ email: 'nonexistent@example.com', password: 'pass' })
      ).rejects.toThrow(AppError);
    });
  });

  describe('refreshUserAccessToken', () => {
    it('should refresh token for valid session', async () => {
      const mockSessionId = new Types.ObjectId();
      const mockUserId = new Types.ObjectId();

      vi.mocked(verifyToken).mockReturnValue({
        payload: { sessionId: mockSessionId },
        error: null,
      } as any);

      const mockSession = {
        _id: mockSessionId,
        userId: mockUserId,
        expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        save: vi.fn(),
      };
      vi.mocked(SessionModel.findById).mockResolvedValue(mockSession as any);

      const mockUserRole = {
        roleId: { type: RoleType.User },
      };
      const populateMock = vi.fn().mockResolvedValue(mockUserRole);
      vi.mocked(UserRoleModel.findOne).mockReturnValue({
        populate: populateMock,
      } as any);

      vi.mocked(signToken).mockReturnValue('new-access-token');

      const result = await refreshUserAccessToken('valid-refresh-token');

      expect(result).toHaveProperty('accessToken');
    });

    it('should refresh session if expiring soon', async () => {
      const mockSessionId = new Types.ObjectId();

      vi.mocked(verifyToken).mockReturnValue({
        payload: { sessionId: mockSessionId },
        error: null,
      } as any);

      const mockSession = {
        _id: mockSessionId,
        userId: new Types.ObjectId(),
        expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours
        save: vi.fn(),
      };
      vi.mocked(SessionModel.findById).mockResolvedValue(mockSession as any);

      const mockUserRole = {
        roleId: { type: RoleType.User },
      };
      const populateMock = vi.fn().mockResolvedValue(mockUserRole);
      vi.mocked(UserRoleModel.findOne).mockReturnValue({
        populate: populateMock,
      } as any);

      vi.mocked(signToken)
        .mockReturnValueOnce('new-refresh')
        .mockReturnValueOnce('new-access');

      const result = await refreshUserAccessToken('token');

      expect(mockSession.save).toHaveBeenCalled();
      expect(result.newRefreshToken).toBeDefined();
    });

    it('should reject expired session', async () => {
      vi.mocked(verifyToken).mockReturnValue({
        payload: { sessionId: new Types.ObjectId() },
        error: null,
      } as any);

      vi.mocked(SessionModel.findById).mockResolvedValue({
        expiresAt: new Date(Date.now() - 1000),
      } as any);

      await expect(refreshUserAccessToken('token')).rejects.toThrow(AppError);
    });

    it('should reject invalid refresh token', async () => {
      vi.mocked(verifyToken).mockReturnValue({
        payload: null,
        error: 'invalid',
      } as any);

      await expect(refreshUserAccessToken('invalid')).rejects.toThrow(AppError);
    });
  });

  describe('verifyEmail', () => {
    it('should verify email with valid code', async () => {
      const mockCodeId = new Types.ObjectId();
      const mockUserId = new Types.ObjectId();

      const mockCode = {
        _id: mockCodeId,
        userId: mockUserId,
        deleteOne: vi.fn(),
      };

      vi.mocked(VerificationCodeModel.findOne).mockResolvedValue(
        mockCode as any
      );

      const mockUser = {
        _id: mockUserId,
        verified: true,
        omitPassword: vi
          .fn()
          .mockReturnValue({ _id: mockUserId, verified: true }),
      };

      vi.mocked(UserModel.findByIdAndUpdate).mockResolvedValue(mockUser as any);

      const result = await verifyEmail(mockCodeId.toString());

      expect(UserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockUserId,
        { verified: true },
        { new: true }
      );
      expect(mockCode.deleteOne).toHaveBeenCalled();
      expect(result.user.verified).toBe(true);
    });

    it('should reject invalid verification code', async () => {
      vi.mocked(VerificationCodeModel.findOne).mockResolvedValue(null);

      await expect(verifyEmail('invalid')).rejects.toThrow(AppError);
    });
  });

  describe('resetPassword', () => {
    it('should reset password and delete sessions', async () => {
      const mockCodeId = new Types.ObjectId();
      const mockUserId = new Types.ObjectId();

      const mockCode = {
        userId: mockUserId,
        deleteOne: vi.fn(),
      };

      vi.mocked(VerificationCodeModel.findOne).mockResolvedValue(
        mockCode as any
      );
      vi.mocked(hashValue).mockResolvedValue('hashed-password');

      const mockUser = {
        _id: mockUserId,
        omitPassword: vi.fn().mockReturnValue({ _id: mockUserId }),
      };

      vi.mocked(UserModel.findByIdAndUpdate).mockResolvedValue(mockUser as any);
      vi.mocked(SessionModel.deleteMany).mockResolvedValue({
        deletedCount: 2,
      } as any);

      const result = await resetPassword({
        password: 'NewPass123!',
        verificationCode: mockCodeId.toString(),
      });

      expect(hashValue).toHaveBeenCalledWith('NewPass123!');
      expect(UserModel.findByIdAndUpdate).toHaveBeenCalledWith(mockUserId, {
        password: 'hashed-password',
      });
      expect(SessionModel.deleteMany).toHaveBeenCalledWith({
        userId: mockUserId,
      });
      expect(mockCode.deleteOne).toHaveBeenCalled();
      expect(result.user).toBeDefined();
    });

    it('should reject invalid verification code', async () => {
      vi.mocked(VerificationCodeModel.findOne).mockResolvedValue(null);

      await expect(
        resetPassword({ password: 'pass', verificationCode: 'invalid' })
      ).rejects.toThrow(AppError);
    });
  });
});
