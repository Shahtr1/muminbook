import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as windowService from '../window.service.js';

// Mock the API client
vi.mock('@/config/apiClient.js', () => ({
  default: {
    get: vi.fn(),
    delete: vi.fn(),
  },
}));

import API from '@/config/apiClient.js';

describe('window.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getWindows', () => {
    it('should call API.get with correct endpoint', () => {
      windowService.getWindows();
      expect(API.get).toHaveBeenCalledWith('/windows');
    });

    it('should call API.get exactly once', () => {
      windowService.getWindows();
      expect(API.get).toHaveBeenCalledTimes(1);
    });

    it('should return the result from API.get', async () => {
      const mockWindows = [
        { id: '1', title: 'Window 1', type: 'suhuf', url: '/suhuf/1' },
        { id: '2', title: 'Window 2', type: 'reading', url: '/reading/2' },
      ];
      API.get.mockResolvedValue(mockWindows);

      const result = await windowService.getWindows();
      expect(result).toEqual(mockWindows);
    });

    it('should return empty array when no windows exist', async () => {
      API.get.mockResolvedValue([]);

      const result = await windowService.getWindows();
      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return windows with complete data structure', async () => {
      const mockWindows = [
        {
          id: '1',
          title: 'Surah Al-Fatiha',
          type: 'suhuf',
          url: '/suhuf/surah-1',
          resourceId: 'res-123',
          createdAt: '2024-01-01',
          lastAccessed: '2024-12-25',
          position: { x: 100, y: 100 },
          size: { width: 800, height: 600 },
        },
        {
          id: '2',
          title: 'Quran Reading',
          type: 'reading',
          url: '/reading/quran',
          resourceId: 'res-456',
          createdAt: '2024-02-01',
          lastAccessed: '2024-12-24',
          metadata: {
            surah: 1,
            ayah: 1,
            juz: 1,
          },
        },
      ];
      API.get.mockResolvedValue(mockWindows);

      const result = await windowService.getWindows();
      expect(result).toEqual(mockWindows);
      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('suhuf');
      expect(result[1].type).toBe('reading');
      expect(result[0].position).toEqual({ x: 100, y: 100 });
      expect(result[1].metadata.surah).toBe(1);
    });

    it('should return single window', async () => {
      const mockWindows = [
        { id: '1', title: 'Single Window', type: 'suhuf', url: '/suhuf/1' },
      ];
      API.get.mockResolvedValue(mockWindows);

      const result = await windowService.getWindows();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('should propagate errors from API.get', async () => {
      const error = new Error('Failed to fetch windows');
      API.get.mockRejectedValue(error);

      await expect(windowService.getWindows()).rejects.toThrow(
        'Failed to fetch windows'
      );
    });

    it('should handle unauthorized access', async () => {
      const error = new Error('Unauthorized');
      API.get.mockRejectedValue(error);

      await expect(windowService.getWindows()).rejects.toThrow('Unauthorized');
    });

    it('should handle network errors', async () => {
      const error = new Error('Network error');
      API.get.mockRejectedValue(error);

      await expect(windowService.getWindows()).rejects.toThrow('Network error');
    });

    it('should handle server errors', async () => {
      const error = new Error('Internal server error');
      API.get.mockRejectedValue(error);

      await expect(windowService.getWindows()).rejects.toThrow(
        'Internal server error'
      );
    });

    it('should return promise', () => {
      API.get.mockResolvedValue([]);
      const result = windowService.getWindows();
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('deleteWindow', () => {
    it('should call API.delete with correct endpoint and id', () => {
      windowService.deleteWindow('123');
      expect(API.delete).toHaveBeenCalledWith('/windows/123');
    });

    it('should handle numeric id', () => {
      windowService.deleteWindow(456);
      expect(API.delete).toHaveBeenCalledWith('/windows/456');
    });

    it('should call API.delete exactly once', () => {
      windowService.deleteWindow('123');
      expect(API.delete).toHaveBeenCalledTimes(1);
    });

    it('should return the result from API.delete', async () => {
      const mockResponse = { success: true, deleted: true };
      API.delete.mockResolvedValue(mockResponse);

      const result = await windowService.deleteWindow('123');
      expect(result).toEqual(mockResponse);
    });

    it('should handle successful deletion with message', async () => {
      const mockResponse = {
        success: true,
        message: 'Window deleted successfully',
        id: '123',
      };
      API.delete.mockResolvedValue(mockResponse);

      const result = await windowService.deleteWindow('123');
      expect(result).toEqual(mockResponse);
      expect(result.success).toBe(true);
      expect(result.id).toBe('123');
    });

    it('should handle deletion response with no data', async () => {
      API.delete.mockResolvedValue(undefined);

      const result = await windowService.deleteWindow('123');
      expect(result).toBeUndefined();
    });

    it('should handle empty object response', async () => {
      API.delete.mockResolvedValue({});

      const result = await windowService.deleteWindow('123');
      expect(result).toEqual({});
    });

    it('should propagate errors from API.delete', async () => {
      const error = new Error('Failed to delete window');
      API.delete.mockRejectedValue(error);

      await expect(windowService.deleteWindow('123')).rejects.toThrow(
        'Failed to delete window'
      );
    });

    it('should handle not found error', async () => {
      const error = new Error('Window not found');
      API.delete.mockRejectedValue(error);

      await expect(windowService.deleteWindow('nonexistent')).rejects.toThrow(
        'Window not found'
      );
    });

    it('should handle unauthorized deletion', async () => {
      const error = new Error('Unauthorized to delete window');
      API.delete.mockRejectedValue(error);

      await expect(windowService.deleteWindow('protected')).rejects.toThrow(
        'Unauthorized to delete window'
      );
    });

    it('should handle server error during deletion', async () => {
      const error = new Error('Internal server error');
      API.delete.mockRejectedValue(error);

      await expect(windowService.deleteWindow('123')).rejects.toThrow(
        'Internal server error'
      );
    });

    it('should return promise', () => {
      API.delete.mockResolvedValue({});
      const result = windowService.deleteWindow('123');
      expect(result).toBeInstanceOf(Promise);
    });

    it('should handle UUID format id', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      windowService.deleteWindow(uuid);
      expect(API.delete).toHaveBeenCalledWith(`/windows/${uuid}`);
    });

    it('should handle special characters in id', () => {
      const id = 'window-123-special_chars';
      windowService.deleteWindow(id);
      expect(API.delete).toHaveBeenCalledWith(`/windows/${id}`);
    });

    it('should handle MongoDB ObjectId format', () => {
      const objectId = '507f1f77bcf86cd799439011';
      windowService.deleteWindow(objectId);
      expect(API.delete).toHaveBeenCalledWith(`/windows/${objectId}`);
    });
  });

  describe('concurrent calls', () => {
    it('should handle multiple getWindows calls independently', async () => {
      const mockWindows1 = [{ id: '1', title: 'Window 1' }];
      const mockWindows2 = [{ id: '2', title: 'Window 2' }];

      API.get
        .mockResolvedValueOnce(mockWindows1)
        .mockResolvedValueOnce(mockWindows2);

      const [result1, result2] = await Promise.all([
        windowService.getWindows(),
        windowService.getWindows(),
      ]);

      expect(result1).toEqual(mockWindows1);
      expect(result2).toEqual(mockWindows2);
      expect(API.get).toHaveBeenCalledTimes(2);
    });

    it('should handle multiple deleteWindow calls with different ids', async () => {
      const mockResponse1 = { success: true, id: '1' };
      const mockResponse2 = { success: true, id: '2' };

      API.delete
        .mockResolvedValueOnce(mockResponse1)
        .mockResolvedValueOnce(mockResponse2);

      const [result1, result2] = await Promise.all([
        windowService.deleteWindow('1'),
        windowService.deleteWindow('2'),
      ]);

      expect(result1).toEqual(mockResponse1);
      expect(result2).toEqual(mockResponse2);
      expect(API.delete).toHaveBeenCalledTimes(2);
      expect(API.delete).toHaveBeenNthCalledWith(1, '/windows/1');
      expect(API.delete).toHaveBeenNthCalledWith(2, '/windows/2');
    });

    it('should handle mixed service calls', async () => {
      const mockWindows = [{ id: '1', title: 'Window 1' }];
      const mockDeleteResponse = { success: true };

      API.get.mockResolvedValueOnce(mockWindows);
      API.delete.mockResolvedValueOnce(mockDeleteResponse);

      const [windows, deleteResult] = await Promise.all([
        windowService.getWindows(),
        windowService.deleteWindow('2'),
      ]);

      expect(windows).toEqual(mockWindows);
      expect(deleteResult).toEqual(mockDeleteResponse);
      expect(API.get).toHaveBeenCalledTimes(1);
      expect(API.delete).toHaveBeenCalledTimes(1);
      expect(API.get).toHaveBeenCalledWith('/windows');
      expect(API.delete).toHaveBeenCalledWith('/windows/2');
    });

    it('should handle sequential operations', async () => {
      const mockWindows = [
        { id: '1', title: 'Window 1' },
        { id: '2', title: 'Window 2' },
      ];
      const mockDeleteResponse = { success: true };

      API.get.mockResolvedValue(mockWindows);
      API.delete.mockResolvedValue(mockDeleteResponse);

      // Get windows first
      const windows = await windowService.getWindows();
      expect(windows).toHaveLength(2);

      // Then delete one
      const deleteResult = await windowService.deleteWindow('1');
      expect(deleteResult.success).toBe(true);

      expect(API.get).toHaveBeenCalledTimes(1);
      expect(API.delete).toHaveBeenCalledTimes(1);
    });

    it('should handle batch deletions', async () => {
      const mockResponse = { success: true };
      API.delete.mockResolvedValue(mockResponse);

      const deleteIds = ['1', '2', '3', '4', '5'];
      const results = await Promise.all(
        deleteIds.map((id) => windowService.deleteWindow(id))
      );

      expect(results).toHaveLength(5);
      results.forEach((result) => {
        expect(result.success).toBe(true);
      });
      expect(API.delete).toHaveBeenCalledTimes(5);
    });
  });

  describe('edge cases', () => {
    it('should handle getWindows returning null', async () => {
      API.get.mockResolvedValue(null);

      const result = await windowService.getWindows();
      expect(result).toBeNull();
    });

    it('should handle getWindows returning undefined', async () => {
      API.get.mockResolvedValue(undefined);

      const result = await windowService.getWindows();
      expect(result).toBeUndefined();
    });

    it('should handle deleteWindow with empty string id', () => {
      windowService.deleteWindow('');
      expect(API.delete).toHaveBeenCalledWith('/windows/');
    });

    it('should handle deleteWindow with zero as id', () => {
      windowService.deleteWindow(0);
      expect(API.delete).toHaveBeenCalledWith('/windows/0');
    });

    it('should handle deleteWindow with boolean id', () => {
      windowService.deleteWindow(true);
      expect(API.delete).toHaveBeenCalledWith('/windows/true');
    });

    it('should handle windows with nested data structures', async () => {
      const mockWindows = [
        {
          id: '1',
          title: 'Complex Window',
          data: {
            nested: {
              deeply: {
                value: 'test',
              },
            },
          },
          metadata: {
            tags: ['tag1', 'tag2'],
            permissions: {
              read: true,
              write: false,
            },
          },
        },
      ];
      API.get.mockResolvedValue(mockWindows);

      const result = await windowService.getWindows();
      expect(result[0].data.nested.deeply.value).toBe('test');
      expect(result[0].metadata.tags).toEqual(['tag1', 'tag2']);
    });
  });

  describe('error recovery', () => {
    it('should allow retry after failed getWindows', async () => {
      const error = new Error('Network error');
      const mockWindows = [{ id: '1', title: 'Window 1' }];

      API.get.mockRejectedValueOnce(error).mockResolvedValueOnce(mockWindows);

      // First call fails
      await expect(windowService.getWindows()).rejects.toThrow('Network error');

      // Second call succeeds
      const result = await windowService.getWindows();
      expect(result).toEqual(mockWindows);
      expect(API.get).toHaveBeenCalledTimes(2);
    });

    it('should allow retry after failed deleteWindow', async () => {
      const error = new Error('Network error');
      const mockResponse = { success: true };

      API.delete
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce(mockResponse);

      // First call fails
      await expect(windowService.deleteWindow('1')).rejects.toThrow(
        'Network error'
      );

      // Second call succeeds
      const result = await windowService.deleteWindow('1');
      expect(result).toEqual(mockResponse);
      expect(API.delete).toHaveBeenCalledTimes(2);
    });
  });
});
