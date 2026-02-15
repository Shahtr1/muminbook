/**
 * @fileoverview Auth Controller Test Suite
 *
 * Tests HTTP request handlers for authentication.
 * Note: Validation is handled by Zod schemas, so we focus on business logic.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import {
  registerHandler,
  loginHandler,
  logoutHandler,
  refreshHandler,
  verifyEmailHandler,
  reverifyEmailHandler,
  sendPasswordResetHandler,
  resetPasswordHandler,
} from '../auth.controller.js';
import * as authService from '../../services/auth.service.js';
import * as cookieUtils from '../../utils/cookies.js';
import { verifyToken } from '../../utils/jwt.js';
import { Types } from 'mongoose';
import { CREATED, OK } from '../../constants/http.js';
import { UserDocument } from '../../models/user.model.js';
import SessionModel from '../../models/session.model.js';

vi.mock('../../services/auth.service');
vi.mock('../../utils/cookies');
vi.mock('../../utils/jwt');
vi.mock('../../models/session.model');

describe('Auth Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockRequest = {
      body: {},
      params: {},
      cookies: {},
      headers: {},
    };

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      cookie: vi.fn().mockReturnThis(),
    };

    mockNext = vi.fn();
  });

  describe('registerHandler', () => {
    it('should register new user and set auth cookies', async () => {
      const registrationData = {
        firstname: 'John',
        lastname: 'Doe',
        dateOfBirth: new Date('1990-01-01').getTime(),
        gender: 'male',
        email: 'john@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
      };

      mockRequest.body = registrationData;
      mockRequest.headers = { 'user-agent': 'Mozilla/5.0' };

      const mockUser = {
        _id: new Types.ObjectId(),
        email: registrationData.email,
      } as UserDocument;
      vi.mocked(authService.createAccount).mockResolvedValue({
        user: mockUser,
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
      vi.mocked(cookieUtils.setAuthCookies).mockReturnValue(
        mockResponse as any
      );

      await registerHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(authService.createAccount).toHaveBeenCalled();
      expect(cookieUtils.setAuthCookies).toHaveBeenCalledWith({
        res: mockResponse,
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
      expect(mockResponse.status).toHaveBeenCalledWith(CREATED);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUser);
    });

    it('should pass validation error to next() for invalid email', async () => {
      mockRequest.body = {
        firstname: 'John',
        lastname: 'Doe',
        dateOfBirth: new Date('1990-01-01').getTime(),
        gender: 'male',
        email: 'invalid-email', // Invalid email format
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
      };
      mockRequest.headers = { 'user-agent': 'Mozilla/5.0' };

      await registerHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(authService.createAccount).not.toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should pass validation error to next() for password mismatch', async () => {
      mockRequest.body = {
        firstname: 'John',
        lastname: 'Doe',
        dateOfBirth: new Date('1990-01-01').getTime(),
        gender: 'male',
        email: 'john@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'DifferentPass123!', // Password mismatch
      };
      mockRequest.headers = { 'user-agent': 'Mozilla/5.0' };

      await registerHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(authService.createAccount).not.toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should pass validation error to next() for short password', async () => {
      mockRequest.body = {
        firstname: 'John',
        lastname: 'Doe',
        dateOfBirth: new Date('1990-01-01').getTime(),
        gender: 'male',
        email: 'john@example.com',
        password: '12345', // Too short
        confirmPassword: '12345',
      };
      mockRequest.headers = { 'user-agent': 'Mozilla/5.0' };

      await registerHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(authService.createAccount).not.toHaveBeenCalled();
    });

    it('should pass validation error to next() for invalid gender', async () => {
      mockRequest.body = {
        firstname: 'John',
        lastname: 'Doe',
        dateOfBirth: new Date('1990-01-01').getTime(),
        gender: 'other', // Invalid enum value
        email: 'john@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
      };
      mockRequest.headers = { 'user-agent': 'Mozilla/5.0' };

      await registerHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(authService.createAccount).not.toHaveBeenCalled();
    });

    it('should pass validation error to next() for short firstname', async () => {
      mockRequest.body = {
        firstname: 'J', // Too short
        lastname: 'Doe',
        dateOfBirth: new Date('1990-01-01').getTime(),
        gender: 'male',
        email: 'john@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
      };
      mockRequest.headers = { 'user-agent': 'Mozilla/5.0' };

      await registerHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(authService.createAccount).not.toHaveBeenCalled();
    });

    it('should pass service error to next() when account creation fails', async () => {
      mockRequest.body = {
        firstname: 'John',
        lastname: 'Doe',
        dateOfBirth: new Date('1990-01-01').getTime(),
        gender: 'male',
        email: 'john@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
      };
      mockRequest.headers = { 'user-agent': 'Mozilla/5.0' };

      const serviceError = new Error('Email already exists');
      vi.mocked(authService.createAccount).mockRejectedValue(serviceError);

      await registerHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(serviceError);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should pass validation error to next() for invalid date of birth', async () => {
      mockRequest.body = {
        firstname: 'John',
        lastname: 'Doe',
        dateOfBirth: 'invalid-date', // Invalid date format
        gender: 'male',
        email: 'john@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
      };
      mockRequest.headers = { 'user-agent': 'Mozilla/5.0' };

      await registerHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(authService.createAccount).not.toHaveBeenCalled();
    });
  });

  describe('loginHandler', () => {
    it('should login user and set auth cookies', async () => {
      mockRequest.body = {
        email: 'user@example.com',
        password: 'Password123!',
      };
      mockRequest.headers = { 'user-agent': 'Chrome' };

      vi.mocked(authService.loginUser).mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      } as any);
      vi.mocked(cookieUtils.setAuthCookies).mockReturnValue(
        mockResponse as any
      );

      await loginHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(authService.loginUser).toHaveBeenCalled();
      expect(cookieUtils.setAuthCookies).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(OK);
    });
  });

  describe('logoutHandler', () => {
    it('should logout user and delete session', async () => {
      const mockSessionId = new Types.ObjectId();
      mockRequest.cookies = { accessToken: 'valid-token' };

      vi.mocked(verifyToken).mockReturnValue({
        payload: { sessionId: mockSessionId },
        error: null,
      } as any);
      vi.mocked(SessionModel.findByIdAndDelete).mockResolvedValue({} as any);
      vi.mocked(cookieUtils.clearAuthCookies).mockReturnValue(
        mockResponse as any
      );

      await logoutHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(SessionModel.findByIdAndDelete).toHaveBeenCalledWith(
        mockSessionId
      );
      expect(cookieUtils.clearAuthCookies).toHaveBeenCalled();
    });

    it('should clear cookies even without valid token', async () => {
      mockRequest.cookies = { accessToken: 'invalid-token' };

      vi.mocked(verifyToken).mockReturnValue({
        payload: null,
        error: 'invalid',
      } as any);
      vi.mocked(cookieUtils.clearAuthCookies).mockReturnValue(
        mockResponse as any
      );

      await logoutHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(SessionModel.findByIdAndDelete).not.toHaveBeenCalled();
      expect(cookieUtils.clearAuthCookies).toHaveBeenCalled();
    });
  });

  describe('refreshHandler', () => {
    it('should refresh access token', async () => {
      mockRequest.cookies = { refreshToken: 'valid-refresh-token' };

      vi.mocked(authService.refreshUserAccessToken).mockResolvedValue({
        accessToken: 'new-access-token',
        newRefreshToken: undefined,
      });
      vi.mocked(cookieUtils.getAccessTokenCookieOptions).mockReturnValue({});

      await refreshHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(authService.refreshUserAccessToken).toHaveBeenCalledWith(
        'valid-refresh-token'
      );
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'accessToken',
        'new-access-token',
        {}
      );
    });

    it('should set new refresh token if provided', async () => {
      mockRequest.cookies = { refreshToken: 'expiring-token' };

      vi.mocked(authService.refreshUserAccessToken).mockResolvedValue({
        accessToken: 'new-access',
        newRefreshToken: 'new-refresh',
      });
      vi.mocked(cookieUtils.getRefreshTokenCookieOptions).mockReturnValue({
        path: '/auth/refresh',
      });
      vi.mocked(cookieUtils.getAccessTokenCookieOptions).mockReturnValue({});

      await refreshHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'new-refresh',
        { path: '/auth/refresh' }
      );
    });

    it('should pass error to next() when refresh token is missing', async () => {
      mockRequest.cookies = {}; // No refresh token

      await refreshHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(authService.refreshUserAccessToken).not.toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should pass service error to next() for invalid refresh token', async () => {
      mockRequest.cookies = { refreshToken: 'invalid-token' };

      const serviceError = new Error('Invalid refresh token');
      vi.mocked(authService.refreshUserAccessToken).mockRejectedValue(
        serviceError
      );

      await refreshHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(serviceError);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should pass service error to next() for expired refresh token', async () => {
      mockRequest.cookies = { refreshToken: 'expired-token' };

      const serviceError = new Error('Refresh token expired');
      vi.mocked(authService.refreshUserAccessToken).mockRejectedValue(
        serviceError
      );

      await refreshHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(serviceError);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  describe('verifyEmailHandler', () => {
    it('should verify email successfully', async () => {
      const mockCode = new Types.ObjectId().toString();
      mockRequest.params = { code: mockCode };

      vi.mocked(authService.verifyEmail).mockResolvedValue({ user: {} as any });

      await verifyEmailHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(authService.verifyEmail).toHaveBeenCalledWith(mockCode);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Email verified',
      });
    });
  });

  describe('reverifyEmailHandler', () => {
    it('should send verification email', async () => {
      mockRequest.body = { email: 'user@example.com' };

      vi.mocked(authService.sendVerifyEmailLink).mockResolvedValue(undefined);

      await reverifyEmailHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(authService.sendVerifyEmailLink).toHaveBeenCalledWith(
        'user@example.com'
      );
    });

    it('should pass validation error to next() for invalid email', async () => {
      mockRequest.body = { email: 'not-an-email' }; // Invalid email format

      await reverifyEmailHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(authService.sendVerifyEmailLink).not.toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should pass service error to next() for non-existent user', async () => {
      mockRequest.body = { email: 'nonexistent@example.com' };

      const serviceError = new Error('User not found');
      vi.mocked(authService.sendVerifyEmailLink).mockRejectedValue(
        serviceError
      );

      await reverifyEmailHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(serviceError);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should pass service error to next() for already verified email', async () => {
      mockRequest.body = { email: 'verified@example.com' };

      const serviceError = new Error('Email already verified');
      vi.mocked(authService.sendVerifyEmailLink).mockRejectedValue(
        serviceError
      );

      await reverifyEmailHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(serviceError);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  describe('sendPasswordResetHandler', () => {
    it('should send password reset email', async () => {
      mockRequest.body = { email: 'user@example.com' };

      vi.mocked(authService.sendPasswordResetEmail).mockResolvedValue({
        url: 'reset-url',
        emailId: 'email-123',
      });

      await sendPasswordResetHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(authService.sendPasswordResetEmail).toHaveBeenCalled();
    });

    it('should pass validation error to next() for invalid email', async () => {
      mockRequest.body = { email: 'invalid-email' }; // Invalid format

      await sendPasswordResetHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(authService.sendPasswordResetEmail).not.toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should pass validation error to next() for missing email', async () => {
      mockRequest.body = {}; // No email provided

      await sendPasswordResetHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(authService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it('should pass service error to next() for non-existent user', async () => {
      mockRequest.body = { email: 'nonexistent@example.com' };

      const serviceError = new Error('User not found');
      vi.mocked(authService.sendPasswordResetEmail).mockRejectedValue(
        serviceError
      );

      await sendPasswordResetHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(serviceError);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  describe('resetPasswordHandler', () => {
    it('should reset password and clear cookies', async () => {
      mockRequest.body = {
        password: 'NewPassword123!',
        verificationCode: new Types.ObjectId().toString(),
      };

      vi.mocked(authService.resetPassword).mockResolvedValue({
        user: {} as any,
      });
      vi.mocked(cookieUtils.clearAuthCookies).mockReturnValue(
        mockResponse as any
      );

      await resetPasswordHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(authService.resetPassword).toHaveBeenCalled();
      expect(cookieUtils.clearAuthCookies).toHaveBeenCalled();
    });

    it('should pass validation error to next() for short password', async () => {
      mockRequest.body = {
        password: '12345', // Too short
        verificationCode: new Types.ObjectId().toString(),
      };

      await resetPasswordHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(authService.resetPassword).not.toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should pass validation error to next() for missing verification code', async () => {
      mockRequest.body = {
        password: 'NewPassword123!',
        // verificationCode is missing
      };

      await resetPasswordHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(authService.resetPassword).not.toHaveBeenCalled();
    });

    it('should pass validation error to next() for empty verification code', async () => {
      mockRequest.body = {
        password: 'NewPassword123!',
        verificationCode: '', // Empty code
      };

      await resetPasswordHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(authService.resetPassword).not.toHaveBeenCalled();
    });

    it('should pass service error to next() for invalid verification code', async () => {
      mockRequest.body = {
        password: 'NewPassword123!',
        verificationCode: new Types.ObjectId().toString(),
      };

      const serviceError = new Error('Invalid or expired verification code');
      vi.mocked(authService.resetPassword).mockRejectedValue(serviceError);

      await resetPasswordHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(serviceError);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should pass service error to next() for expired reset token', async () => {
      mockRequest.body = {
        password: 'NewPassword123!',
        verificationCode: new Types.ObjectId().toString(),
      };

      const serviceError = new Error('Password reset token has expired');
      vi.mocked(authService.resetPassword).mockRejectedValue(serviceError);

      await resetPasswordHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(serviceError);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should pass validation error to next() for too long password', async () => {
      mockRequest.body = {
        password: 'a'.repeat(300), // Exceeds max length of 255
        verificationCode: new Types.ObjectId().toString(),
      };

      await resetPasswordHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(authService.resetPassword).not.toHaveBeenCalled();
    });
  });
});
