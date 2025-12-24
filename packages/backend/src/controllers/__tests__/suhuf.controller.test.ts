/**
 * @fileoverview Suhuf Controller Test Suite
 *
 * Tests HTTP request handlers for Suhuf management.
 * Covers creation, retrieval, renaming, and configuration of Suhuf.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import {
  createSuhufHandler,
  getSuhufHandler,
  renameSuhufHandler,
  configSuhufHandler,
} from '../suhuf.controller';
import * as createSuhufService from '../../services/suhuf/create-suhuf.service';
import * as renameSuhufService from '../../services/suhuf/rename-suhuf.service';
import SuhufModel from '../../models/suhuf.model';
import * as assertUserRoleSession from '../../utils/assertUserRoleSession';
import * as getUserIdUtil from '../../utils/getUserId';
import { CREATED, OK } from '../../constants/http';
import FileType from '../../constants/enums/fileType';
import Direction from '../../constants/enums/direction';

vi.mock('../../services/suhuf/create-suhuf.service');
vi.mock('../../services/suhuf/rename-suhuf.service');
vi.mock('../../models/suhuf.model');
vi.mock('../../utils/assertUserRoleSession');
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

    // Default mocks for common utilities
    vi.mocked(assertUserRoleSession.assertUserAndSession).mockReturnValue(
      undefined
    );
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

      expect(assertUserRoleSession.assertUserAndSession).toHaveBeenCalledWith(
        mockRequest
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

      expect(assertUserRoleSession.assertUserAndSession).toHaveBeenCalledWith(
        mockRequest
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

      expect(assertUserRoleSession.assertUserAndSession).toHaveBeenCalledWith(
        mockRequest
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
              id: 'reading-1',
              sidebar: 'translation',
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

      expect(assertUserRoleSession.assertUserAndSession).toHaveBeenCalledWith(
        mockRequest
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
  });
});
