/**
 * @fileoverview Cookie Utilities Test Suite
 *
 * Tests cookie configuration and management utilities for authentication.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Response } from 'express';
import {
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
  setAuthCookies,
  clearAuthCookies,
  REFRESH_PATH,
} from '../cookies.js';

describe('Cookie Utilities', () => {
  describe('getAccessTokenCookieOptions', () => {
    it('should return cookie options with correct properties', () => {
      const options = getAccessTokenCookieOptions();

      expect(options).toHaveProperty('sameSite');
      expect(options).toHaveProperty('httpOnly', true);
      expect(options).toHaveProperty('secure');
      expect(options).toHaveProperty('expires');
    });

    it('should set expires to 15 minutes from now', () => {
      const before = new Date();
      const options = getAccessTokenCookieOptions();
      const after = new Date();

      expect(options.expires).toBeInstanceOf(Date);

      // Check if expires is approximately 15 minutes from now (with 1 second tolerance)
      const expectedExpires = new Date(before.getTime() + 15 * 60 * 1000);
      const timeDiff = Math.abs(
        options.expires!.getTime() - expectedExpires.getTime()
      );
      expect(timeDiff).toBeLessThan(1000); // Less than 1 second difference
    });

    it('should have httpOnly set to true for security', () => {
      const options = getAccessTokenCookieOptions();
      expect(options.httpOnly).toBe(true);
    });
  });

  describe('getRefreshTokenCookieOptions', () => {
    it('should return cookie options with correct properties', () => {
      const options = getRefreshTokenCookieOptions();

      expect(options).toHaveProperty('sameSite');
      expect(options).toHaveProperty('httpOnly', true);
      expect(options).toHaveProperty('secure');
      expect(options).toHaveProperty('expires');
      expect(options).toHaveProperty('path', REFRESH_PATH);
    });

    it('should set expires to 30 days from now', () => {
      const before = new Date();
      const options = getRefreshTokenCookieOptions();
      const after = new Date();

      expect(options.expires).toBeInstanceOf(Date);

      // Check if expires is approximately 30 days from now (with 1 second tolerance)
      const expectedExpires = new Date(
        before.getTime() + 30 * 24 * 60 * 60 * 1000
      );
      const timeDiff = Math.abs(
        options.expires!.getTime() - expectedExpires.getTime()
      );
      expect(timeDiff).toBeLessThan(1000); // Less than 1 second difference
    });

    it('should have path set to REFRESH_PATH', () => {
      const options = getRefreshTokenCookieOptions();
      expect(options.path).toBe(REFRESH_PATH);
      expect(options.path).toBe('/auth/refresh');
    });

    it('should have httpOnly set to true for security', () => {
      const options = getRefreshTokenCookieOptions();
      expect(options.httpOnly).toBe(true);
    });
  });

  describe('setAuthCookies', () => {
    let mockResponse: Partial<Response>;
    let cookieSpy: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      cookieSpy = vi.fn().mockReturnThis();
      mockResponse = {
        cookie: cookieSpy,
      };
    });

    it('should set both access and refresh token cookies', () => {
      const accessToken = 'mock-access-token';
      const refreshToken = 'mock-refresh-token';

      setAuthCookies({
        res: mockResponse as Response,
        accessToken,
        refreshToken,
      });

      expect(cookieSpy).toHaveBeenCalledTimes(2);

      // Check accessToken cookie
      expect(cookieSpy).toHaveBeenNthCalledWith(
        1,
        'accessToken',
        accessToken,
        expect.objectContaining({
          httpOnly: true,
          expires: expect.any(Date),
        })
      );

      // Check refreshToken cookie
      expect(cookieSpy).toHaveBeenNthCalledWith(
        2,
        'refreshToken',
        refreshToken,
        expect.objectContaining({
          httpOnly: true,
          expires: expect.any(Date),
          path: REFRESH_PATH,
        })
      );
    });

    it('should return the response object for chaining', () => {
      const result = setAuthCookies({
        res: mockResponse as Response,
        accessToken: 'token1',
        refreshToken: 'token2',
      });

      expect(result).toBe(mockResponse);
    });

    it('should handle empty token strings', () => {
      setAuthCookies({
        res: mockResponse as Response,
        accessToken: '',
        refreshToken: '',
      });

      expect(cookieSpy).toHaveBeenCalledTimes(2);
      expect(cookieSpy).toHaveBeenCalledWith(
        'accessToken',
        '',
        expect.any(Object)
      );
      expect(cookieSpy).toHaveBeenCalledWith(
        'refreshToken',
        '',
        expect.any(Object)
      );
    });
  });

  describe('clearAuthCookies', () => {
    let mockResponse: Partial<Response>;
    let clearCookieSpy: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      clearCookieSpy = vi.fn().mockReturnThis();
      mockResponse = {
        clearCookie: clearCookieSpy,
      };
    });

    it('should clear both access and refresh token cookies', () => {
      clearAuthCookies(mockResponse as Response);

      expect(clearCookieSpy).toHaveBeenCalledTimes(2);

      // Check accessToken cleared
      expect(clearCookieSpy).toHaveBeenNthCalledWith(1, 'accessToken');

      // Check refreshToken cleared with path
      expect(clearCookieSpy).toHaveBeenNthCalledWith(2, 'refreshToken', {
        path: REFRESH_PATH,
      });
    });

    it('should return the response object for chaining', () => {
      const result = clearAuthCookies(mockResponse as Response);
      expect(result).toBe(mockResponse);
    });

    it('should clear refresh token with correct path', () => {
      clearAuthCookies(mockResponse as Response);

      const refreshTokenCall = clearCookieSpy.mock.calls.find(
        (call) => call[0] === 'refreshToken'
      );

      expect(refreshTokenCall).toBeDefined();
      expect(refreshTokenCall![1]).toEqual({ path: REFRESH_PATH });
    });
  });

  describe('REFRESH_PATH constant', () => {
    it('should be defined correctly', () => {
      expect(REFRESH_PATH).toBe('/auth/refresh');
    });
  });

  describe('security configurations', () => {
    it('should configure httpOnly for both token types', () => {
      const accessOptions = getAccessTokenCookieOptions();
      const refreshOptions = getRefreshTokenCookieOptions();

      expect(accessOptions.httpOnly).toBe(true);
      expect(refreshOptions.httpOnly).toBe(true);
    });

    it('should have sameSite configured', () => {
      const accessOptions = getAccessTokenCookieOptions();
      const refreshOptions = getRefreshTokenCookieOptions();

      expect(accessOptions.sameSite).toBeDefined();
      expect(refreshOptions.sameSite).toBeDefined();
    });

    it('should have secure flag configured', () => {
      const accessOptions = getAccessTokenCookieOptions();
      const refreshOptions = getRefreshTokenCookieOptions();

      expect(accessOptions).toHaveProperty('secure');
      expect(refreshOptions).toHaveProperty('secure');
    });
  });
});
