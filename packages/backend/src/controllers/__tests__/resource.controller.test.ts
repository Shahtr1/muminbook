/**
 * @fileoverview Resource Controller Test Suite
 *
 * Tests HTTP request handlers for resource management (files/folders).
 * Covers CRUD operations, trash management, and resource operations.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import {
  copyResourceHandler,
  createResourceHandler,
  deleteResourceHandler,
  emptyTrashHandler,
  getOverviewHandler,
  getResourceHandler,
  getTrashedResourcesHandler,
  isMyFilesEmptyHandler,
  isTrashEmptyHandler,
  moveResourceHandler,
  moveToTrashResourceHandler,
  renameResourceHandler,
  restoreAllResourceHandler,
  restoreResourceHandler,
  togglePinResourceHandler,
  updateAccessedAtHandler,
} from '../resource.controller.js';
import { CREATED, OK } from '../../constants/http.js';
import ResourceType from '../../constants/types/resourceType.js';
import * as resourceService from '../../services/resource/index.js';
import * as resourceIsMyFilesEmptyService from '../../services/resource/isMyFilesEmpty-resource.service.js';
import * as resourceOverviewService from '../../services/resource/overview.service.js';
import * as resourceIsTrashEmptyService from '../../services/resource/trash/isTrashEmpty-resource.service.js';
import * as getUserIdUtil from '../../utils/getUserId.js';

vi.mock('../../services/resource');
vi.mock('../../services/resource/isMyFilesEmpty-resource.service');
vi.mock('../../services/resource/overview.service');
vi.mock('../../services/resource/trash/isTrashEmpty-resource.service');
vi.mock('../../utils/getUserId');

describe('Resource Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: any;
  let mockUserId: mongoose.Types.ObjectId;
  let mockResourceId: mongoose.Types.ObjectId;

  beforeEach(() => {
    vi.clearAllMocks();

    mockUserId = new mongoose.Types.ObjectId();
    mockResourceId = new mongoose.Types.ObjectId();

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

  describe('getResourceHandler', () => {
    it('should get resource children for a given path', async () => {
      const mockPath = '/folder1/folder2';
      const mockChildren = [
        {
          _id: new mongoose.Types.ObjectId(),
          name: 'file1.txt',
          type: ResourceType.File,
          path: mockPath,
        },
        {
          _id: new mongoose.Types.ObjectId(),
          name: 'folder3',
          type: ResourceType.Folder,
          path: mockPath,
        },
      ];

      mockRequest.query = { path: mockPath };

      vi.mocked(resourceService.getResourceChildren).mockResolvedValue(
        mockChildren as any
      );

      await getResourceHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(getUserIdUtil.getUserId).toHaveBeenCalledWith(mockRequest);
      expect(resourceService.getResourceChildren).toHaveBeenCalledWith(
        mockPath,
        mockUserId
      );
      expect(mockResponse.status).toHaveBeenCalledWith(OK);
      expect(mockResponse.json).toHaveBeenCalledWith(mockChildren);
    });

    it('should handle root path', async () => {
      mockRequest.query = { path: '/' };

      vi.mocked(resourceService.getResourceChildren).mockResolvedValue([]);

      await getResourceHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(resourceService.getResourceChildren).toHaveBeenCalledWith(
        '/',
        mockUserId
      );
      expect(mockResponse.status).toHaveBeenCalledWith(OK);
    });
  });

  describe('createResourceHandler', () => {
    it('should create a new folder resource', async () => {
      const resourceData = {
        name: 'New Folder',
        type: ResourceType.Folder,
        path: '/documents',
      };

      mockRequest.body = resourceData;

      const mockCreatedResource = {
        _id: mockResourceId,
        ...resourceData,
        userId: mockUserId,
      };

      vi.mocked(resourceService.createResource).mockResolvedValue(
        mockCreatedResource as any
      );

      await createResourceHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(getUserIdUtil.getUserId).toHaveBeenCalledWith(mockRequest);
      expect(resourceService.createResource).toHaveBeenCalledWith(
        {
          ...resourceData,
          type: ResourceType.Folder,
        },
        mockUserId
      );
      expect(mockResponse.status).toHaveBeenCalledWith(CREATED);
      expect(mockResponse.json).toHaveBeenCalledWith(mockCreatedResource);
    });

    it('should create a new file resource', async () => {
      const resourceData = {
        name: 'document.pdf',
        type: ResourceType.File,
        path: '/documents',
        fileUrl: 'https://example.com/file.pdf',
        contentType: 'application/pdf',
      };

      mockRequest.body = resourceData;

      const mockCreatedResource = {
        _id: mockResourceId,
        ...resourceData,
        userId: mockUserId,
      };

      vi.mocked(resourceService.createResource).mockResolvedValue(
        mockCreatedResource as any
      );

      await createResourceHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(resourceService.createResource).toHaveBeenCalledWith(
        {
          name: resourceData.name,
          type: ResourceType.File,
          path: resourceData.path,
          fileUrl: resourceData.fileUrl,
          contentType: resourceData.contentType,
        },
        mockUserId
      );
      expect(mockResponse.status).toHaveBeenCalledWith(CREATED);
    });

    it('should pass validation error to next() for invalid resource name', async () => {
      mockRequest.body = {
        name: 'invalid/name', // Contains forbidden character
        type: ResourceType.Folder,
        path: '/documents',
      };

      await createResourceHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(resourceService.createResource).not.toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should pass validation error to next() for invalid resource type', async () => {
      mockRequest.body = {
        name: 'New Resource',
        type: 'invalid-type', // Invalid enum value
        path: '/documents',
      };

      await createResourceHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(resourceService.createResource).not.toHaveBeenCalled();
    });

    it('should pass validation error to next() for missing name', async () => {
      mockRequest.body = {
        type: ResourceType.Folder,
        path: '/documents',
      };

      await createResourceHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(resourceService.createResource).not.toHaveBeenCalled();
    });

    it('should pass validation error to next() for invalid file URL', async () => {
      mockRequest.body = {
        name: 'document.pdf',
        type: ResourceType.File,
        path: '/documents',
        fileUrl: 'not-a-valid-url', // Invalid URL
      };

      await createResourceHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(resourceService.createResource).not.toHaveBeenCalled();
    });

    it('should pass service error to next() when resource already exists', async () => {
      mockRequest.body = {
        name: 'Existing Folder',
        type: ResourceType.Folder,
        path: '/documents',
      };

      const serviceError = new Error('Resource with this name already exists');
      vi.mocked(resourceService.createResource).mockRejectedValue(serviceError);

      await createResourceHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(serviceError);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should pass validation error to next() for name with leading/trailing spaces', async () => {
      mockRequest.body = {
        name: ' Folder with spaces ',
        type: ResourceType.Folder,
        path: '/documents',
      };

      await createResourceHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(resourceService.createResource).not.toHaveBeenCalled();
    });
  });

  describe('deleteResourceHandler', () => {
    it('should permanently delete a resource', async () => {
      mockRequest.params = { id: mockResourceId.toString() };

      vi.mocked(resourceService.deleteResource).mockResolvedValue(undefined);

      await deleteResourceHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(getUserIdUtil.getUserId).toHaveBeenCalledWith(mockRequest);
      expect(resourceService.deleteResource).toHaveBeenCalledWith(
        mockResourceId,
        mockUserId
      );
      expect(mockResponse.status).toHaveBeenCalledWith(OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Deleted successfully',
      });
    });
  });

  describe('moveToTrashResourceHandler', () => {
    it('should move a resource to trash', async () => {
      mockRequest.params = { id: mockResourceId.toString() };

      vi.mocked(resourceService.moveToTrashResource).mockResolvedValue(
        undefined
      );

      await moveToTrashResourceHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(getUserIdUtil.getUserId).toHaveBeenCalledWith(mockRequest);
      expect(resourceService.moveToTrashResource).toHaveBeenCalledWith(
        mockResourceId,
        mockUserId
      );
      expect(mockResponse.status).toHaveBeenCalledWith(OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Moved to trash successfully',
      });
    });

    it('should pass error to next() for invalid resource ID', async () => {
      mockRequest.params = { id: 'invalid-id' };

      await moveToTrashResourceHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should pass service error to next() for already trashed resource', async () => {
      mockRequest.params = { id: mockResourceId.toString() };

      const serviceError = new Error('Resource is already in trash');
      vi.mocked(resourceService.moveToTrashResource).mockRejectedValue(
        serviceError
      );

      await moveToTrashResourceHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(serviceError);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should pass service error to next() for non-existent resource', async () => {
      mockRequest.params = { id: mockResourceId.toString() };

      const serviceError = new Error('Resource not found');
      vi.mocked(resourceService.moveToTrashResource).mockRejectedValue(
        serviceError
      );

      await moveToTrashResourceHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(serviceError);
    });
  });

  describe('restoreResourceHandler', () => {
    it('should restore a trashed resource', async () => {
      mockRequest.params = { id: mockResourceId.toString() };

      const mockRestoreResponse = {
        message: 'Resource restored successfully',
      };

      vi.mocked(resourceService.restoreResource).mockResolvedValue(
        mockRestoreResponse
      );

      await restoreResourceHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(getUserIdUtil.getUserId).toHaveBeenCalledWith(mockRequest);
      expect(resourceService.restoreResource).toHaveBeenCalledWith(
        mockResourceId,
        mockUserId
      );
      expect(mockResponse.status).toHaveBeenCalledWith(OK);
      expect(mockResponse.json).toHaveBeenCalledWith(mockRestoreResponse);
    });
  });

  describe('restoreAllResourceHandler', () => {
    it('should restore all trashed resources', async () => {
      const mockRestoreAllResponse = {
        message: 'All resources restored successfully',
      };

      vi.mocked(resourceService.restoreAllResources).mockResolvedValue(
        mockRestoreAllResponse
      );

      await restoreAllResourceHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(getUserIdUtil.getUserId).toHaveBeenCalledWith(mockRequest);
      expect(resourceService.restoreAllResources).toHaveBeenCalledWith(
        mockUserId
      );
      expect(mockResponse.status).toHaveBeenCalledWith(OK);
      expect(mockResponse.json).toHaveBeenCalledWith(mockRestoreAllResponse);
    });

    it('should pass service error to next() when restore fails', async () => {
      const serviceError = new Error('Failed to restore some resources');
      vi.mocked(resourceService.restoreAllResources).mockRejectedValue(
        serviceError
      );

      await restoreAllResourceHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(serviceError);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should handle when trash is empty', async () => {
      vi.mocked(resourceService.restoreAllResources).mockResolvedValue({
        message: 'No resources to restore',
      });

      await restoreAllResourceHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'No resources to restore',
      });
    });
  });

  describe('getTrashedResourcesHandler', () => {
    it('should get all trashed resources', async () => {
      const mockTrashedResources = [
        {
          _id: new mongoose.Types.ObjectId(),
          name: 'deleted-file.txt',
          type: ResourceType.File,
          isTrashed: true,
        },
        {
          _id: new mongoose.Types.ObjectId(),
          name: 'deleted-folder',
          type: ResourceType.Folder,
          isTrashed: true,
        },
      ];

      vi.mocked(resourceService.getTrashedResources).mockResolvedValue(
        mockTrashedResources as any
      );

      await getTrashedResourcesHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(getUserIdUtil.getUserId).toHaveBeenCalledWith(mockRequest);
      expect(resourceService.getTrashedResources).toHaveBeenCalledWith(
        mockUserId
      );
      expect(mockResponse.status).toHaveBeenCalledWith(OK);
      expect(mockResponse.json).toHaveBeenCalledWith(mockTrashedResources);
    });

    it('should return empty array when no trashed resources', async () => {
      vi.mocked(resourceService.getTrashedResources).mockResolvedValue([]);

      await getTrashedResourcesHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith([]);
    });
  });

  describe('emptyTrashHandler', () => {
    it('should permanently delete all trashed resources', async () => {
      vi.mocked(
        resourceService.permanentlyDeleteTrashedResources
      ).mockResolvedValue(undefined);

      await emptyTrashHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(getUserIdUtil.getUserId).toHaveBeenCalledWith(mockRequest);
      expect(
        resourceService.permanentlyDeleteTrashedResources
      ).toHaveBeenCalledWith(mockUserId);
      expect(mockResponse.status).toHaveBeenCalledWith(OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Trash emptied successfully',
      });
    });
  });

  describe('renameResourceHandler', () => {
    it('should rename a resource', async () => {
      const newName = 'renamed-file.txt';
      mockRequest.params = { id: mockResourceId.toString() };
      mockRequest.body = { name: newName };

      const mockRenamedResource = {
        _id: mockResourceId,
        name: newName,
        type: ResourceType.File,
      };

      vi.mocked(resourceService.renameResource).mockResolvedValue(
        mockRenamedResource as any
      );

      await renameResourceHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(getUserIdUtil.getUserId).toHaveBeenCalledWith(mockRequest);
      expect(resourceService.renameResource).toHaveBeenCalledWith(
        mockResourceId,
        newName,
        mockUserId
      );
      expect(mockResponse.status).toHaveBeenCalledWith(OK);
      expect(mockResponse.json).toHaveBeenCalledWith(mockRenamedResource);
    });

    it('should pass validation error to next() for invalid name with forbidden characters', async () => {
      const invalidName = 'invalid/name';
      mockRequest.params = { id: mockResourceId.toString() };
      mockRequest.body = { name: invalidName };

      await renameResourceHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(resourceService.renameResource).not.toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should pass validation error to next() for empty name', async () => {
      mockRequest.params = { id: mockResourceId.toString() };
      mockRequest.body = { name: '' };

      await renameResourceHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(resourceService.renameResource).not.toHaveBeenCalled();
    });

    it('should pass validation error to next() for name with leading/trailing spaces', async () => {
      mockRequest.params = { id: mockResourceId.toString() };
      mockRequest.body = { name: ' file.txt ' };

      await renameResourceHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(resourceService.renameResource).not.toHaveBeenCalled();
    });

    it('should pass error to next() for invalid resource ID', async () => {
      mockRequest.params = { id: 'invalid-id' };
      mockRequest.body = { name: 'valid-name.txt' };

      await renameResourceHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0]).toBeInstanceOf(Error);
    });

    it('should pass service error to next() when name already exists', async () => {
      mockRequest.params = { id: mockResourceId.toString() };
      mockRequest.body = { name: 'existing-name.txt' };

      const serviceError = new Error(
        'A resource with this name already exists'
      );
      vi.mocked(resourceService.renameResource).mockRejectedValue(serviceError);

      await renameResourceHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(serviceError);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should pass service error to next() for non-existent resource', async () => {
      mockRequest.params = { id: mockResourceId.toString() };
      mockRequest.body = { name: 'new-name.txt' };

      const serviceError = new Error('Resource not found');
      vi.mocked(resourceService.renameResource).mockRejectedValue(serviceError);

      await renameResourceHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(serviceError);
    });
  });

  describe('moveResourceHandler', () => {
    it('should move a resource to a new destination', async () => {
      const destinationPath = '/documents/projects';
      mockRequest.params = { id: mockResourceId.toString() };
      mockRequest.body = { destinationPath };

      const mockMovedResource = {
        _id: mockResourceId,
        name: 'file.txt',
        path: destinationPath,
      };

      vi.mocked(resourceService.moveResource).mockResolvedValue(
        mockMovedResource as any
      );

      await moveResourceHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(getUserIdUtil.getUserId).toHaveBeenCalledWith(mockRequest);
      expect(resourceService.moveResource).toHaveBeenCalledWith(
        mockResourceId,
        destinationPath,
        mockUserId
      );
      expect(mockResponse.status).toHaveBeenCalledWith(OK);
      expect(mockResponse.json).toHaveBeenCalledWith(mockMovedResource);
    });

    it('should move a resource to root path', async () => {
      const destinationPath = '/';
      mockRequest.params = { id: mockResourceId.toString() };
      mockRequest.body = { destinationPath };

      const mockMovedResource = {
        _id: mockResourceId,
        name: 'file.txt',
        path: destinationPath,
      };

      vi.mocked(resourceService.moveResource).mockResolvedValue(
        mockMovedResource as any
      );

      await moveResourceHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(resourceService.moveResource).toHaveBeenCalledWith(
        mockResourceId,
        '/',
        mockUserId
      );
      expect(mockResponse.status).toHaveBeenCalledWith(OK);
    });
  });

  describe('copyResourceHandler', () => {
    it('should copy a resource to a new destination', async () => {
      const destinationPath = '/documents/backup';
      mockRequest.params = { id: mockResourceId.toString() };
      mockRequest.body = { destinationPath };

      const mockCopiedResourceId = new mongoose.Types.ObjectId();
      const mockCopiedResource = {
        _id: mockCopiedResourceId,
        name: 'file (copy).txt',
        path: destinationPath,
      };

      vi.mocked(resourceService.copyResource).mockResolvedValue(
        mockCopiedResource as any
      );

      await copyResourceHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(getUserIdUtil.getUserId).toHaveBeenCalledWith(mockRequest);
      expect(resourceService.copyResource).toHaveBeenCalledWith(
        mockResourceId,
        destinationPath,
        mockUserId
      );
      expect(mockResponse.status).toHaveBeenCalledWith(OK);
      expect(mockResponse.json).toHaveBeenCalledWith(mockCopiedResource);
    });

    it('should pass validation error to next() for empty destination path', async () => {
      mockRequest.params = { id: mockResourceId.toString() };
      mockRequest.body = { destinationPath: '' };

      await copyResourceHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(resourceService.copyResource).not.toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should pass validation error to next() for missing destination path', async () => {
      mockRequest.params = { id: mockResourceId.toString() };
      mockRequest.body = {};

      await copyResourceHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(resourceService.copyResource).not.toHaveBeenCalled();
    });

    it('should pass error to next() for invalid resource ID', async () => {
      mockRequest.params = { id: 'invalid-id' };
      mockRequest.body = { destinationPath: '/documents' };

      await copyResourceHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0]).toBeInstanceOf(Error);
    });

    it('should pass service error to next() for non-existent resource', async () => {
      mockRequest.params = { id: mockResourceId.toString() };
      mockRequest.body = { destinationPath: '/documents/backup' };

      const serviceError = new Error('Resource not found');
      vi.mocked(resourceService.copyResource).mockRejectedValue(serviceError);

      await copyResourceHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(serviceError);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should pass service error to next() when copying to same location', async () => {
      mockRequest.params = { id: mockResourceId.toString() };
      mockRequest.body = { destinationPath: '/documents' };

      const serviceError = new Error(
        'Cannot copy resource to the same location'
      );
      vi.mocked(resourceService.copyResource).mockRejectedValue(serviceError);

      await copyResourceHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(serviceError);
    });
  });

  describe('isMyFilesEmptyHandler', () => {
    it('should return true when my files is empty', async () => {
      vi.mocked(resourceIsMyFilesEmptyService.isMyFilesEmpty).mockResolvedValue(
        { empty: true }
      );

      await isMyFilesEmptyHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(getUserIdUtil.getUserId).toHaveBeenCalledWith(mockRequest);
      expect(resourceIsMyFilesEmptyService.isMyFilesEmpty).toHaveBeenCalledWith(
        mockUserId
      );
      expect(mockResponse.status).toHaveBeenCalledWith(OK);
      expect(mockResponse.json).toHaveBeenCalledWith(true);
    });

    it('should return false when my files has resources', async () => {
      vi.mocked(resourceIsMyFilesEmptyService.isMyFilesEmpty).mockResolvedValue(
        { empty: false }
      );

      await isMyFilesEmptyHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith(false);
    });
  });

  describe('getOverviewHandler', () => {
    it('should get resource overview with pinned and recent items', async () => {
      const mockOverview = {
        pinned: [
          {
            _id: new mongoose.Types.ObjectId(),
            name: 'important.txt',
            isPinned: true,
          },
        ],
        recent: [
          {
            _id: new mongoose.Types.ObjectId(),
            name: 'recent-file.txt',
            accessedAt: new Date(),
          },
        ],
      };

      vi.mocked(resourceOverviewService.getOverview).mockResolvedValue(
        mockOverview as any
      );

      await getOverviewHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(getUserIdUtil.getUserId).toHaveBeenCalledWith(mockRequest);
      expect(resourceOverviewService.getOverview).toHaveBeenCalledWith(
        mockUserId
      );
      expect(mockResponse.status).toHaveBeenCalledWith(OK);
      expect(mockResponse.json).toHaveBeenCalledWith(mockOverview);
    });

    it('should return empty overview when no resources', async () => {
      const emptyOverview = {
        pinned: [],
        recent: [],
      };

      vi.mocked(resourceOverviewService.getOverview).mockResolvedValue(
        emptyOverview as any
      );

      await getOverviewHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith(emptyOverview);
    });
  });

  describe('togglePinResourceHandler', () => {
    it('should pin an unpinned resource', async () => {
      mockRequest.params = { id: mockResourceId.toString() };

      const mockPinnedResource = {
        _id: mockResourceId,
        name: 'file.txt',
        isPinned: true,
      };

      vi.mocked(resourceOverviewService.togglePinResource).mockResolvedValue(
        mockPinnedResource as any
      );

      await togglePinResourceHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(getUserIdUtil.getUserId).toHaveBeenCalledWith(mockRequest);
      expect(resourceOverviewService.togglePinResource).toHaveBeenCalledWith(
        mockUserId,
        mockResourceId.toString()
      );
      expect(mockResponse.status).toHaveBeenCalledWith(OK);
      expect(mockResponse.json).toHaveBeenCalledWith(mockPinnedResource);
    });

    it('should unpin a pinned resource', async () => {
      mockRequest.params = { id: mockResourceId.toString() };

      const mockUnpinnedResource = {
        _id: mockResourceId,
        name: 'file.txt',
        isPinned: false,
      };

      vi.mocked(resourceOverviewService.togglePinResource).mockResolvedValue(
        mockUnpinnedResource as any
      );

      await togglePinResourceHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith(mockUnpinnedResource);
    });
  });

  describe('updateAccessedAtHandler', () => {
    it('should update the accessed timestamp of a resource', async () => {
      mockRequest.params = { id: mockResourceId.toString() };

      const mockUpdatedResource = {
        _id: mockResourceId,
        name: 'file.txt',
        accessedAt: new Date(),
      };

      vi.mocked(resourceOverviewService.updateAccessedAt).mockResolvedValue(
        mockUpdatedResource as any
      );

      await updateAccessedAtHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(getUserIdUtil.getUserId).toHaveBeenCalledWith(mockRequest);
      expect(resourceOverviewService.updateAccessedAt).toHaveBeenCalledWith(
        mockUserId,
        mockResourceId.toString()
      );
      expect(mockResponse.status).toHaveBeenCalledWith(OK);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUpdatedResource);
    });

    it('should pass service error to next() for non-existent resource', async () => {
      mockRequest.params = { id: mockResourceId.toString() };

      const serviceError = new Error('Resource not found');
      vi.mocked(resourceOverviewService.updateAccessedAt).mockRejectedValue(
        serviceError
      );

      await updateAccessedAtHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(serviceError);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should pass service error to next() for trashed resource', async () => {
      mockRequest.params = { id: mockResourceId.toString() };

      const serviceError = new Error('Cannot update trashed resource');
      vi.mocked(resourceOverviewService.updateAccessedAt).mockRejectedValue(
        serviceError
      );

      await updateAccessedAtHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(serviceError);
    });
  });

  describe('isTrashEmptyHandler', () => {
    it('should return true when trash is empty', async () => {
      vi.mocked(resourceIsTrashEmptyService.isTrashEmpty).mockResolvedValue({
        empty: true,
      });

      await isTrashEmptyHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(getUserIdUtil.getUserId).toHaveBeenCalledWith(mockRequest);
      expect(resourceIsTrashEmptyService.isTrashEmpty).toHaveBeenCalledWith(
        mockUserId
      );
      expect(mockResponse.status).toHaveBeenCalledWith(OK);
      expect(mockResponse.json).toHaveBeenCalledWith(true);
    });

    it('should return false when trash has resources', async () => {
      vi.mocked(resourceIsTrashEmptyService.isTrashEmpty).mockResolvedValue({
        empty: false,
      });

      await isTrashEmptyHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith(false);
    });
  });
});
