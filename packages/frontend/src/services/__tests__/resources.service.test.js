import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as resourcesService from '../resources.service.js';

// Mock the API client
vi.mock('../../config/apiClient.js', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import API from '../../config/apiClient.js';

describe('resources.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getResources', () => {
    it('should call API.get with default path "my-files"', () => {
      resourcesService.getResources();
      expect(API.get).toHaveBeenCalledWith('/resources?path=my-files');
    });

    it('should call API.get with custom path', () => {
      resourcesService.getResources('documents/projects');
      expect(API.get).toHaveBeenCalledWith(
        '/resources?path=documents/projects'
      );
    });

    it('should call API.get with empty path', () => {
      resourcesService.getResources('');
      expect(API.get).toHaveBeenCalledWith('/resources?path=');
    });

    it('should call API.get with root path', () => {
      resourcesService.getResources('/');
      expect(API.get).toHaveBeenCalledWith('/resources?path=/');
    });

    it('should return the result from API.get', async () => {
      const mockData = [{ id: 1, name: 'file1' }];
      API.get.mockResolvedValue(mockData);

      const result = await resourcesService.getResources();
      expect(result).toEqual(mockData);
    });
  });

  describe('isMyFilesEmpty', () => {
    it('should call API.get with correct endpoint', () => {
      resourcesService.isMyFilesEmpty();
      expect(API.get).toHaveBeenCalledWith('/resources/is-my-files-empty');
    });

    it('should return the result from API.get', async () => {
      API.get.mockResolvedValue(true);

      const result = await resourcesService.isMyFilesEmpty();
      expect(result).toBe(true);
    });
  });

  describe('isTrashEmpty', () => {
    it('should call API.get with correct endpoint', () => {
      resourcesService.isTrashEmpty();
      expect(API.get).toHaveBeenCalledWith('/resources/is-trash-empty');
    });

    it('should return the result from API.get', async () => {
      API.get.mockResolvedValue(false);

      const result = await resourcesService.isTrashEmpty();
      expect(result).toBe(false);
    });
  });

  describe('getTrash', () => {
    it('should call API.get with correct endpoint', () => {
      resourcesService.getTrash();
      expect(API.get).toHaveBeenCalledWith('/resources/trash');
    });

    it('should return the result from API.get', async () => {
      const mockTrash = [{ id: 1, name: 'deleted-file' }];
      API.get.mockResolvedValue(mockTrash);

      const result = await resourcesService.getTrash();
      expect(result).toEqual(mockTrash);
    });
  });

  describe('createResource', () => {
    it('should call API.post with correct endpoint and data', () => {
      const data = { name: 'New File', type: 'file', path: 'documents' };
      resourcesService.createResource(data);
      expect(API.post).toHaveBeenCalledWith('/resources', data);
    });

    it('should return the result from API.post', async () => {
      const data = { name: 'New Folder', type: 'folder' };
      const mockResponse = { id: 123, ...data };
      API.post.mockResolvedValue(mockResponse);

      const result = await resourcesService.createResource(data);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('renameResource', () => {
    it('should call API.patch with correct endpoint and data', () => {
      const data = { id: '123', name: 'Renamed File' };
      resourcesService.renameResource(data);
      expect(API.patch).toHaveBeenCalledWith('/resources/123/rename', data);
    });

    it('should handle numeric id', () => {
      const data = { id: 456, name: 'New Name' };
      resourcesService.renameResource(data);
      expect(API.patch).toHaveBeenCalledWith('/resources/456/rename', data);
    });

    it('should return the result from API.patch', async () => {
      const data = { id: '789', name: 'Updated' };
      const mockResponse = { success: true, resource: data };
      API.patch.mockResolvedValue(mockResponse);

      const result = await resourcesService.renameResource(data);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('copyResource', () => {
    it('should call API.post with correct endpoint and data', () => {
      const data = { id: '123', destinationPath: 'documents/backup' };
      resourcesService.copyResource(data);
      expect(API.post).toHaveBeenCalledWith('/resources/123/copy', data);
    });

    it('should handle additional data properties', () => {
      const data = {
        id: '456',
        destinationPath: 'projects',
        newName: 'Copy of File',
      };
      resourcesService.copyResource(data);
      expect(API.post).toHaveBeenCalledWith('/resources/456/copy', data);
    });

    it('should return the result from API.post', async () => {
      const data = { id: '789', destinationPath: 'archive' };
      const mockResponse = { id: '790', copied: true };
      API.post.mockResolvedValue(mockResponse);

      const result = await resourcesService.copyResource(data);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('moveResource', () => {
    it('should call API.patch with correct endpoint and data', () => {
      const data = { id: '123', destinationPath: 'documents/moved' };
      resourcesService.moveResource(data);
      expect(API.patch).toHaveBeenCalledWith('/resources/123/move', data);
    });

    it('should handle additional move options', () => {
      const data = {
        id: '456',
        destinationPath: 'new-location',
        overwrite: true,
      };
      resourcesService.moveResource(data);
      expect(API.patch).toHaveBeenCalledWith('/resources/456/move', data);
    });

    it('should return the result from API.patch', async () => {
      const data = { id: '789', destinationPath: 'final-location' };
      const mockResponse = { success: true };
      API.patch.mockResolvedValue(mockResponse);

      const result = await resourcesService.moveResource(data);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('moveToTrash', () => {
    it('should call API.patch with correct endpoint', () => {
      resourcesService.moveToTrash('123');
      expect(API.patch).toHaveBeenCalledWith('/resources/123/trash');
    });

    it('should handle numeric id', () => {
      resourcesService.moveToTrash(456);
      expect(API.patch).toHaveBeenCalledWith('/resources/456/trash');
    });

    it('should return the result from API.patch', async () => {
      const mockResponse = { trashed: true };
      API.patch.mockResolvedValue(mockResponse);

      const result = await resourcesService.moveToTrash('789');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('emptyTrash', () => {
    it('should call API.delete with correct endpoint', () => {
      resourcesService.emptyTrash();
      expect(API.delete).toHaveBeenCalledWith('/resources/trash');
    });

    it('should return the result from API.delete', async () => {
      const mockResponse = { deleted: 5 };
      API.delete.mockResolvedValue(mockResponse);

      const result = await resourcesService.emptyTrash();
      expect(result).toEqual(mockResponse);
    });
  });

  describe('restoreAllFromTrash', () => {
    it('should call API.patch with correct endpoint', () => {
      resourcesService.restoreAllFromTrash();
      expect(API.patch).toHaveBeenCalledWith('/resources/restore');
    });

    it('should return the result from API.patch', async () => {
      const mockResponse = { restored: 3 };
      API.patch.mockResolvedValue(mockResponse);

      const result = await resourcesService.restoreAllFromTrash();
      expect(result).toEqual(mockResponse);
    });
  });

  describe('restoreFromTrash', () => {
    it('should call API.patch with correct endpoint', () => {
      resourcesService.restoreFromTrash('123');
      expect(API.patch).toHaveBeenCalledWith('/resources/123/restore');
    });

    it('should handle numeric id', () => {
      resourcesService.restoreFromTrash(456);
      expect(API.patch).toHaveBeenCalledWith('/resources/456/restore');
    });

    it('should return the result from API.patch', async () => {
      const mockResponse = { restored: true };
      API.patch.mockResolvedValue(mockResponse);

      const result = await resourcesService.restoreFromTrash('789');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteResource', () => {
    it('should call API.delete with correct endpoint', () => {
      resourcesService.deleteResource('123');
      expect(API.delete).toHaveBeenCalledWith('/resources/123');
    });

    it('should handle numeric id', () => {
      resourcesService.deleteResource(456);
      expect(API.delete).toHaveBeenCalledWith('/resources/456');
    });

    it('should return the result from API.delete', async () => {
      const mockResponse = { deleted: true };
      API.delete.mockResolvedValue(mockResponse);

      const result = await resourcesService.deleteResource('789');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getOverview', () => {
    it('should call API.get with correct endpoint', () => {
      resourcesService.getOverview();
      expect(API.get).toHaveBeenCalledWith('/resources/overview');
    });

    it('should return the result from API.get', async () => {
      const mockOverview = { total: 50, folders: 10, files: 40 };
      API.get.mockResolvedValue(mockOverview);

      const result = await resourcesService.getOverview();
      expect(result).toEqual(mockOverview);
    });
  });

  describe('updateAccess', () => {
    it('should call API.patch with correct endpoint', () => {
      resourcesService.updateAccess('123');
      expect(API.patch).toHaveBeenCalledWith('/resources/123/access');
    });

    it('should handle numeric id', () => {
      resourcesService.updateAccess(456);
      expect(API.patch).toHaveBeenCalledWith('/resources/456/access');
    });

    it('should return the result from API.patch', async () => {
      const mockResponse = { accessUpdated: true };
      API.patch.mockResolvedValue(mockResponse);

      const result = await resourcesService.updateAccess('789');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('togglePin', () => {
    it('should call API.patch with correct endpoint', () => {
      resourcesService.togglePin('123');
      expect(API.patch).toHaveBeenCalledWith('/resources/123/toggle-pin');
    });

    it('should handle numeric id', () => {
      resourcesService.togglePin(456);
      expect(API.patch).toHaveBeenCalledWith('/resources/456/toggle-pin');
    });

    it('should return the result from API.patch', async () => {
      const mockResponse = { pinned: true };
      API.patch.mockResolvedValue(mockResponse);

      const result = await resourcesService.togglePin('789');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('error handling', () => {
    it('should propagate errors from API.get', async () => {
      const error = new Error('Network error');
      API.get.mockRejectedValue(error);

      await expect(resourcesService.getResources()).rejects.toThrow(
        'Network error'
      );
    });

    it('should propagate errors from API.post', async () => {
      const error = new Error('Validation error');
      API.post.mockRejectedValue(error);

      await expect(resourcesService.createResource({})).rejects.toThrow(
        'Validation error'
      );
    });

    it('should propagate errors from API.patch', async () => {
      const error = new Error('Update failed');
      API.patch.mockRejectedValue(error);

      await expect(
        resourcesService.renameResource({ id: '1', name: 'New' })
      ).rejects.toThrow('Update failed');
    });

    it('should propagate errors from API.delete', async () => {
      const error = new Error('Delete failed');
      API.delete.mockRejectedValue(error);

      await expect(resourcesService.deleteResource('1')).rejects.toThrow(
        'Delete failed'
      );
    });
  });
});
