/**
 * @fileoverview Error Handler Middleware Test Suite
 *
 * Tests error handling middleware including:
 * - Zod validation error handling
 * - AppError handling
 * - Generic error handling
 * - Cookie clearing on refresh path
 * - Error logging
 * - Response format validation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { errorHandler } from '../errorHandler.js';
import AppError from '../../utils/AppError.js';
import AppErrorCode from '../../constants/types/appErrorCode.js';
import {
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
  UNAUTHORIZED,
  NOT_FOUND,
  CONFLICT,
} from '../../constants/http.js';
import { REFRESH_PATH } from '../../utils/cookies.js';
import { log } from '../../utils/log.js';

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let consoleErrorSpy: any;
  let jsonMock: any;
  let statusMock: any;
  let sendMock: any;
  let clearCookieMock: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock log.error to prevent test output pollution
    consoleErrorSpy = vi.spyOn(log, 'error').mockImplementation(() => {});

    jsonMock = vi.fn();
    sendMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({
      json: jsonMock,
      send: sendMock,
    });
    clearCookieMock = vi.fn().mockReturnThis();

    mockRequest = {
      path: '/test/path',
    } as Request;

    mockResponse = {
      status: statusMock,
      send: sendMock,
      json: jsonMock,
      clearCookie: clearCookieMock,
    };

    mockNext = vi.fn();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('Zod Validation Errors', () => {
    it('should handle Zod error with single validation issue', () => {
      const zodSchema = z.object({
        email: z.string().email(),
      });

      try {
        zodSchema.parse({ email: 'invalid-email' });
      } catch (error) {
        errorHandler(
          error as Error,
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(statusMock).toHaveBeenCalledWith(BAD_REQUEST);
        expect(jsonMock).toHaveBeenCalledWith({
          message: expect.any(String),
          errors: expect.arrayContaining([
            expect.objectContaining({
              path: 'email',
              message: expect.any(String),
            }),
          ]),
        });
      }
    });

    it('should handle Zod error with multiple validation issues', () => {
      const zodSchema = z.object({
        email: z.string().email(),
        age: z.number().min(18),
        username: z.string().min(3),
      });

      try {
        zodSchema.parse({ email: 'bad', age: 10, username: 'ab' });
      } catch (error) {
        errorHandler(
          error as Error,
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(statusMock).toHaveBeenCalledWith(BAD_REQUEST);
        expect(jsonMock).toHaveBeenCalledWith({
          message: expect.any(String),
          errors: expect.arrayContaining([
            expect.objectContaining({
              path: expect.any(String),
              message: expect.any(String),
            }),
          ]),
        });

        const call = jsonMock.mock.calls[0][0];
        expect(call.errors.length).toBe(3);
      }
    });

    it('should handle Zod error with nested path', () => {
      const zodSchema = z.object({
        user: z.object({
          profile: z.object({
            name: z.string().min(1),
          }),
        }),
      });

      try {
        zodSchema.parse({ user: { profile: { name: '' } } });
      } catch (error) {
        errorHandler(
          error as Error,
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(statusMock).toHaveBeenCalledWith(BAD_REQUEST);
        expect(jsonMock).toHaveBeenCalledWith({
          message: expect.any(String),
          errors: expect.arrayContaining([
            expect.objectContaining({
              path: 'user.profile.name',
              message: expect.any(String),
            }),
          ]),
        });
      }
    });

    it('should handle Zod error with array path', () => {
      const zodSchema = z.object({
        items: z.array(z.object({ id: z.number() })),
      });

      try {
        zodSchema.parse({ items: [{ id: 'not-a-number' }] });
      } catch (error) {
        errorHandler(
          error as Error,
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(statusMock).toHaveBeenCalledWith(BAD_REQUEST);
        expect(jsonMock).toHaveBeenCalledWith({
          message: expect.any(String),
          errors: expect.arrayContaining([
            expect.objectContaining({
              path: expect.stringContaining('items'),
              message: expect.any(String),
            }),
          ]),
        });
      }
    });

    it('should log Zod error with request path', () => {
      (mockRequest as any).path = '/api/users';
      const zodSchema = z.object({ email: z.string().email() });

      try {
        zodSchema.parse({ email: 'invalid' });
      } catch (error) {
        errorHandler(
          error as Error,
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'PATH /api/users',
          expect.any(Error)
        );
      }
    });
  });

  describe('AppError Handling', () => {
    it('should handle AppError with status code and message', () => {
      const error = new AppError(UNAUTHORIZED, 'Not authorized');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(UNAUTHORIZED);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Not authorized',
        errorCode: undefined,
      });
    });

    it('should handle AppError with error code', () => {
      const error = new AppError(
        UNAUTHORIZED,
        'Invalid token',
        AppErrorCode.InvalidAccessToken
      );

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(UNAUTHORIZED);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Invalid token',
        errorCode: AppErrorCode.InvalidAccessToken,
      });
    });

    it('should handle AppError with different status codes', () => {
      const testCases: Array<{ status: number; message: string }> = [
        { status: NOT_FOUND, message: 'Resource not found' },
        { status: CONFLICT, message: 'Resource already exists' },
        { status: BAD_REQUEST, message: 'Invalid request' },
      ];

      testCases.forEach(({ status, message }) => {
        vi.clearAllMocks();
        const error = new AppError(status as any, message);

        errorHandler(
          error,
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(statusMock).toHaveBeenCalledWith(status);
        expect(jsonMock).toHaveBeenCalledWith({
          message,
          errorCode: undefined,
        });
      });
    });

    it('should log AppError with request path', () => {
      (mockRequest as any).path = '/api/protected';
      const error = new AppError(UNAUTHORIZED, 'Forbidden');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'PATH /api/protected',
        error
      );
    });
  });

  describe('Generic Error Handling', () => {
    it('should handle generic Error with 500 status', () => {
      const error = new Error('Something went wrong');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(INTERNAL_SERVER_ERROR);
      expect(sendMock).toHaveBeenCalledWith('Internal Server Error');
    });

    it('should handle Error with empty message', () => {
      const error = new Error('');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(INTERNAL_SERVER_ERROR);
      expect(sendMock).toHaveBeenCalledWith('Internal Server Error');
    });

    it('should handle TypeError', () => {
      const error = new TypeError('Cannot read property of undefined');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(INTERNAL_SERVER_ERROR);
      expect(sendMock).toHaveBeenCalledWith('Internal Server Error');
    });

    it('should handle ReferenceError', () => {
      const error = new ReferenceError('Variable is not defined');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(INTERNAL_SERVER_ERROR);
      expect(sendMock).toHaveBeenCalledWith('Internal Server Error');
    });

    it('should log generic error with request path', () => {
      (mockRequest as any).path = '/api/error';
      const error = new Error('Unexpected error');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith('PATH /api/error', error);
    });
  });

  describe('Refresh Path Cookie Clearing', () => {
    it('should clear auth cookies when error occurs on refresh path', () => {
      (mockRequest as any).path = REFRESH_PATH;
      const error = new Error('Token expired');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(clearCookieMock).toHaveBeenCalledWith('accessToken');
      expect(clearCookieMock).toHaveBeenCalledWith('refreshToken', {
        path: REFRESH_PATH,
      });
    });

    it('should clear auth cookies for AppError on refresh path', () => {
      (mockRequest as any).path = REFRESH_PATH;
      const error = new AppError(
        UNAUTHORIZED,
        'Invalid refresh token',
        AppErrorCode.InvalidAccessToken
      );

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(clearCookieMock).toHaveBeenCalledWith('accessToken');
      expect(clearCookieMock).toHaveBeenCalledWith('refreshToken', {
        path: REFRESH_PATH,
      });
    });

    it('should clear auth cookies for Zod error on refresh path', () => {
      (mockRequest as any).path = REFRESH_PATH;
      const zodSchema = z.object({ token: z.string() });

      try {
        zodSchema.parse({});
      } catch (error) {
        errorHandler(
          error as Error,
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(clearCookieMock).toHaveBeenCalledWith('accessToken');
        expect(clearCookieMock).toHaveBeenCalledWith('refreshToken', {
          path: REFRESH_PATH,
        });
      }
    });

    it('should NOT clear cookies when error occurs on non-refresh path', () => {
      (mockRequest as any).path = '/api/users';
      const error = new Error('Some error');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(clearCookieMock).not.toHaveBeenCalled();
    });

    it('should handle refresh path with trailing slash', () => {
      (mockRequest as any).path = '/auth/refresh/';
      const error = new Error('Token error');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Should not clear cookies as path doesn't exactly match
      expect(clearCookieMock).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle error with no message', () => {
      const error = new Error();

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(INTERNAL_SERVER_ERROR);
      expect(sendMock).toHaveBeenCalledWith('Internal Server Error');
    });

    it('should handle error with very long message', () => {
      const longMessage = 'A'.repeat(10000);
      const error = new Error(longMessage);

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(INTERNAL_SERVER_ERROR);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should handle undefined request path', () => {
      (mockRequest as any).path = undefined;
      const error = new Error('Test error');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'PATH undefined',
        expect.any(Error)
      );
    });

    it('should handle error with additional properties', () => {
      const error: any = new Error('Custom error');
      error.customProperty = 'custom value';
      error.statusCode = 418;

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(INTERNAL_SERVER_ERROR);
    });

    it('should handle multiple errors in sequence', () => {
      const errors = [
        new Error('Error 1'),
        new AppError(NOT_FOUND, 'Not found'),
        new Error('Error 2'),
      ];

      errors.forEach((error) => {
        vi.clearAllMocks();
        errorHandler(
          error,
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(consoleErrorSpy).toHaveBeenCalled();
      });
    });

    it('should not call next() middleware', () => {
      const error = new Error('Test');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle error when response methods throw', () => {
      const error = new Error('Test error');
      mockResponse.status = vi.fn().mockImplementation(() => {
        throw new Error('Response error');
      });

      expect(() => {
        errorHandler(
          error,
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );
      }).toThrow('Response error');
    });
  });

  describe('Response Format Validation', () => {
    it('should return proper JSON format for Zod errors', () => {
      const zodSchema = z.object({ name: z.string() });

      try {
        zodSchema.parse({ name: 123 });
      } catch (error) {
        errorHandler(
          error as Error,
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        const call = jsonMock.mock.calls[0][0];
        expect(call).toHaveProperty('message');
        expect(call).toHaveProperty('errors');
        expect(Array.isArray(call.errors)).toBe(true);
        expect(call.errors[0]).toHaveProperty('path');
        expect(call.errors[0]).toHaveProperty('message');
      }
    });

    it('should return proper JSON format for AppErrors', () => {
      const error = new AppError(
        UNAUTHORIZED,
        'Test message',
        AppErrorCode.InvalidAccessToken
      );

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      const call = jsonMock.mock.calls[0][0];
      expect(call).toHaveProperty('message');
      expect(call).toHaveProperty('errorCode');
      expect(call.message).toBe('Test message');
      expect(call.errorCode).toBe(AppErrorCode.InvalidAccessToken);
    });

    it('should return string for generic errors', () => {
      const error = new Error('Generic error');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(sendMock).toHaveBeenCalledWith('Internal Server Error');
      expect(typeof sendMock.mock.calls[0][0]).toBe('string');
    });
  });

  describe('Error Priority and Fall-through', () => {
    it('should handle Zod error before AppError check', () => {
      const zodSchema = z.object({ email: z.string().email() });

      try {
        zodSchema.parse({ email: 'invalid' });
      } catch (error) {
        errorHandler(
          error as Error,
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(statusMock).toHaveBeenCalledWith(BAD_REQUEST);
        expect(jsonMock).toHaveBeenCalled();
        // Should not reach AppError handler or generic handler
        expect(sendMock).not.toHaveBeenCalledWith('Internal Server Error');
      }
    });

    it('should handle AppError before generic error check', () => {
      const error = new AppError(NOT_FOUND, 'Resource not found');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(NOT_FOUND);
      expect(jsonMock).toHaveBeenCalled();
      // Should not reach generic handler
      expect(sendMock).not.toHaveBeenCalledWith('Internal Server Error');
    });

    it('should only reach generic handler for non-Zod, non-AppError errors', () => {
      const error = new TypeError('Type error');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(INTERNAL_SERVER_ERROR);
      expect(sendMock).toHaveBeenCalledWith('Internal Server Error');
      // Should not call json
      expect(jsonMock).not.toHaveBeenCalled();
    });
  });

  describe('Console Logging', () => {
    it('should always log errors to console', () => {
      const error = new Error('Test error');
      (mockRequest as any).path = '/test';

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith('PATH /test', error);
    });

    it('should log with correct path for all error quran-division', () => {
      const testCases = [
        { error: new Error('Generic'), path: '/generic' },
        { error: new AppError(NOT_FOUND, 'Not found'), path: '/notfound' },
      ];

      testCases.forEach(({ error, path }) => {
        vi.clearAllMocks();
        (mockRequest as any).path = path;

        errorHandler(
          error,
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(consoleErrorSpy).toHaveBeenCalledWith(`PATH ${path}`, error);
      });
    });
  });
});
