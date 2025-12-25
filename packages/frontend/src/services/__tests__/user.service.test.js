import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as userService from '../user.service.js';

// Mock the API client
vi.mock('../../config/apiClient.js', () => ({
  default: {
    get: vi.fn(),
  },
}));

import API from '../../config/apiClient.js';

describe('user.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUser', () => {
    it('should call API.get with correct endpoint', () => {
      userService.getUser();
      expect(API.get).toHaveBeenCalledWith('/user');
    });

    it('should call API.get exactly once', () => {
      userService.getUser();
      expect(API.get).toHaveBeenCalledTimes(1);
    });

    it('should return the result from API.get', async () => {
      const mockUser = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
      };
      API.get.mockResolvedValue(mockUser);

      const result = await userService.getUser();
      expect(result).toEqual(mockUser);
    });

    it('should return user with all properties', async () => {
      const mockUser = {
        id: '456',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'admin',
        createdAt: '2024-01-01',
        updatedAt: '2024-12-01',
        preferences: {
          theme: 'dark',
          language: 'en',
        },
      };
      API.get.mockResolvedValue(mockUser);

      const result = await userService.getUser();
      expect(result).toEqual(mockUser);
      expect(result.preferences).toEqual({ theme: 'dark', language: 'en' });
    });

    it('should propagate errors from API.get', async () => {
      const error = new Error('Unauthorized');
      API.get.mockRejectedValue(error);

      await expect(userService.getUser()).rejects.toThrow('Unauthorized');
    });

    it('should handle 404 error', async () => {
      const error = new Error('User not found');
      API.get.mockRejectedValue(error);

      await expect(userService.getUser()).rejects.toThrow('User not found');
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network request failed');
      API.get.mockRejectedValue(networkError);

      await expect(userService.getUser()).rejects.toThrow(
        'Network request failed'
      );
    });
  });

  describe('getFamilyTree', () => {
    it('should call API.get with correct endpoint', () => {
      userService.getFamilyTree();
      expect(API.get).toHaveBeenCalledWith('/family-tree');
    });

    it('should call API.get exactly once', () => {
      userService.getFamilyTree();
      expect(API.get).toHaveBeenCalledTimes(1);
    });

    it('should return the result from API.get', async () => {
      const mockFamilyTree = [
        { id: '1', name: 'Adam', parents: [] },
        { id: '2', name: 'Seth', parents: ['1'] },
      ];
      API.get.mockResolvedValue(mockFamilyTree);

      const result = await userService.getFamilyTree();
      expect(result).toEqual(mockFamilyTree);
    });

    it('should return empty array when no family tree exists', async () => {
      API.get.mockResolvedValue([]);

      const result = await userService.getFamilyTree();
      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return complex family tree structure', async () => {
      const mockFamilyTree = [
        {
          _id: '1',
          uuid: 'adam',
          biblicalName: 'Adam',
          islamicName: 'Adam',
          arabicName: 'آدم',
          lineages: ['lineage1'],
          parents: [],
          label: 'Father of Humanity',
        },
        {
          _id: '2',
          uuid: 'nuh',
          biblicalName: 'Noah',
          islamicName: 'Nuh',
          arabicName: 'نوح',
          lineages: ['lineage2'],
          parents: ['1'],
          label: 'The Prophet',
        },
      ];
      API.get.mockResolvedValue(mockFamilyTree);

      const result = await userService.getFamilyTree();
      expect(result).toEqual(mockFamilyTree);
      expect(result).toHaveLength(2);
      expect(result[0].uuid).toBe('adam');
      expect(result[1].uuid).toBe('nuh');
    });

    it('should propagate errors from API.get', async () => {
      const error = new Error('Failed to fetch family tree');
      API.get.mockRejectedValue(error);

      await expect(userService.getFamilyTree()).rejects.toThrow(
        'Failed to fetch family tree'
      );
    });

    it('should handle unauthorized access', async () => {
      const error = new Error('Unauthorized access to family tree');
      API.get.mockRejectedValue(error);

      await expect(userService.getFamilyTree()).rejects.toThrow(
        'Unauthorized access to family tree'
      );
    });

    it('should handle server errors', async () => {
      const error = new Error('Internal server error');
      API.get.mockRejectedValue(error);

      await expect(userService.getFamilyTree()).rejects.toThrow(
        'Internal server error'
      );
    });
  });

  describe('concurrent calls', () => {
    it('should handle multiple getUser calls independently', async () => {
      const mockUser1 = { id: '1', name: 'User 1' };
      const mockUser2 = { id: '2', name: 'User 2' };

      API.get.mockResolvedValueOnce(mockUser1).mockResolvedValueOnce(mockUser2);

      const [result1, result2] = await Promise.all([
        userService.getUser(),
        userService.getUser(),
      ]);

      expect(result1).toEqual(mockUser1);
      expect(result2).toEqual(mockUser2);
      expect(API.get).toHaveBeenCalledTimes(2);
    });

    it('should handle multiple getFamilyTree calls independently', async () => {
      const mockTree1 = [{ id: '1', name: 'Tree 1' }];
      const mockTree2 = [{ id: '2', name: 'Tree 2' }];

      API.get.mockResolvedValueOnce(mockTree1).mockResolvedValueOnce(mockTree2);

      const [result1, result2] = await Promise.all([
        userService.getFamilyTree(),
        userService.getFamilyTree(),
      ]);

      expect(result1).toEqual(mockTree1);
      expect(result2).toEqual(mockTree2);
      expect(API.get).toHaveBeenCalledTimes(2);
    });

    it('should handle mixed service calls', async () => {
      const mockUser = { id: '1', name: 'User' };
      const mockTree = [{ id: '1', name: 'Node' }];

      API.get.mockResolvedValueOnce(mockUser).mockResolvedValueOnce(mockTree);

      const [userResult, treeResult] = await Promise.all([
        userService.getUser(),
        userService.getFamilyTree(),
      ]);

      expect(userResult).toEqual(mockUser);
      expect(treeResult).toEqual(mockTree);
      expect(API.get).toHaveBeenCalledTimes(2);
      expect(API.get).toHaveBeenNthCalledWith(1, '/user');
      expect(API.get).toHaveBeenNthCalledWith(2, '/family-tree');
    });
  });

  describe('return value types', () => {
    it('should return promise from getUser', () => {
      API.get.mockResolvedValue({});
      const result = userService.getUser();
      expect(result).toBeInstanceOf(Promise);
    });

    it('should return promise from getFamilyTree', () => {
      API.get.mockResolvedValue([]);
      const result = userService.getFamilyTree();
      expect(result).toBeInstanceOf(Promise);
    });
  });
});
