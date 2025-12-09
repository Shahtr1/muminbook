/**
 * @fileoverview Authenticate Middleware Test Suite
 *
 * Tests authentication and authorization middleware including:
 * - Token validation
 * - Role-based access control (User vs Admin)
 * - Token expiration handling
 * - Request context enrichment
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import authenticate from '../authenticate';
import { verifyToken } from '../../utils/jwt';
import AppError from '../../utils/AppError';
import { UNAUTHORIZED, FORBIDDEN } from '../../constants/http';
import AppErrorCode from '../../constants/enums/appErrorCode';
import RoleType from '../../constants/enums/roleType';
import { Types } from 'mongoose';

vi.mock('../../utils/jwt');

describe('Authenticate Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();

    mockRequest = {
      cookies: {},
    };

    mockResponse = {};
    mockNext = vi.fn();
  });

  describe('User Authentication', () => {
    it('should authenticate user with valid access token', () => {
      const mockUserId = new Types.ObjectId();
      const mockSessionId = new Types.ObjectId();

      mockRequest.cookies = {
        accessToken: 'valid-token',
      };

      const mockPayload = {
        userId: mockUserId,
        role: RoleType.User,
        sessionId: mockSessionId,
      };

      vi.mocked(verifyToken).mockReturnValue({
        payload: mockPayload,
        error: null,
      } as any);

      const middleware = authenticate(false);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(verifyToken).toHaveBeenCalledWith('valid-token');
      expect(mockRequest.userId).toBe(mockUserId);
      expect(mockRequest.role).toBe(RoleType.User);
      expect(mockRequest.sessionId).toBe(mockSessionId);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should allow admin to access user routes', () => {
      mockRequest.cookies = { accessToken: 'admin-token' };

      vi.mocked(verifyToken).mockReturnValue({
        payload: {
          userId: new Types.ObjectId(),
          role: RoleType.Admin,
          sessionId: new Types.ObjectId(),
        },
        error: null,
      } as any);

      const middleware = authenticate(false);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should throw error if access token is missing', () => {
      mockRequest.cookies = {};

      const middleware = authenticate(false);

      expect(() => {
        middleware(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow(AppError);

      expect(() => {
        middleware(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow('Not authorized');
    });

    it('should throw error with InvalidAccessToken code when token missing', () => {
      mockRequest.cookies = {};

      const middleware = authenticate(false);

      try {
        middleware(mockRequest as Request, mockResponse as Response, mockNext);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).errorCode).toBe(
          AppErrorCode.InvalidAccessToken
        );
        expect((error as AppError).statusCode).toBe(UNAUTHORIZED);
      }
    });

    it('should throw error for invalid token', () => {
      mockRequest.cookies = { accessToken: 'invalid-token' };

      vi.mocked(verifyToken).mockReturnValue({
        payload: null,
        error: 'invalid signature',
      } as any);

      const middleware = authenticate(false);

      expect(() => {
        middleware(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow(AppError);

      expect(() => {
        middleware(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow('Invalid token');
    });

    it('should throw specific error for expired token', () => {
      mockRequest.cookies = { accessToken: 'expired-token' };

      vi.mocked(verifyToken).mockReturnValue({
        payload: null,
        error: 'jwt expired',
      } as any);

      const middleware = authenticate(false);

      try {
        middleware(mockRequest as Request, mockResponse as Response, mockNext);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).message).toBe('Token expired');
        expect((error as AppError).errorCode).toBe(
          AppErrorCode.InvalidAccessToken
        );
      }
    });
  });

  describe('Admin Authentication', () => {
    it('should authenticate admin user successfully', () => {
      mockRequest.cookies = { accessToken: 'admin-token' };

      const mockPayload = {
        userId: new Types.ObjectId(),
        role: RoleType.Admin,
        sessionId: new Types.ObjectId(),
      };

      vi.mocked(verifyToken).mockReturnValue({
        payload: mockPayload,
        error: null,
      } as any);

      const middleware = authenticate(true);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.role).toBe(RoleType.Admin);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should reject regular user from admin routes', () => {
      mockRequest.cookies = { accessToken: 'user-token' };

      vi.mocked(verifyToken).mockReturnValue({
        payload: {
          userId: new Types.ObjectId(),
          role: RoleType.User,
          sessionId: new Types.ObjectId(),
        },
        error: null,
      } as any);

      const middleware = authenticate(true);

      expect(() => {
        middleware(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow(AppError);

      expect(() => {
        middleware(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow('Forbidden');
    });

    it('should throw FORBIDDEN error with correct error code for non-admin', () => {
      mockRequest.cookies = { accessToken: 'user-token' };

      vi.mocked(verifyToken).mockReturnValue({
        payload: {
          userId: new Types.ObjectId(),
          role: RoleType.User,
          sessionId: new Types.ObjectId(),
        },
        error: null,
      } as any);

      const middleware = authenticate(true);

      try {
        middleware(mockRequest as Request, mockResponse as Response, mockNext);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(FORBIDDEN);
        expect((error as AppError).errorCode).toBe(
          AppErrorCode.ForbiddenAccessToken
        );
      }
    });
  });

  describe('Role Validation', () => {
    it('should reject token with invalid role', () => {
      mockRequest.cookies = { accessToken: 'token' };

      vi.mocked(verifyToken).mockReturnValue({
        payload: {
          userId: new Types.ObjectId(),
          role: 'InvalidRole' as any,
          sessionId: new Types.ObjectId(),
        },
        error: null,
      } as any);

      const middleware = authenticate(false);

      expect(() => {
        middleware(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow(AppError);

      expect(() => {
        middleware(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow('Forbidden');
    });

    it('should accept only User or Admin roles', () => {
      // Test User role
      mockRequest.cookies = { accessToken: 'user-token' };

      vi.mocked(verifyToken).mockReturnValue({
        payload: {
          userId: new Types.ObjectId(),
          role: RoleType.User,
          sessionId: new Types.ObjectId(),
        },
        error: null,
      } as any);

      const userMiddleware = authenticate(false);
      userMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledTimes(1);

      // Test Admin role
      vi.clearAllMocks();
      mockRequest.cookies = { accessToken: 'admin-token' };

      vi.mocked(verifyToken).mockReturnValue({
        payload: {
          userId: new Types.ObjectId(),
          role: RoleType.Admin,
          sessionId: new Types.ObjectId(),
        },
        error: null,
      } as any);

      const adminMiddleware = authenticate(false);
      adminMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledTimes(1);
    });
  });

  describe('Request Context Enrichment', () => {
    it('should add userId to request object', () => {
      const mockUserId = new Types.ObjectId();
      mockRequest.cookies = { accessToken: 'token' };

      vi.mocked(verifyToken).mockReturnValue({
        payload: {
          userId: mockUserId,
          role: RoleType.User,
          sessionId: new Types.ObjectId(),
        },
        error: null,
      } as any);

      const middleware = authenticate(false);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.userId).toBe(mockUserId);
    });

    it('should add role to request object', () => {
      mockRequest.cookies = { accessToken: 'token' };

      vi.mocked(verifyToken).mockReturnValue({
        payload: {
          userId: new Types.ObjectId(),
          role: RoleType.Admin,
          sessionId: new Types.ObjectId(),
        },
        error: null,
      } as any);

      const middleware = authenticate(false);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.role).toBe(RoleType.Admin);
    });

    it('should add sessionId to request object', () => {
      const mockSessionId = new Types.ObjectId();
      mockRequest.cookies = { accessToken: 'token' };

      vi.mocked(verifyToken).mockReturnValue({
        payload: {
          userId: new Types.ObjectId(),
          role: RoleType.User,
          sessionId: mockSessionId,
        },
        error: null,
      } as any);

      const middleware = authenticate(false);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.sessionId).toBe(mockSessionId);
    });

    it('should preserve all payload properties in request', () => {
      const mockUserId = new Types.ObjectId();
      const mockSessionId = new Types.ObjectId();
      mockRequest.cookies = { accessToken: 'token' };

      vi.mocked(verifyToken).mockReturnValue({
        payload: {
          userId: mockUserId,
          role: RoleType.User,
          sessionId: mockSessionId,
        },
        error: null,
      } as any);

      const middleware = authenticate(false);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.userId).toBe(mockUserId);
      expect(mockRequest.role).toBe(RoleType.User);
      expect(mockRequest.sessionId).toBe(mockSessionId);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null payload from verifyToken', () => {
      mockRequest.cookies = { accessToken: 'token' };

      vi.mocked(verifyToken).mockReturnValue({
        payload: null,
        error: 'some error',
      } as any);

      const middleware = authenticate(false);

      expect(() => {
        middleware(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow(AppError);
    });

    it('should handle undefined accessToken', () => {
      mockRequest.cookies = { accessToken: undefined };

      const middleware = authenticate(false);

      expect(() => {
        middleware(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow(AppError);
    });

    it('should handle empty string accessToken', () => {
      mockRequest.cookies = { accessToken: '' };

      const middleware = authenticate(false);

      expect(() => {
        middleware(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow(AppError);
    });

    it('should not call next() when authentication fails', () => {
      mockRequest.cookies = {};

      const middleware = authenticate(false);

      try {
        middleware(mockRequest as Request, mockResponse as Response, mockNext);
      } catch (error) {
        // Expected error
      }

      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Security', () => {
    it('should validate token on every request', () => {
      mockRequest.cookies = { accessToken: 'token' };

      vi.mocked(verifyToken).mockReturnValue({
        payload: {
          userId: new Types.ObjectId(),
          role: RoleType.User,
          sessionId: new Types.ObjectId(),
        },
        error: null,
      } as any);

      const middleware = authenticate(false);

      // Call middleware multiple times
      middleware(mockRequest as Request, mockResponse as Response, mockNext);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(verifyToken).toHaveBeenCalledTimes(2);
    });

    it('should use proper error codes for security events', () => {
      const testCases = [
        {
          scenario: 'missing token',
          cookies: {},
          expectedCode: AppErrorCode.InvalidAccessToken,
        },
        {
          scenario: 'invalid token',
          cookies: { accessToken: 'invalid' },
          verifyResult: { payload: null, error: 'invalid' },
          expectedCode: AppErrorCode.InvalidAccessToken,
        },
        {
          scenario: 'wrong role',
          cookies: { accessToken: 'user-token' },
          verifyResult: {
            payload: {
              userId: new Types.ObjectId(),
              role: RoleType.User,
              sessionId: new Types.ObjectId(),
            },
            error: null,
          },
          isAdmin: true,
          expectedCode: AppErrorCode.ForbiddenAccessToken,
        },
      ];

      testCases.forEach(
        ({ scenario, cookies, verifyResult, isAdmin, expectedCode }) => {
          vi.clearAllMocks();
          mockRequest.cookies = cookies;

          if (verifyResult) {
            vi.mocked(verifyToken).mockReturnValue(verifyResult as any);
          }

          const middleware = authenticate(isAdmin || false);

          try {
            middleware(
              mockRequest as Request,
              mockResponse as Response,
              mockNext
            );
            expect.fail(`Should have thrown for: ${scenario}`);
          } catch (error) {
            expect(error).toBeInstanceOf(AppError);
            expect((error as AppError).errorCode).toBe(expectedCode);
          }
        }
      );
    });
  });
});
