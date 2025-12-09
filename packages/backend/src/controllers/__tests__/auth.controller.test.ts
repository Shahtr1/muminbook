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
} from '../auth.controller';
import * as authService from '../../services/auth.service';
import * as cookieUtils from '../../utils/cookies';
import { verifyToken } from '../../utils/jwt';
import SessionModel from '../../models/session.model';
import { Types } from 'mongoose';
import { CREATED, OK } from '../../constants/http';
import { UserDocument } from '../../models/user.model';

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
  });
});
