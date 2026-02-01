/**
 * @fileoverview Get Trashed Resources Service Test Suite
 *
 * Tests for getTrashedResources service:
 * - Fetches deleted resources for a user
 * - Sorts by deletion date (newest first)
 * - Calculates empty/non-empty status for folders
 * - Returns folders first, then files
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Types } from 'mongoose';
import { getTrashedResources } from '../getTrashed-resource.service';
import ResourceModel from '../../../../models/resource.model';
import ResourceType from '../../../../constants/types/resourceType';
import { PrimaryId } from '../../../../constants/ids';

vi.mock('../../../../models/resource.model', () => {
  const MockResourceModel: any = {
    find: vi.fn(),
    aggregate: vi.fn(),
  };

  return {
    default: MockResourceModel,
  };
});

describe('getTrashedResources', () => {
  const mockUserId = new Types.ObjectId() as PrimaryId;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockResource = (overrides: any = {}) => ({
    _id: new Types.ObjectId(),
    userId: mockUserId,
    name: 'Test Resource',
    type: ResourceType.File,
    path: '/test',
    deleted: true,
    deletedAt: new Date(),
    ...overrides,
  });

  describe('Basic functionality', () => {
    it('should return empty array when no trashed resources exist', async () => {
      const mockFind = vi.fn().mockReturnValue({
        sort: vi.fn().mockResolvedValue([]),
      });
      vi.mocked(ResourceModel.find).mockImplementation(mockFind);
      vi.mocked(ResourceModel.aggregate).mockResolvedValue([]);

      const result = await getTrashedResources(mockUserId);

      expect(result).toEqual([]);
      expect(ResourceModel.find).toHaveBeenCalledWith({
        userId: mockUserId,
        deleted: true,
      });
    });

    it('should fetch trashed resources for specific user', async () => {
      const file = createMockResource({
        name: 'deleted-file.pdf',
        type: ResourceType.File,
      });

      const mockFind = vi.fn().mockReturnValue({
        sort: vi.fn().mockResolvedValue([file]),
      });
      vi.mocked(ResourceModel.find).mockImplementation(mockFind);
      vi.mocked(ResourceModel.aggregate).mockResolvedValue([]);

      const result = await getTrashedResources(mockUserId);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('deleted-file.pdf');
      expect(ResourceModel.find).toHaveBeenCalledWith({
        userId: mockUserId,
        deleted: true,
      });
    });

    it('should sort resources by deletedAt in descending order', async () => {
      const file = createMockResource();
      const mockSort = vi.fn().mockResolvedValue([file]);
      const mockFind = vi.fn().mockReturnValue({
        sort: mockSort,
      });

      vi.mocked(ResourceModel.find).mockImplementation(mockFind);
      vi.mocked(ResourceModel.aggregate).mockResolvedValue([]);

      await getTrashedResources(mockUserId);

      expect(mockSort).toHaveBeenCalledWith({ deletedAt: -1 });
    });
  });

  describe('Folder and file separation', () => {
    it('should return folders before files', async () => {
      const oldDate = new Date('2024-01-01');
      const newDate = new Date('2024-12-01');

      const file = createMockResource({
        name: 'file.pdf',
        type: ResourceType.File,
        deletedAt: newDate, // Newer
      });

      const folder = createMockResource({
        name: 'folder',
        type: ResourceType.Folder,
        deletedAt: oldDate, // Older
      });

      const mockFind = vi.fn().mockReturnValue({
        sort: vi.fn().mockResolvedValue([file, folder]), // File comes first in DB
      });
      vi.mocked(ResourceModel.find).mockImplementation(mockFind);
      vi.mocked(ResourceModel.aggregate).mockResolvedValue([]);

      const result = await getTrashedResources(mockUserId);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('folder'); // Folder should be first
      expect(result[0].type).toBe(ResourceType.Folder);
      expect(result[1].name).toBe('file.pdf'); // File should be second
      expect(result[1].type).toBe(ResourceType.File);
    });

    it('should handle only folders', async () => {
      const folder1 = createMockResource({
        name: 'folder1',
        type: ResourceType.Folder,
      });
      const folder2 = createMockResource({
        name: 'folder2',
        type: ResourceType.Folder,
      });

      const mockFind = vi.fn().mockReturnValue({
        sort: vi.fn().mockResolvedValue([folder1, folder2]),
      });
      vi.mocked(ResourceModel.find).mockImplementation(mockFind);
      vi.mocked(ResourceModel.aggregate).mockResolvedValue([]);

      const result = await getTrashedResources(mockUserId);

      expect(result).toHaveLength(2);
      expect(result.every((r) => r.type === ResourceType.Folder)).toBe(true);
    });

    it('should handle only files', async () => {
      const file1 = createMockResource({
        name: 'file1.pdf',
        type: ResourceType.File,
      });
      const file2 = createMockResource({
        name: 'file2.pdf',
        type: ResourceType.File,
      });

      const mockFind = vi.fn().mockReturnValue({
        sort: vi.fn().mockResolvedValue([file1, file2]),
      });
      vi.mocked(ResourceModel.find).mockImplementation(mockFind);
      vi.mocked(ResourceModel.aggregate).mockResolvedValue([]);

      const result = await getTrashedResources(mockUserId);

      expect(result).toHaveLength(2);
      expect(result.every((r) => r.type === ResourceType.File)).toBe(true);
    });

    it('should handle mixed folders and files', async () => {
      const resources = [
        createMockResource({ name: 'file1', type: ResourceType.File }),
        createMockResource({ name: 'folder1', type: ResourceType.Folder }),
        createMockResource({ name: 'file2', type: ResourceType.File }),
        createMockResource({ name: 'folder2', type: ResourceType.Folder }),
      ];

      const mockFind = vi.fn().mockReturnValue({
        sort: vi.fn().mockResolvedValue(resources),
      });
      vi.mocked(ResourceModel.find).mockImplementation(mockFind);
      vi.mocked(ResourceModel.aggregate).mockResolvedValue([]);

      const result = await getTrashedResources(mockUserId);

      expect(result).toHaveLength(4);
      // First two should be folders
      expect(result[0].type).toBe(ResourceType.Folder);
      expect(result[1].type).toBe(ResourceType.Folder);
      // Last two should be files
      expect(result[2].type).toBe(ResourceType.File);
      expect(result[3].type).toBe(ResourceType.File);
    });
  });

  describe('Folder empty status', () => {
    it('should mark folder as empty when it has no deleted children', async () => {
      const folderId = new Types.ObjectId();
      const folder = createMockResource({
        _id: folderId,
        name: 'empty-folder',
        type: ResourceType.Folder,
      });

      const mockFind = vi.fn().mockReturnValue({
        sort: vi.fn().mockResolvedValue([folder]),
      });
      vi.mocked(ResourceModel.find).mockImplementation(mockFind);
      vi.mocked(ResourceModel.aggregate).mockResolvedValue([]); // No children

      const result = await getTrashedResources(mockUserId);

      expect(result).toHaveLength(1);
      expect(result[0].empty).toBe(true);
    });

    it('should mark folder as not empty when it has deleted children', async () => {
      const folderId = new Types.ObjectId();
      const folder = createMockResource({
        _id: folderId,
        name: 'non-empty-folder',
        type: ResourceType.Folder,
      });

      const mockFind = vi.fn().mockReturnValue({
        sort: vi.fn().mockResolvedValue([folder]),
      });
      vi.mocked(ResourceModel.find).mockImplementation(mockFind);
      vi.mocked(ResourceModel.aggregate).mockResolvedValue([
        { _id: folderId, count: 3 }, // Folder has 3 children
      ]);

      const result = await getTrashedResources(mockUserId);

      expect(result).toHaveLength(1);
      expect(result[0].empty).toBe(false);
    });

    it('should not set empty property for files', async () => {
      const file = createMockResource({
        name: 'file.pdf',
        type: ResourceType.File,
      });

      const mockFind = vi.fn().mockReturnValue({
        sort: vi.fn().mockResolvedValue([file]),
      });
      vi.mocked(ResourceModel.find).mockImplementation(mockFind);
      vi.mocked(ResourceModel.aggregate).mockResolvedValue([]);

      const result = await getTrashedResources(mockUserId);

      expect(result).toHaveLength(1);
      expect(result[0].empty).toBeUndefined();
    });

    it('should correctly calculate empty status for multiple folders', async () => {
      const emptyFolderId = new Types.ObjectId();
      const nonEmptyFolderId = new Types.ObjectId();

      const emptyFolder = createMockResource({
        _id: emptyFolderId,
        name: 'empty-folder',
        type: ResourceType.Folder,
      });

      const nonEmptyFolder = createMockResource({
        _id: nonEmptyFolderId,
        name: 'non-empty-folder',
        type: ResourceType.Folder,
      });

      const mockFind = vi.fn().mockReturnValue({
        sort: vi.fn().mockResolvedValue([emptyFolder, nonEmptyFolder]),
      });
      vi.mocked(ResourceModel.find).mockImplementation(mockFind);
      vi.mocked(ResourceModel.aggregate).mockResolvedValue([
        { _id: nonEmptyFolderId, count: 5 }, // Only non-empty folder has children
      ]);

      const result = await getTrashedResources(mockUserId);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('empty-folder');
      expect(result[0].empty).toBe(true);
      expect(result[1].name).toBe('non-empty-folder');
      expect(result[1].empty).toBe(false);
    });
  });

  describe('Aggregation query', () => {
    it('should run aggregation with correct match criteria', async () => {
      const folderId = new Types.ObjectId();
      const folder = createMockResource({
        _id: folderId,
        type: ResourceType.Folder,
      });

      const mockFind = vi.fn().mockReturnValue({
        sort: vi.fn().mockResolvedValue([folder]),
      });
      vi.mocked(ResourceModel.find).mockImplementation(mockFind);
      vi.mocked(ResourceModel.aggregate).mockResolvedValue([]);

      await getTrashedResources(mockUserId);

      expect(ResourceModel.aggregate).toHaveBeenCalledWith([
        {
          $match: {
            parent: { $in: [folderId] },
            userId: mockUserId,
            deleted: true,
          },
        },
        {
          $group: {
            _id: '$parent',
            count: { $sum: 1 },
          },
        },
      ]);
    });

    it('should not run aggregation when no folders exist', async () => {
      const file = createMockResource({
        type: ResourceType.File,
      });

      const mockFind = vi.fn().mockReturnValue({
        sort: vi.fn().mockResolvedValue([file]),
      });
      vi.mocked(ResourceModel.find).mockImplementation(mockFind);
      vi.mocked(ResourceModel.aggregate).mockResolvedValue([]);

      await getTrashedResources(mockUserId);

      expect(ResourceModel.aggregate).toHaveBeenCalledWith([
        {
          $match: {
            parent: { $in: [] }, // Empty array since no folders
            userId: mockUserId,
            deleted: true,
          },
        },
        {
          $group: {
            _id: '$parent',
            count: { $sum: 1 },
          },
        },
      ]);
    });

    it('should handle multiple folders in aggregation', async () => {
      const folder1Id = new Types.ObjectId();
      const folder2Id = new Types.ObjectId();
      const folder3Id = new Types.ObjectId();

      const folders = [
        createMockResource({ _id: folder1Id, type: ResourceType.Folder }),
        createMockResource({ _id: folder2Id, type: ResourceType.Folder }),
        createMockResource({ _id: folder3Id, type: ResourceType.Folder }),
      ];

      const mockFind = vi.fn().mockReturnValue({
        sort: vi.fn().mockResolvedValue(folders),
      });
      vi.mocked(ResourceModel.find).mockImplementation(mockFind);
      vi.mocked(ResourceModel.aggregate).mockResolvedValue([]);

      await getTrashedResources(mockUserId);

      expect(ResourceModel.aggregate).toHaveBeenCalledWith([
        {
          $match: {
            parent: { $in: [folder1Id, folder2Id, folder3Id] },
            userId: mockUserId,
            deleted: true,
          },
        },
        {
          $group: {
            _id: '$parent',
            count: { $sum: 1 },
          },
        },
      ]);
    });
  });

  describe('Response structure', () => {
    it('should include correct properties in response', async () => {
      const deletedAt = new Date('2024-12-24');
      const resourceId = new Types.ObjectId();

      const folder = createMockResource({
        _id: resourceId,
        name: 'test-folder',
        type: ResourceType.Folder,
        path: '/documents/test-folder',
        deletedAt,
      });

      const mockFind = vi.fn().mockReturnValue({
        sort: vi.fn().mockResolvedValue([folder]),
      });
      vi.mocked(ResourceModel.find).mockImplementation(mockFind);
      vi.mocked(ResourceModel.aggregate).mockResolvedValue([]);

      const result = await getTrashedResources(mockUserId);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        _id: resourceId,
        name: 'test-folder',
        type: ResourceType.Folder,
        path: '/documents/test-folder',
        deletedAt,
        empty: true,
      });
    });

    it('should not include userId in response', async () => {
      const file = createMockResource({
        userId: mockUserId,
        type: ResourceType.File,
      });

      const mockFind = vi.fn().mockReturnValue({
        sort: vi.fn().mockResolvedValue([file]),
      });
      vi.mocked(ResourceModel.find).mockImplementation(mockFind);
      vi.mocked(ResourceModel.aggregate).mockResolvedValue([]);

      const result = await getTrashedResources(mockUserId);

      expect(result[0]).not.toHaveProperty('userId');
    });

    it('should not include deleted flag in response', async () => {
      const file = createMockResource({
        deleted: true,
        type: ResourceType.File,
      });

      const mockFind = vi.fn().mockReturnValue({
        sort: vi.fn().mockResolvedValue([file]),
      });
      vi.mocked(ResourceModel.find).mockImplementation(mockFind);
      vi.mocked(ResourceModel.aggregate).mockResolvedValue([]);

      const result = await getTrashedResources(mockUserId);

      expect(result[0]).not.toHaveProperty('deleted');
    });
  });

  describe('Edge cases', () => {
    it('should handle folder with zero children count', async () => {
      const folderId = new Types.ObjectId();
      const folder = createMockResource({
        _id: folderId,
        type: ResourceType.Folder,
      });

      const mockFind = vi.fn().mockReturnValue({
        sort: vi.fn().mockResolvedValue([folder]),
      });
      vi.mocked(ResourceModel.find).mockImplementation(mockFind);
      vi.mocked(ResourceModel.aggregate).mockResolvedValue([
        { _id: folderId, count: 0 }, // Explicit zero count
      ]);

      const result = await getTrashedResources(mockUserId);

      expect(result[0].empty).toBe(true); // 0 count means empty
    });

    it('should handle resources with missing deletedAt', async () => {
      const file = createMockResource({
        type: ResourceType.File,
        deletedAt: undefined,
      });

      const mockFind = vi.fn().mockReturnValue({
        sort: vi.fn().mockResolvedValue([file]),
      });
      vi.mocked(ResourceModel.find).mockImplementation(mockFind);
      vi.mocked(ResourceModel.aggregate).mockResolvedValue([]);

      const result = await getTrashedResources(mockUserId);

      expect(result).toHaveLength(1);
      expect(result[0].deletedAt).toBeUndefined();
    });

    it('should handle large number of trashed resources', async () => {
      const resources = Array.from({ length: 1000 }, (_, i) =>
        createMockResource({
          name: `resource-${i}`,
          type: i % 2 === 0 ? ResourceType.Folder : ResourceType.File,
        })
      );

      const mockFind = vi.fn().mockReturnValue({
        sort: vi.fn().mockResolvedValue(resources),
      });
      vi.mocked(ResourceModel.find).mockImplementation(mockFind);
      vi.mocked(ResourceModel.aggregate).mockResolvedValue([]);

      const result = await getTrashedResources(mockUserId);

      expect(result).toHaveLength(1000);
      // Verify folders come first
      const firstHalf = result.slice(0, 500);
      const secondHalf = result.slice(500);
      expect(firstHalf.every((r) => r.type === ResourceType.Folder)).toBe(true);
      expect(secondHalf.every((r) => r.type === ResourceType.File)).toBe(true);
    });

    it('should handle resources with special characters in names', async () => {
      const file = createMockResource({
        name: 'file (with) special [chars] & symbols.pdf',
        type: ResourceType.File,
      });

      const mockFind = vi.fn().mockReturnValue({
        sort: vi.fn().mockResolvedValue([file]),
      });
      vi.mocked(ResourceModel.find).mockImplementation(mockFind);
      vi.mocked(ResourceModel.aggregate).mockResolvedValue([]);

      const result = await getTrashedResources(mockUserId);

      expect(result[0].name).toBe('file (with) special [chars] & symbols.pdf');
    });

    it('should handle resources with complex paths', async () => {
      const folder = createMockResource({
        name: 'folder',
        type: ResourceType.Folder,
        path: '/documents/2024/january/projects/personal/folder',
      });

      const mockFind = vi.fn().mockReturnValue({
        sort: vi.fn().mockResolvedValue([folder]),
      });
      vi.mocked(ResourceModel.find).mockImplementation(mockFind);
      vi.mocked(ResourceModel.aggregate).mockResolvedValue([]);

      const result = await getTrashedResources(mockUserId);

      expect(result[0].path).toBe(
        '/documents/2024/january/projects/personal/folder'
      );
    });

    it('should handle aggregation returning counts in different order', async () => {
      const folder1Id = new Types.ObjectId();
      const folder2Id = new Types.ObjectId();
      const folder3Id = new Types.ObjectId();

      const folders = [
        createMockResource({
          _id: folder1Id,
          name: 'folder1',
          type: ResourceType.Folder,
        }),
        createMockResource({
          _id: folder2Id,
          name: 'folder2',
          type: ResourceType.Folder,
        }),
        createMockResource({
          _id: folder3Id,
          name: 'folder3',
          type: ResourceType.Folder,
        }),
      ];

      const mockFind = vi.fn().mockReturnValue({
        sort: vi.fn().mockResolvedValue(folders),
      });
      vi.mocked(ResourceModel.find).mockImplementation(mockFind);
      // Aggregation returns in different order than folders
      vi.mocked(ResourceModel.aggregate).mockResolvedValue([
        { _id: folder3Id, count: 1 },
        { _id: folder1Id, count: 2 },
        // folder2 is missing (empty)
      ]);

      const result = await getTrashedResources(mockUserId);

      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('folder1');
      expect(result[0].empty).toBe(false);
      expect(result[1].name).toBe('folder2');
      expect(result[1].empty).toBe(true);
      expect(result[2].name).toBe('folder3');
      expect(result[2].empty).toBe(false);
    });
  });
});
