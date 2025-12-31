/**
 * @fileoverview Window Controller Test Suite
 *
 * Tests HTTP request handlers for window management.
 * Covers window retrieval, deletion, validation, and error handling scenarios.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { getWindowsHandler, deleteWindowHandler } from '../window.controller';
import WindowModel from '../../models/window.model';
import * as assertUserRoleSession from '../../utils/assertUserRoleSession';
import * as getUserIdUtil from '../../utils/getUserId';
import * as deleteWindowService from '../../services/window/delete-window.service';
import { OK, NOT_FOUND } from '../../constants/http';
import WindowType from '../../constants/enums_types/windowType';
import AppError from '../../utils/AppError';

vi.mock('../../models/window.model');
vi.mock('../../utils/assertUserRoleSession');
vi.mock('../../utils/getUserId');
vi.mock('../../services/window/delete-window.service');

describe('Window Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: any;
  let mockUserId: mongoose.Types.ObjectId;
  let mockWindowId: mongoose.Types.ObjectId;
  let mockSuhufId: mongoose.Types.ObjectId;

  beforeEach(() => {
    vi.clearAllMocks();

    mockUserId = new mongoose.Types.ObjectId();
    mockWindowId = new mongoose.Types.ObjectId();
    mockSuhufId = new mongoose.Types.ObjectId();

    mockRequest = {
      body: {},
      params: {},
      userId: mockUserId,
      sessionId: new mongoose.Types.ObjectId(),
      role: 'user',
    };

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    mockNext = vi.fn();

    // Default mocks
    vi.mocked(assertUserRoleSession.assertUserAndSession).mockReturnValue(
      undefined
    );
    vi.mocked(getUserIdUtil.getUserId).mockResolvedValue(mockUserId);
  });

  describe('getWindowsHandler', () => {
    it('should retrieve all windows for authenticated user sorted by updatedAt', async () => {
      const mockWindows = [
        {
          _id: mockWindowId,
          userId: mockUserId,
          type: WindowType.Suhuf,
          typeId: {
            _id: mockSuhufId,
            title: 'My Suhuf',
          },
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-02'),
        },
        {
          _id: new mongoose.Types.ObjectId(),
          userId: mockUserId,
          type: WindowType.Suhuf,
          typeId: {
            _id: new mongoose.Types.ObjectId(),
            title: 'Another Suhuf',
          },
          createdAt: new Date('2023-01-03'),
          updatedAt: new Date('2023-01-04'),
        },
      ];

      const mockQuery = {
        sort: vi.fn().mockReturnThis(),
        populate: vi.fn().mockResolvedValue(mockWindows),
      };

      vi.mocked(WindowModel.find).mockReturnValue(mockQuery as any);

      await getWindowsHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(assertUserRoleSession.assertUserAndSession).toHaveBeenCalledWith(
        mockRequest
      );
      expect(getUserIdUtil.getUserId).toHaveBeenCalledWith(mockRequest);
      expect(WindowModel.find).toHaveBeenCalledWith({ userId: mockUserId });
      expect(mockQuery.sort).toHaveBeenCalledWith({ updatedAt: -1 });
      expect(mockQuery.populate).toHaveBeenCalledWith('typeId', 'title _id');
      expect(mockResponse.status).toHaveBeenCalledWith(OK);
      expect(mockResponse.json).toHaveBeenCalledWith(mockWindows);
    });

    it('should return empty array when user has no windows', async () => {
      const mockQuery = {
        sort: vi.fn().mockReturnThis(),
        populate: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(WindowModel.find).mockReturnValue(mockQuery as any);

      await getWindowsHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(OK);
      expect(mockResponse.json).toHaveBeenCalledWith([]);
    });

    it('should handle windows with undefined typeId (deleted references)', async () => {
      const mockWindows = [
        {
          _id: mockWindowId,
          userId: mockUserId,
          type: WindowType.Suhuf,
          typeId: undefined, // Deleted suhuf
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-02'),
        },
      ];

      const mockQuery = {
        sort: vi.fn().mockReturnThis(),
        populate: vi.fn().mockResolvedValue(mockWindows),
      };

      vi.mocked(WindowModel.find).mockReturnValue(mockQuery as any);

      await getWindowsHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(OK);
      expect(mockResponse.json).toHaveBeenCalledWith(mockWindows);
    });

    it('should throw error when user is not authenticated', async () => {
      vi.mocked(assertUserRoleSession.assertUserAndSession).mockImplementation(
        () => {
          throw new AppError(NOT_FOUND, 'User not found');
        }
      );

      await getWindowsHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(NOT_FOUND);
      expect(error.message).toBe('User not found');
      expect(WindowModel.find).not.toHaveBeenCalled();
    });

    it('should throw error when session is not found', async () => {
      vi.mocked(assertUserRoleSession.assertUserAndSession).mockImplementation(
        () => {
          throw new AppError(NOT_FOUND, 'Session not found');
        }
      );

      await getWindowsHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(NOT_FOUND);
      expect(WindowModel.find).not.toHaveBeenCalled();
    });

    it('should throw error when getUserId fails', async () => {
      vi.mocked(getUserIdUtil.getUserId).mockRejectedValue(
        new AppError(NOT_FOUND, 'User not found')
      );

      await getWindowsHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(NOT_FOUND);
    });

    it('should handle database errors gracefully', async () => {
      const dbError = new Error('Database connection failed');
      const mockQuery = {
        sort: vi.fn().mockReturnThis(),
        populate: vi.fn().mockRejectedValue(dbError),
      };

      vi.mocked(WindowModel.find).mockReturnValue(mockQuery as any);

      await getWindowsHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0]).toBe(dbError);
    });

    it('should handle populate errors gracefully', async () => {
      const populateError = new Error('Populate failed');
      const mockQuery = {
        sort: vi.fn().mockReturnThis(),
        populate: vi.fn().mockRejectedValue(populateError),
      };

      vi.mocked(WindowModel.find).mockReturnValue(mockQuery as any);

      await getWindowsHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0]).toBe(populateError);
    });
  });

  describe('deleteWindowHandler', () => {
    beforeEach(() => {
      mockRequest.params = { id: mockWindowId.toString() };
    });

    it('should delete window successfully for authenticated user', async () => {
      vi.mocked(deleteWindowService.deleteWindow).mockResolvedValue(undefined);

      await deleteWindowHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(assertUserRoleSession.assertUserAndSession).toHaveBeenCalledWith(
        mockRequest
      );
      expect(getUserIdUtil.getUserId).toHaveBeenCalledWith(mockRequest);
      expect(deleteWindowService.deleteWindow).toHaveBeenCalledWith(
        mockWindowId.toString(),
        mockUserId
      );
      expect(mockResponse.status).toHaveBeenCalledWith(OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Window deleted successfully',
      });
    });

    it('should throw error when window does not exist', async () => {
      vi.mocked(deleteWindowService.deleteWindow).mockRejectedValue(
        new AppError(NOT_FOUND, 'Window not found')
      );

      await deleteWindowHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(NOT_FOUND);
      expect(error.message).toBe('Window not found');
    });

    it('should throw error when window belongs to another user', async () => {
      vi.mocked(deleteWindowService.deleteWindow).mockRejectedValue(
        new AppError(NOT_FOUND, 'Window not found')
      );

      await deleteWindowHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(NOT_FOUND);
    });

    it('should throw error when user is not authenticated', async () => {
      vi.mocked(assertUserRoleSession.assertUserAndSession).mockImplementation(
        () => {
          throw new AppError(NOT_FOUND, 'User not found');
        }
      );

      await deleteWindowHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(NOT_FOUND);
      expect(deleteWindowService.deleteWindow).not.toHaveBeenCalled();
    });

    it('should throw error when session is not found', async () => {
      vi.mocked(assertUserRoleSession.assertUserAndSession).mockImplementation(
        () => {
          throw new AppError(NOT_FOUND, 'Session not found');
        }
      );

      await deleteWindowHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(AppError);
      expect(deleteWindowService.deleteWindow).not.toHaveBeenCalled();
    });

    it('should handle invalid window ID format', async () => {
      mockRequest.params = { id: 'invalid-id' };

      vi.mocked(deleteWindowService.deleteWindow).mockRejectedValue(
        new Error('Cast to ObjectId failed')
      );

      await deleteWindowHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0]).toBeInstanceOf(Error);
    });

    it('should handle missing window ID parameter', async () => {
      mockRequest.params = {};

      await deleteWindowHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(deleteWindowService.deleteWindow).toHaveBeenCalledWith(
        undefined,
        mockUserId
      );
    });

    it('should handle getUserId failure', async () => {
      vi.mocked(getUserIdUtil.getUserId).mockRejectedValue(
        new AppError(NOT_FOUND, 'User not found')
      );

      await deleteWindowHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(NOT_FOUND);
      expect(deleteWindowService.deleteWindow).not.toHaveBeenCalled();
    });

    it('should handle database errors during deletion', async () => {
      const dbError = new Error('Database connection failed');
      vi.mocked(deleteWindowService.deleteWindow).mockRejectedValue(dbError);

      await deleteWindowHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0]).toBe(dbError);
    });

    it('should delete Suhuf type window and cascade delete associated suhuf', async () => {
      vi.mocked(deleteWindowService.deleteWindow).mockResolvedValue(undefined);

      await deleteWindowHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(deleteWindowService.deleteWindow).toHaveBeenCalledWith(
        mockWindowId.toString(),
        mockUserId
      );
      expect(mockResponse.status).toHaveBeenCalledWith(OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Window deleted successfully',
      });
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    describe('getWindowsHandler edge cases', () => {
      it('should handle large number of windows efficiently', async () => {
        const largeWindowList = Array.from({ length: 1000 }, (_, i) => ({
          _id: new mongoose.Types.ObjectId(),
          userId: mockUserId,
          type: WindowType.Suhuf,
          typeId: {
            _id: new mongoose.Types.ObjectId(),
            title: `Suhuf ${i}`,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        }));

        const mockQuery = {
          sort: vi.fn().mockReturnThis(),
          populate: vi.fn().mockResolvedValue(largeWindowList),
        };

        vi.mocked(WindowModel.find).mockReturnValue(mockQuery as any);

        await getWindowsHandler(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(mockResponse.status).toHaveBeenCalledWith(OK);
        expect(mockResponse.json).toHaveBeenCalledWith(largeWindowList);
      });

      it('should handle null userId gracefully', async () => {
        mockRequest.userId = undefined;

        vi.mocked(
          assertUserRoleSession.assertUserAndSession
        ).mockImplementation(() => {
          throw new AppError(NOT_FOUND, 'User not found');
        });

        await getWindowsHandler(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(mockNext).toHaveBeenCalled();
        expect(WindowModel.find).not.toHaveBeenCalled();
      });

      it('should handle malformed window data from database', async () => {
        const malformedWindows = [
          {
            _id: mockWindowId,
            userId: mockUserId,
            type: 'InvalidType', // Invalid enum
            typeId: mockSuhufId,
          },
        ];

        const mockQuery = {
          sort: vi.fn().mockReturnThis(),
          populate: vi.fn().mockResolvedValue(malformedWindows),
        };

        vi.mocked(WindowModel.find).mockReturnValue(mockQuery as any);

        await getWindowsHandler(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(mockResponse.status).toHaveBeenCalledWith(OK);
        expect(mockResponse.json).toHaveBeenCalledWith(malformedWindows);
      });
    });

    describe('deleteWindowHandler edge cases', () => {
      it('should handle deletion of already deleted window', async () => {
        vi.mocked(deleteWindowService.deleteWindow).mockRejectedValue(
          new AppError(NOT_FOUND, 'Window not found')
        );

        await deleteWindowHandler(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(mockNext).toHaveBeenCalled();
        const error = mockNext.mock.calls[0][0];
        expect(error).toBeInstanceOf(AppError);
        expect(error.statusCode).toBe(NOT_FOUND);
      });

      it('should handle null window ID', async () => {
        mockRequest.params = { id: null as any };

        await deleteWindowHandler(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(deleteWindowService.deleteWindow).toHaveBeenCalledWith(
          null,
          mockUserId
        );
      });

      it('should handle empty string window ID', async () => {
        mockRequest.params = { id: '' };

        vi.mocked(deleteWindowService.deleteWindow).mockRejectedValue(
          new Error('Invalid window ID')
        );

        await deleteWindowHandler(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(mockNext).toHaveBeenCalled();
      });

      it('should handle concurrent deletion attempts', async () => {
        vi.mocked(deleteWindowService.deleteWindow).mockRejectedValue(
          new AppError(NOT_FOUND, 'Window not found')
        );

        const promise1 = deleteWindowHandler(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );
        const promise2 = deleteWindowHandler(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        await Promise.all([promise1, promise2]);

        expect(mockNext).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Authentication and Authorization', () => {
    it('should reject request without userId', async () => {
      mockRequest.userId = undefined;

      vi.mocked(assertUserRoleSession.assertUserAndSession).mockImplementation(
        () => {
          throw new AppError(NOT_FOUND, 'User not found');
        }
      );

      await getWindowsHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(AppError);
    });

    it('should reject request without sessionId', async () => {
      mockRequest.sessionId = undefined;

      vi.mocked(assertUserRoleSession.assertUserAndSession).mockImplementation(
        () => {
          throw new AppError(NOT_FOUND, 'Session not found');
        }
      );

      await deleteWindowHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(AppError);
    });

    it('should reject request without role', async () => {
      mockRequest.role = undefined;

      vi.mocked(assertUserRoleSession.assertUserAndSession).mockImplementation(
        () => {
          throw new AppError(NOT_FOUND, 'Role not found');
        }
      );

      await getWindowsHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(AppError);
    });
  });

  describe('Response Format Validation', () => {
    it('should return correct response format for successful window retrieval', async () => {
      const mockWindows = [
        {
          _id: mockWindowId,
          userId: mockUserId,
          type: WindowType.Suhuf,
          typeId: {
            _id: mockSuhufId,
            title: 'Test Suhuf',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockQuery = {
        sort: vi.fn().mockReturnThis(),
        populate: vi.fn().mockResolvedValue(mockWindows),
      };

      vi.mocked(WindowModel.find).mockReturnValue(mockQuery as any);

      await getWindowsHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            _id: expect.any(mongoose.Types.ObjectId),
            userId: expect.any(mongoose.Types.ObjectId),
            type: expect.any(String),
            typeId: expect.any(Object),
          }),
        ])
      );
    });

    it('should return correct response format for successful deletion', async () => {
      vi.mocked(deleteWindowService.deleteWindow).mockResolvedValue(undefined);

      await deleteWindowHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.any(String),
        })
      );
    });
  });
});
