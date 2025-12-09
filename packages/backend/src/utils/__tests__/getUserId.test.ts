/**
 * @fileoverview GetUserId Utility Test Suite
 *
 * Tests the getUserId utility that fetches and validates user existence.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getUserId } from '../getUserId';
import UserModel from '../../models/user.model';
import AppError from '../AppError';
import { NOT_FOUND } from '../../constants/http';
import { Types } from 'mongoose';

// Mock the UserModel
vi.mock('../../models/user.model', () => ({
  default: {
    findById: vi.fn(),
  },
}));

describe('getUserId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('successful user retrieval', () => {
    it('should return user ID when user exists', async () => {
      const mockUserId = new Types.ObjectId();
      const mockUser = {
        _id: mockUserId,
        email: 'test@example.com',
      };

      vi.mocked(UserModel.findById).mockResolvedValue(mockUser as any);

      const req = { userId: mockUserId.toString() };
      const result = await getUserId(req);

      expect(UserModel.findById).toHaveBeenCalledWith(mockUserId.toString());
      expect(result).toBe(mockUserId);
    });

    it('should handle ObjectId instances', async () => {
      const mockUserId = new Types.ObjectId();
      const mockUser = {
        _id: mockUserId,
        email: 'user@test.com',
        name: 'Test User',
      };

      vi.mocked(UserModel.findById).mockResolvedValue(mockUser as any);

      const req = { userId: mockUserId };
      const result = await getUserId(req);

      expect(result).toEqual(mockUserId);
    });

    it('should work with different user properties', async () => {
      const mockUserId = new Types.ObjectId();
      const mockUser = {
        _id: mockUserId,
        email: 'admin@example.com',
        role: 'admin',
        isVerified: true,
      };

      vi.mocked(UserModel.findById).mockResolvedValue(mockUser as any);

      const req = { userId: mockUserId.toString() };
      const result = await getUserId(req);

      expect(result).toBe(mockUserId);
    });
  });

  describe('user not found scenarios', () => {
    it('should throw AppError when user does not exist', async () => {
      vi.mocked(UserModel.findById).mockResolvedValue(null);

      const req = { userId: new Types.ObjectId().toString() };

      await expect(getUserId(req)).rejects.toThrow(AppError);
    });

    it('should throw error with NOT_FOUND status code', async () => {
      vi.mocked(UserModel.findById).mockResolvedValue(null);

      const req = { userId: 'nonexistent-id' };

      try {
        await getUserId(req);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(NOT_FOUND);
      }
    });

    it('should throw error with correct message', async () => {
      vi.mocked(UserModel.findById).mockResolvedValue(null);

      const req = { userId: 'invalid-user-id' };

      try {
        await getUserId(req);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).message).toBe('User not found');
      }
    });
  });

  describe('database error handling', () => {
    it('should propagate database errors', async () => {
      const dbError = new Error('Database connection failed');
      vi.mocked(UserModel.findById).mockRejectedValue(dbError);

      const req = { userId: new Types.ObjectId().toString() };

      await expect(getUserId(req)).rejects.toThrow(
        'Database connection failed'
      );
    });

    it('should handle invalid ObjectId format', async () => {
      const invalidIdError = new Error('Cast to ObjectId failed');
      vi.mocked(UserModel.findById).mockRejectedValue(invalidIdError);

      const req = { userId: 'invalid-format' };

      await expect(getUserId(req)).rejects.toThrow('Cast to ObjectId failed');
    });
  });

  describe('request object variations', () => {
    it('should extract userId from request object', async () => {
      const mockUserId = new Types.ObjectId();
      const mockUser = { _id: mockUserId };

      vi.mocked(UserModel.findById).mockResolvedValue(mockUser as any);

      const req = {
        userId: mockUserId.toString(),
        body: {},
        params: {},
      };

      const result = await getUserId(req);

      expect(UserModel.findById).toHaveBeenCalledWith(mockUserId.toString());
      expect(result).toBe(mockUserId);
    });

    it('should work with authenticated request', async () => {
      const mockUserId = new Types.ObjectId();
      const mockUser = { _id: mockUserId };

      vi.mocked(UserModel.findById).mockResolvedValue(mockUser as any);

      const authenticatedReq = {
        userId: mockUserId.toString(),
        isAuthenticated: true,
        sessionId: 'session-123',
      };

      const result = await getUserId(authenticatedReq);

      expect(result).toBe(mockUserId);
    });
  });

  describe('integration scenarios', () => {
    it('should validate user for protected routes', async () => {
      const mockUserId = new Types.ObjectId();
      const mockUser = {
        _id: mockUserId,
        email: 'protected@example.com',
      };

      vi.mocked(UserModel.findById).mockResolvedValue(mockUser as any);

      const protectedRouteReq = {
        userId: mockUserId.toString(),
        method: 'POST',
        path: '/api/protected/resource',
      };

      const result = await getUserId(protectedRouteReq);

      expect(result).toBe(mockUserId);
      expect(UserModel.findById).toHaveBeenCalled();
    });

    it('should handle user verification workflow', async () => {
      const mockUserId = new Types.ObjectId();
      const mockUser = {
        _id: mockUserId,
        isVerified: false,
      };

      vi.mocked(UserModel.findById).mockResolvedValue(mockUser as any);

      const req = { userId: mockUserId.toString() };
      const result = await getUserId(req);

      expect(result).toBeDefined();
    });
  });
});
