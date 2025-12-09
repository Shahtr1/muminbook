/**
 * @fileoverview Auth Service Test Suite
 *
 * Tests authentication API service calls including:
 * - Login/logout
 * - Registration
 * - Email verification
 * - Password reset
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  login,
  logout,
  register,
  verifyEmail,
  reverifyEmail,
  sendPasswordResetEmail,
  resetPassword,
} from '../auth.service';
import API from '../../config/apiClient';

vi.mock('../../config/apiClient', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should call POST /auth/login with credentials', async () => {
      const credentials = {
        email: 'user@example.com',
        password: 'Password123!',
      };

      const mockResponse = { data: { message: 'Login successful' } };
      vi.mocked(API.post).mockResolvedValue(mockResponse);

      const result = await login(credentials);

      expect(API.post).toHaveBeenCalledWith('/auth/login', credentials);
      expect(result).toEqual(mockResponse);
    });

    it('should handle login with additional fields', async () => {
      const credentials = {
        email: 'admin@example.com',
        password: 'AdminPass123!',
        rememberMe: true,
      };

      vi.mocked(API.post).mockResolvedValue({ data: {} });

      await login(credentials);

      expect(API.post).toHaveBeenCalledWith('/auth/login', credentials);
    });

    it('should propagate login errors', async () => {
      const error = new Error('Invalid credentials');
      vi.mocked(API.post).mockRejectedValue(error);

      await expect(
        login({ email: 'test@test.com', password: 'wrong' })
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('logout', () => {
    it('should call GET /auth/logout', async () => {
      const mockResponse = { data: { message: 'Logout successful' } };
      vi.mocked(API.get).mockResolvedValue(mockResponse);

      const result = await logout();

      expect(API.get).toHaveBeenCalledWith('/auth/logout');
      expect(result).toEqual(mockResponse);
    });

    it('should handle logout errors', async () => {
      const error = new Error('Logout failed');
      vi.mocked(API.get).mockRejectedValue(error);

      await expect(logout()).rejects.toThrow('Logout failed');
    });
  });

  describe('register', () => {
    it('should call POST /auth/register with user data', async () => {
      const userData = {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        dateOfBirth: new Date('1990-01-01').getTime(),
        gender: 'male',
      };

      const mockResponse = {
        data: {
          _id: '123',
          email: userData.email,
          firstname: userData.firstname,
        },
      };
      vi.mocked(API.post).mockResolvedValue(mockResponse);

      const result = await register(userData);

      expect(API.post).toHaveBeenCalledWith('/auth/register', userData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle registration validation errors', async () => {
      const error = new Error('Email already exists');
      vi.mocked(API.post).mockRejectedValue(error);

      await expect(register({ email: 'existing@example.com' })).rejects.toThrow(
        'Email already exists'
      );
    });
  });

  describe('verifyEmail', () => {
    it('should call GET /auth/email/verify/:code', async () => {
      const verificationCode = 'abc123xyz';
      const mockResponse = { data: { message: 'Email verified' } };
      vi.mocked(API.get).mockResolvedValue(mockResponse);

      const result = await verifyEmail(verificationCode);

      expect(API.get).toHaveBeenCalledWith(
        `/auth/email/verify/${verificationCode}`
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle invalid verification code', async () => {
      const error = new Error('Invalid or expired verification code');
      vi.mocked(API.get).mockRejectedValue(error);

      await expect(verifyEmail('invalid-code')).rejects.toThrow(
        'Invalid or expired verification code'
      );
    });
  });

  describe('reverifyEmail', () => {
    it('should call POST /auth/email/reverify with email', async () => {
      const email = 'user@example.com';
      const mockResponse = { data: { message: 'Verification email sent' } };
      vi.mocked(API.post).mockResolvedValue(mockResponse);

      const result = await reverifyEmail(email);

      expect(API.post).toHaveBeenCalledWith('/auth/email/reverify', { email });
      expect(result).toEqual(mockResponse);
    });

    it('should handle rate limiting', async () => {
      const error = new Error('Too many requests');
      vi.mocked(API.post).mockRejectedValue(error);

      await expect(reverifyEmail('user@example.com')).rejects.toThrow(
        'Too many requests'
      );
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should call POST /auth/password/forgot with email', async () => {
      const email = 'user@example.com';
      const mockResponse = { data: { message: 'Reset email sent' } };
      vi.mocked(API.post).mockResolvedValue(mockResponse);

      const result = await sendPasswordResetEmail(email);

      expect(API.post).toHaveBeenCalledWith('/auth/password/forgot', { email });
      expect(result).toEqual(mockResponse);
    });

    it('should handle non-existent user email', async () => {
      const error = new Error('User not found');
      vi.mocked(API.post).mockRejectedValue(error);

      await expect(
        sendPasswordResetEmail('nonexistent@example.com')
      ).rejects.toThrow('User not found');
    });
  });

  describe('resetPassword', () => {
    it('should call POST /auth/password/reset with code and password', async () => {
      const resetData = {
        verificationCode: 'reset-code-123',
        password: 'NewSecurePass123!',
      };
      const mockResponse = { data: { message: 'Password reset successful' } };
      vi.mocked(API.post).mockResolvedValue(mockResponse);

      const result = await resetPassword(resetData);

      expect(API.post).toHaveBeenCalledWith('/auth/password/reset', resetData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle invalid reset code', async () => {
      const error = new Error('Invalid or expired reset code');
      vi.mocked(API.post).mockRejectedValue(error);

      await expect(
        resetPassword({ verificationCode: 'invalid', password: 'newpass' })
      ).rejects.toThrow('Invalid or expired reset code');
    });

    it('should handle weak password validation', async () => {
      const error = new Error('Password too weak');
      vi.mocked(API.post).mockRejectedValue(error);

      await expect(
        resetPassword({ verificationCode: 'valid', password: '123' })
      ).rejects.toThrow('Password too weak');
    });
  });

  describe('API integration', () => {
    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      vi.mocked(API.post).mockRejectedValue(networkError);

      await expect(login({ email: 'test', password: 'test' })).rejects.toThrow(
        'Network error'
      );
    });

    it('should handle API timeout', async () => {
      const timeoutError = new Error('Request timeout');
      vi.mocked(API.post).mockRejectedValue(timeoutError);

      await expect(register({})).rejects.toThrow('Request timeout');
    });

    it('should preserve response data structure', async () => {
      const mockData = {
        data: {
          user: { id: 1, email: 'test@test.com' },
          token: 'jwt-token',
        },
      };
      vi.mocked(API.post).mockResolvedValue(mockData);

      const result = await login({ email: 'test', password: 'test' });

      expect(result.data).toEqual(mockData.data);
    });
  });

  describe('request validation', () => {
    it('should call API with exact parameters', async () => {
      const loginData = { email: 'exact@test.com', password: 'exact123' };
      vi.mocked(API.post).mockResolvedValue({ data: {} });

      await login(loginData);

      expect(API.post).toHaveBeenCalledTimes(1);
      expect(API.post).toHaveBeenCalledWith('/auth/login', loginData);
    });

    it('should not modify request data', async () => {
      const originalData = { email: 'test@test.com', password: 'pass' };
      const dataCopy = { ...originalData };
      vi.mocked(API.post).mockResolvedValue({ data: {} });

      await login(originalData);

      expect(originalData).toEqual(dataCopy);
    });
  });

  describe('error handling consistency', () => {
    const testCases = [
      { fn: () => login({}), name: 'login' },
      { fn: () => register({}), name: 'register' },
      { fn: () => reverifyEmail(''), name: 'reverifyEmail' },
      { fn: () => sendPasswordResetEmail(''), name: 'sendPasswordResetEmail' },
      { fn: () => resetPassword({}), name: 'resetPassword' },
    ];

    testCases.forEach(({ fn, name }) => {
      it(`should propagate errors from ${name}`, async () => {
        const error = new Error('Service error');
        vi.mocked(API.post).mockRejectedValue(error);

        await expect(fn()).rejects.toThrow('Service error');
      });
    });
  });
});
