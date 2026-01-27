/**
 * @fileoverview Suhuf Controller Test Suite
 *
 * Tests HTTP request handlers for Suhuf management.
 * Covers creation, retrieval, renaming, and configuration of Suhuf.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import {
  configSuhufHandler,
  createSuhufHandler,
  getSuhufHandler,
  renameSuhufHandler,
} from '../suhuf.controller';
import * as createSuhufService from '../../services/suhuf/create-suhuf.service';
import * as renameSuhufService from '../../services/suhuf/rename-suhuf.service';
import SuhufModel from '../../models/suhuf.model';
import * as getUserIdUtil from '../../utils/getUserId';
import { CREATED, OK } from '../../constants/http';
import FileType from '../../constants/types/fileType';
import Direction from '../../constants/types/direction';

vi.mock('../../services/suhuf/create-suhuf.service');
vi.mock('../../services/suhuf/rename-suhuf.service');
vi.mock('../../models/suhuf.model');
vi.mock('../../utils/getUserId');

describe('Suhuf Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: any;
  let mockUserId: mongoose.Types.ObjectId;
  let mockSuhufId: mongoose.Types.ObjectId;
  let mockWindowId: mongoose.Types.ObjectId;

  beforeEach(() => {
    vi.clearAllMocks();

    mockUserId = new mongoose.Types.ObjectId();
    mockSuhufId = new mongoose.Types.ObjectId();
    mockWindowId = new mongoose.Types.ObjectId();

    mockRequest = {
      body: {},
      params: {},
      query: {},
      cookies: {},
      headers: {},
    };

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    mockNext = vi.fn();

    vi.mocked(getUserIdUtil.getUserId).mockResolvedValue(mockUserId);
  });

  describe('createSuhufHandler', () => {
    it('should create a new suhuf with default title', async () => {
      mockRequest.body = {};

      const mockSuhuf = {
        _id: mockSuhufId,
        userId: mockUserId,
        title: 'Untitled Suhuf',
        config: { panels: [], layout: {} },
      };

      const mockWindow = {
        _id: mockWindowId,
        userId: mockUserId,
        type: 'Suhuf',
        typeId: mockSuhufId,
      };

      vi.mocked(createSuhufService.createSuhuf).mockResolvedValue({
        suhuf: mockSuhuf as any,
        window: mockWindow as any,
      });

      await createSuhufHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      expect(getUserIdUtil.getUserId).toHaveBeenCalledWith(mockRequest);
      expect(createSuhufService.createSuhuf).toHaveBeenCalledWith({
        userId: mockUserId,
        title: undefined,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(CREATED);
      expect(mockResponse.json).toHaveBeenCalledWith({
        suhufId: mockSuhufId,
        windowId: mockWindowId,
      });
    });

    it('should create a new suhuf with custom title', async () => {
      const customTitle = 'My Custom Suhuf';
      mockRequest.body = { title: customTitle };

      const mockSuhuf = {
        _id: mockSuhufId,
        userId: mockUserId,
        title: customTitle,
        config: { panels: [], layout: {} },
      };

      const mockWindow = {
        _id: mockWindowId,
        userId: mockUserId,
        type: 'Suhuf',
        typeId: mockSuhufId,
      };

      vi.mocked(createSuhufService.createSuhuf).mockResolvedValue({
        suhuf: mockSuhuf as any,
        window: mockWindow as any,
      });

      await createSuhufHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(createSuhufService.createSuhuf).toHaveBeenCalledWith({
        userId: mockUserId,
        title: customTitle,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(CREATED);
      expect(mockResponse.json).toHaveBeenCalledWith({
        suhufId: mockSuhufId,
        windowId: mockWindowId,
      });
    });

    it('should pass validation error to next() for invalid title', async () => {
      mockRequest.body = { title: 123 }; // Invalid type

      await createSuhufHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(createSuhufService.createSuhuf).not.toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should pass service error to next() when creation fails', async () => {
      const customTitle = 'My Custom Suhuf';
      mockRequest.body = { title: customTitle };

      const serviceError = new Error('Failed to create suhuf');
      vi.mocked(createSuhufService.createSuhuf).mockRejectedValue(serviceError);

      await createSuhufHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(serviceError);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  describe('getSuhufHandler', () => {
    it('should retrieve a suhuf by id', async () => {
      mockRequest.params = { id: mockSuhufId.toString() };

      const mockSuhuf = {
        _id: mockSuhufId,
        userId: mockUserId,
        title: 'Test Suhuf',
        config: {
          panels: [
            {
              fileType: FileType.Reading,
              active: true,
              direction: Direction.Right,
            },
          ],
          layout: {},
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(SuhufModel.findOne).mockResolvedValue(mockSuhuf as any);

      await getSuhufHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(getUserIdUtil.getUserId).toHaveBeenCalledWith(mockRequest);
      expect(SuhufModel.findOne).toHaveBeenCalledWith({
        _id: mockSuhufId,
        userId: mockUserId,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(OK);
      expect(mockResponse.json).toHaveBeenCalledWith(mockSuhuf);
    });
  });

  describe('renameSuhufHandler', () => {
    it('should rename a suhuf successfully', async () => {
      const newTitle = 'Renamed Suhuf';
      mockRequest.params = { id: mockSuhufId.toString() };
      mockRequest.body = { title: newTitle };

      vi.mocked(renameSuhufService.renameSuhuf).mockResolvedValue({
        message: 'Renamed successfully',
      });

      await renameSuhufHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(getUserIdUtil.getUserId).toHaveBeenCalledWith(mockRequest);
      expect(renameSuhufService.renameSuhuf).toHaveBeenCalledWith(
        mockSuhufId.toString(),
        mockUserId,
        newTitle
      );
      expect(mockResponse.status).toHaveBeenCalledWith(OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Renamed successfully',
      });
    });

    it('should pass validation error to next() for invalid title', async () => {
      mockRequest.params = { id: mockSuhufId.toString() };
      mockRequest.body = { title: 'Invalid/Title' }; // Contains forbidden character

      await renameSuhufHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(renameSuhufService.renameSuhuf).not.toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should pass service error to next() when rename fails', async () => {
      const newTitle = 'Renamed Suhuf';
      mockRequest.params = { id: mockSuhufId.toString() };
      mockRequest.body = { title: newTitle };

      const serviceError = new Error('Suhuf not found');
      vi.mocked(renameSuhufService.renameSuhuf).mockRejectedValue(serviceError);

      await renameSuhufHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(renameSuhufService.renameSuhuf).toHaveBeenCalledWith(
        mockSuhufId.toString(),
        mockUserId,
        newTitle
      );
      expect(mockNext).toHaveBeenCalledWith(serviceError);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should pass error to next() when title already exists', async () => {
      const newTitle = 'Existing Suhuf';
      mockRequest.params = { id: mockSuhufId.toString() };
      mockRequest.body = { title: newTitle };

      const conflictError = new Error('A suhuf with this title already exists');
      vi.mocked(renameSuhufService.renameSuhuf).mockRejectedValue(
        conflictError
      );

      await renameSuhufHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(conflictError);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  describe('configSuhufHandler', () => {
    it('should update suhuf layout configuration', async () => {
      mockRequest.params = { id: mockSuhufId.toString() };
      mockRequest.body = {
        layout: {
          leftTab: 'notes',
          isLeftTabOpen: true,
          bottomTab: 'tafsir',
          isBottomTabOpen: false,
          reading: [
            {
              direction: 'left',
              sidebar: 'list',
              sidebarOpen: true,
            },
          ],
        },
      };

      const updatedSuhuf = {
        _id: mockSuhufId,
        userId: mockUserId,
        title: 'Test Suhuf',
        config: {
          layout: mockRequest.body.layout,
          panels: [],
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(SuhufModel.findOneAndUpdate).mockResolvedValue(
        updatedSuhuf as any
      );

      await configSuhufHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(getUserIdUtil.getUserId).toHaveBeenCalledWith(mockRequest);
      expect(SuhufModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: mockSuhufId.toString(), userId: mockUserId },
        { $set: { 'config.layout': mockRequest.body.layout } },
        { new: true }
      );
      expect(mockResponse.status).toHaveBeenCalledWith(OK);
      expect(mockResponse.json).toHaveBeenCalledWith(updatedSuhuf);
    });

    it('should update suhuf panels configuration', async () => {
      mockRequest.params = { id: mockSuhufId.toString() };
      mockRequest.body = {
        panels: [
          {
            fileType: FileType.Reading,
            active: true,
            direction: Direction.Right,
          },
          {
            fileType: FileType.User,
            active: false,
            direction: Direction.Left,
            fileId: 'some-file-id',
          },
        ],
      };

      const updatedSuhuf = {
        _id: mockSuhufId,
        userId: mockUserId,
        title: 'Test Suhuf',
        config: {
          panels: mockRequest.body.panels,
          layout: {},
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(SuhufModel.findOneAndUpdate).mockResolvedValue(
        updatedSuhuf as any
      );

      await configSuhufHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(SuhufModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: mockSuhufId.toString(), userId: mockUserId },
        { $set: { 'config.panels': mockRequest.body.panels } },
        { new: true }
      );
      expect(mockResponse.status).toHaveBeenCalledWith(OK);
      expect(mockResponse.json).toHaveBeenCalledWith(updatedSuhuf);
    });

    it('should update both layout and panels configuration', async () => {
      mockRequest.params = { id: mockSuhufId.toString() };
      mockRequest.body = {
        layout: {
          leftTab: 'notes',
          isLeftTabOpen: true,
          reading: [],
        },
        panels: [
          {
            fileType: FileType.Reading,
            active: true,
            direction: Direction.Right,
          },
        ],
      };

      const updatedSuhuf = {
        _id: mockSuhufId,
        userId: mockUserId,
        title: 'Test Suhuf',
        config: {
          layout: mockRequest.body.layout,
          panels: mockRequest.body.panels,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(SuhufModel.findOneAndUpdate).mockResolvedValue(
        updatedSuhuf as any
      );

      await configSuhufHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(SuhufModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: mockSuhufId.toString(), userId: mockUserId },
        {
          $set: {
            'config.layout': mockRequest.body.layout,
            'config.panels': mockRequest.body.panels,
          },
        },
        { new: true }
      );
      expect(mockResponse.status).toHaveBeenCalledWith(OK);
      expect(mockResponse.json).toHaveBeenCalledWith(updatedSuhuf);
    });

    it('should handle empty body by not updating anything', async () => {
      mockRequest.params = { id: mockSuhufId.toString() };
      mockRequest.body = {};

      const existingSuhuf = {
        _id: mockSuhufId,
        userId: mockUserId,
        title: 'Test Suhuf',
        config: {
          panels: [],
          layout: {},
        },
      };

      vi.mocked(SuhufModel.findOneAndUpdate).mockResolvedValue(
        existingSuhuf as any
      );

      await configSuhufHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(SuhufModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: mockSuhufId.toString(), userId: mockUserId },
        { $set: {} },
        { new: true }
      );
      expect(mockResponse.status).toHaveBeenCalledWith(OK);
      expect(mockResponse.json).toHaveBeenCalledWith(existingSuhuf);
    });

    it('should pass error to next() when suhuf is not found', async () => {
      mockRequest.params = { id: mockSuhufId.toString() };
      mockRequest.body = {
        layout: {
          leftTab: 'notes',
          isLeftTabOpen: true,
        },
      };

      vi.mocked(SuhufModel.findOneAndUpdate).mockResolvedValue(null);

      await configSuhufHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(SuhufModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: mockSuhufId.toString(), userId: mockUserId },
        { $set: { 'config.layout': mockRequest.body.layout } },
        { new: true }
      );
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should pass validation error to next() for invalid panel config', async () => {
      mockRequest.params = { id: mockSuhufId.toString() };
      mockRequest.body = {
        panels: [
          {
            fileType: 'InvalidType', // Invalid enum value
            active: true,
            direction: Direction.Right,
          },
        ],
      };

      await configSuhufHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(SuhufModel.findOneAndUpdate).not.toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should pass error to next() when suhuf belongs to another user', async () => {
      const otherUserId = new mongoose.Types.ObjectId();
      mockRequest.params = { id: mockSuhufId.toString() };
      mockRequest.body = {
        layout: {
          leftTab: 'notes',
          isLeftTabOpen: true,
        },
      };

      vi.mocked(getUserIdUtil.getUserId).mockResolvedValue(otherUserId);
      vi.mocked(SuhufModel.findOneAndUpdate).mockResolvedValue(null);

      await configSuhufHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(SuhufModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: mockSuhufId.toString(), userId: otherUserId },
        { $set: { 'config.layout': mockRequest.body.layout } },
        { new: true }
      );
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should pass validation error to next() for invalid layout config', async () => {
      mockRequest.params = { id: mockSuhufId.toString() };
      mockRequest.body = {
        layout: {
          splitRatio: [150, 50], // Invalid: sum > 100
        },
      };

      await configSuhufHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(SuhufModel.findOneAndUpdate).not.toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });
});
