/**
 * @fileoverview CatchErrors Wrapper Test Suite
 *
 * Tests the async error handling wrapper for Express controllers.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import catchErrors from '../catchErrors.js';
import { Request, Response, NextFunction } from 'express';

describe('catchErrors', () => {
  const mockRequest = {} as Request;
  const mockResponse = {} as Response;
  const mockNext = vi.fn() as NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('successful controller execution', () => {
    it('should execute controller without errors', async () => {
      const controller = vi.fn().mockResolvedValue({ success: true });
      const wrappedController = catchErrors(controller);

      await wrappedController(mockRequest, mockResponse, mockNext);

      expect(controller).toHaveBeenCalledWith(
        mockRequest,
        mockResponse,
        mockNext
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should execute controller and allow it to handle response', async () => {
      const expectedData = { id: 1, name: 'Test' };
      const controller = vi.fn().mockResolvedValue(expectedData);
      const wrappedController = catchErrors(controller);

      await wrappedController(mockRequest, mockResponse, mockNext);

      // Verify controller was called and executed successfully
      expect(controller).toHaveBeenCalledWith(
        mockRequest,
        mockResponse,
        mockNext
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle void controllers', async () => {
      const controller = vi.fn().mockResolvedValue(undefined);
      const wrappedController = catchErrors(controller);

      await wrappedController(mockRequest, mockResponse, mockNext);

      expect(controller).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should catch and pass errors to next()', async () => {
      const error = new Error('Test error');
      const controller = vi.fn().mockRejectedValue(error);
      const wrappedController = catchErrors(controller);

      await wrappedController(mockRequest, mockResponse, mockNext);

      expect(controller).toHaveBeenCalledWith(
        mockRequest,
        mockResponse,
        mockNext
      );
      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle custom error objects', async () => {
      const customError = {
        statusCode: 400,
        message: 'Bad Request',
        errorCode: 'INVALID_INPUT',
      };
      const controller = vi.fn().mockRejectedValue(customError);
      const wrappedController = catchErrors(controller);

      await wrappedController(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(customError);
    });

    it('should handle string errors', async () => {
      const error = 'String error message';
      const controller = vi.fn().mockRejectedValue(error);
      const wrappedController = catchErrors(controller);

      await wrappedController(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle synchronous errors thrown in async function', async () => {
      const error = new Error('Synchronous error');
      const controller = vi.fn().mockImplementation(() => {
        throw error;
      });
      const wrappedController = catchErrors(controller);

      await wrappedController(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('controller arguments', () => {
    it('should pass all arguments to the wrapped controller', async () => {
      const controller = vi.fn().mockResolvedValue(null);
      const wrappedController = catchErrors(controller);

      const req = { body: { test: 'data' } } as Request;
      const res = { json: vi.fn() } as unknown as Response;
      const next = vi.fn() as NextFunction;

      await wrappedController(req, res, next);

      expect(controller).toHaveBeenCalledWith(req, res, next);
    });

    it('should preserve request context', async () => {
      let capturedReq: Request | null = null;

      const controller = vi.fn().mockImplementation(async (req) => {
        capturedReq = req;
      });

      const wrappedController = catchErrors(controller);
      const testReq = { user: { id: '123' } } as unknown as Request;

      await wrappedController(testReq, mockResponse, mockNext);

      expect(capturedReq).toBe(testReq);
      if (capturedReq) {
        expect(capturedReq['user']).toEqual({ id: '123' });
      }
    });
  });

  describe('real-world scenarios', () => {
    it('should handle database query errors', async () => {
      const dbError = new Error('Database connection failed');
      const controller = vi.fn().mockRejectedValue(dbError);
      const wrappedController = catchErrors(controller);

      await wrappedController(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(dbError);
    });

    it('should handle validation errors', async () => {
      const validationError = {
        name: 'ValidationError',
        message: 'Invalid email format',
      };
      const controller = vi.fn().mockRejectedValue(validationError);
      const wrappedController = catchErrors(controller);

      await wrappedController(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(validationError);
    });

    it('should handle authentication errors', async () => {
      const authError = new Error('Invalid token');
      const controller = vi.fn().mockRejectedValue(authError);
      const wrappedController = catchErrors(controller);

      await wrappedController(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(authError);
    });
  });
});
