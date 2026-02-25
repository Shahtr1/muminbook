/**
 * @fileoverview Restore Resource Service Test Suite
 *
 * Tests for restore-resource service:
 * - restoreResource: Restores a single resource from trash
 * - restoreAllResources: Restores all possible resources from trash
 * - Handles parent validation and lost+found restoration
 * - Manages conflict detection
 * - Updates descendants paths and deleted status
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Types } from 'mongoose';
import {
  restoreResource,
  restoreAllResources,
} from '../restore-resource.service.js';
import ResourceModel from '../../../../models/resource.model.js';
import ResourceType from '../../../../constants/types/resourceType.js';
import { PrimaryId } from '../../../../constants/ids.js';
import AppError from '../../../../utils/AppError.js';
import {
  NOT_FOUND,
  BAD_REQUEST,
  CONFLICT,
} from '../../../../constants/http.js';

vi.mock('../../../../models/resource.model', () => {
  const MockResourceModel: any = {
    findOne: vi.fn(),
    find: vi.fn(),
    findOneAndUpdate: vi.fn(),
    bulkWrite: vi.fn(),
  };

  return {
    default: MockResourceModel,
  };
});

vi.mock('../../common-resource.service.js', () => ({
  findDescendantsByPath: vi.fn(),
}));

vi.mock('../../utils/findOrCreateLostAndFound.js', () => ({
  findOrCreateLostAndFound: vi.fn(),
}));

import { findDescendantsByPath } from '../../common-resource.service.js';
import { findOrCreateLostAndFound } from '../../utils/findOrCreateLostAndFound.js';

describe('Restore Resource Service', () => {
  const mockUserId = new Types.ObjectId() as PrimaryId;
  const mockResourceId = new Types.ObjectId() as PrimaryId;
  const mockParentId = new Types.ObjectId() as PrimaryId;
  const mockLostAndFoundId = new Types.ObjectId() as PrimaryId;

  beforeEach(() => {
    vi.resetAllMocks();
  });

  const createMockResource = (overrides: any = {}) => ({
    _id: mockResourceId,
    userId: mockUserId,
    name: 'Test Resource',
    type: ResourceType.File,
    path: '/documents/test-file.pdf',
    parent: mockParentId,
    deleted: true,
    deletedAt: new Date(),
    ...overrides,
  });

  const createMockLostAndFound = () => ({
    _id: mockLostAndFoundId,
    userId: mockUserId,
    name: 'lost+found',
    type: ResourceType.Folder,
    path: 'my-files/lost+found',
    parent: new Types.ObjectId(),
    deleted: false,
  });

  describe('restoreResource - Basic validation', () => {
    it('should throw NOT_FOUND error when resource does not exist', async () => {
      vi.mocked(ResourceModel.findOne).mockResolvedValue(null);

      await expect(restoreResource(mockResourceId, mockUserId)).rejects.toThrow(
        AppError
      );

      await expect(
        restoreResource(mockResourceId, mockUserId)
      ).rejects.toMatchObject({
        statusCode: NOT_FOUND,
        message: 'Resource not found',
      });

      expect(ResourceModel.findOne).toHaveBeenCalledWith({
        _id: mockResourceId,
        userId: mockUserId,
      });
    });

    it('should throw error when resource belongs to different user', async () => {
      const differentUserId = new Types.ObjectId() as PrimaryId;
      vi.mocked(ResourceModel.findOne).mockResolvedValue(null);

      await expect(
        restoreResource(mockResourceId, differentUserId)
      ).rejects.toThrow();
    });

    it('should throw BAD_REQUEST when resource is not in trash', async () => {
      const resource = createMockResource({ deleted: false });
      vi.mocked(ResourceModel.findOne).mockResolvedValue(resource as any);

      await expect(restoreResource(mockResourceId, mockUserId)).rejects.toThrow(
        AppError
      );

      await expect(
        restoreResource(mockResourceId, mockUserId)
      ).rejects.toMatchObject({
        statusCode: BAD_REQUEST,
        message: 'Resource is not in trash',
      });
    });
  });

  describe('restoreResource - Normal restoration (parent exists)', () => {
    it('should successfully restore a file to original location', async () => {
      const file = createMockResource({
        name: 'document.pdf',
        type: ResourceType.File,
        path: '/documents/document.pdf',
        deleted: true,
      });

      const parentFolder = {
        path: '/documents',
        type: ResourceType.Folder,
        deleted: false,
      };

      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce(file as any) // First call: get resource
        .mockResolvedValueOnce(parentFolder as any) // Second call: parent chain check
        .mockResolvedValueOnce(parentFolder as any) // Third call: check parent exists
        .mockResolvedValueOnce(null); // Fourth call: no conflict

      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      const result = await restoreResource(mockResourceId, mockUserId);

      expect(result).toEqual({ message: 'Restored successfully' });
      expect(ResourceModel.bulkWrite).toHaveBeenCalledWith([
        {
          updateOne: {
            filter: { _id: file._id },
            update: {
              $set: {
                deleted: false,
                deletedAt: null,
                path: '/documents/document.pdf',
                parent: mockParentId,
              },
            },
          },
        },
      ]);
    });

    it('should throw CONFLICT when file already exists at destination', async () => {
      const file = createMockResource({
        path: '/documents/report.pdf',
        type: ResourceType.File,
        deleted: true,
      });

      const parentFolder = {
        path: '/documents',
        type: ResourceType.Folder,
        deleted: false,
      };

      const conflictingFile = {
        path: '/documents/report.pdf',
        type: 'file',
        deleted: false,
      };

      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce(file as any) // Get resource
        .mockResolvedValueOnce(parentFolder as any) // Parent chain check
        .mockResolvedValueOnce(parentFolder as any) // Check parent exists
        .mockResolvedValueOnce(conflictingFile as any) // First hasConflict check
        .mockResolvedValueOnce(conflictingFile as any); // Second hasConflict check

      await expect(
        restoreResource(mockResourceId, mockUserId)
      ).rejects.toMatchObject({
        statusCode: CONFLICT,
        message: 'A file with this name already exists in the destination path',
      });
    });

    it('should throw CONFLICT with correct message for folder conflict', async () => {
      const folder = createMockResource({
        path: '/documents/folder',
        type: ResourceType.Folder,
        deleted: true,
      });

      const parentFolder = {
        path: '/documents',
        type: ResourceType.Folder,
        deleted: false,
      };

      const conflictingFolder = {
        path: '/documents/folder',
        type: 'folder',
        deleted: false,
      };

      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce(folder as any)
        .mockResolvedValueOnce(parentFolder as any)
        .mockResolvedValueOnce(parentFolder as any)
        .mockResolvedValueOnce(conflictingFolder as any)
        .mockResolvedValueOnce(conflictingFolder as any);

      await expect(
        restoreResource(mockResourceId, mockUserId)
      ).rejects.toMatchObject({
        statusCode: CONFLICT,
        message:
          'A folder with this name already exists in the destination path',
      });
    });

    it('should restore empty folder to original location', async () => {
      const folder = createMockResource({
        name: 'Empty Folder',
        type: ResourceType.Folder,
        path: '/documents/empty-folder',
        deleted: true,
      });

      const parentFolder = {
        path: '/documents',
        type: ResourceType.Folder,
        deleted: false,
      };

      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce(folder as any)
        .mockResolvedValueOnce(parentFolder as any)
        .mockResolvedValueOnce(parentFolder as any)
        .mockResolvedValueOnce(null);

      vi.mocked(findDescendantsByPath).mockResolvedValue([]);
      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      const result = await restoreResource(mockResourceId, mockUserId);

      expect(result).toEqual({ message: 'Restored successfully' });
      // The service may call findDescendantsByPath without the optional includeTrashed
      // parameter (it defaults to true). Validate the call exists and check the key args.
      expect(findDescendantsByPath).toHaveBeenCalled();
      const callArgs = vi.mocked(findDescendantsByPath).mock.calls[0];
      expect(callArgs[0]).toBe('/documents/empty-folder');
      // userId may be an ObjectId or string depending on call site; stringify for comparison
      expect(callArgs[1].toString()).toBe(mockUserId.toString());
    });

    it('should restore folder with descendants', async () => {
      const folder = createMockResource({
        _id: mockResourceId,
        name: 'Parent',
        type: ResourceType.Folder,
        path: '/documents/parent',
        deleted: true,
      });

      const child1 = {
        _id: new Types.ObjectId(),
        name: 'child1.pdf',
        path: '/documents/parent/child1.pdf',
        parent: mockResourceId,
        deleted: true,
      };

      const child2 = {
        _id: new Types.ObjectId(),
        name: 'child2.pdf',
        path: '/documents/parent/child2.pdf',
        parent: mockResourceId,
        deleted: true,
      };

      const parentFolder = {
        path: '/documents',
        type: ResourceType.Folder,
        deleted: false,
      };

      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce(folder as any)
        .mockResolvedValueOnce(parentFolder as any)
        .mockResolvedValueOnce(parentFolder as any)
        .mockResolvedValueOnce(null);

      vi.mocked(findDescendantsByPath).mockResolvedValue([
        child1,
        child2,
      ] as any);
      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      await restoreResource(mockResourceId, mockUserId);

      expect(ResourceModel.bulkWrite).toHaveBeenCalledWith([
        {
          updateOne: {
            filter: { _id: child1._id },
            update: {
              $set: {
                deleted: false,
                deletedAt: null,
                path: '/documents/parent/child1.pdf',
                parent: mockResourceId,
              },
            },
          },
        },
        {
          updateOne: {
            filter: { _id: child2._id },
            update: {
              $set: {
                deleted: false,
                deletedAt: null,
                path: '/documents/parent/child2.pdf',
                parent: mockResourceId,
              },
            },
          },
        },
        {
          updateOne: {
            filter: { _id: folder._id },
            update: {
              $set: {
                deleted: false,
                deletedAt: null,
                path: '/documents/parent',
                parent: mockParentId,
              },
            },
          },
        },
      ]);
    });

    it('should restore nested folder hierarchy correctly', async () => {
      const rootFolder = createMockResource({
        _id: mockResourceId,
        type: ResourceType.Folder,
        path: '/root',
        parent: mockParentId,
      });

      const subFolder = {
        _id: new Types.ObjectId(),
        path: '/root/subfolder',
        parent: mockResourceId,
        type: ResourceType.Folder,
      };

      const deepFile = {
        _id: new Types.ObjectId(),
        path: '/root/subfolder/deep.pdf',
        parent: subFolder._id,
        type: ResourceType.File,
      };

      const parentFolder = {
        path: '',
        type: ResourceType.Folder,
        deleted: false,
      };

      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce(rootFolder as any)
        .mockResolvedValueOnce(parentFolder as any)
        .mockResolvedValueOnce(null);

      vi.mocked(findDescendantsByPath).mockResolvedValue([
        subFolder,
        deepFile,
      ] as any);
      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      await restoreResource(mockResourceId, mockUserId);

      const bulkWriteCall = vi.mocked(ResourceModel.bulkWrite).mock
        .calls[0][0] as any;
      expect(bulkWriteCall).toHaveLength(3);

      // Verify paths are correct
      expect(bulkWriteCall[0].updateOne.update.$set.path).toBe(
        '/root/subfolder'
      );
      expect(bulkWriteCall[1].updateOne.update.$set.path).toBe(
        '/root/subfolder/deep.pdf'
      );
      expect(bulkWriteCall[2].updateOne.update.$set.path).toBe('/root');
    });
  });

  describe('restoreResource - Lost+found restoration (parent missing)', () => {
    it('should restore to lost+found when parent folder does not exist', async () => {
      const file = createMockResource({
        name: 'orphan.pdf',
        path: '/deleted-folder/orphan.pdf',
        deleted: true,
      });

      const lostAndFound = createMockLostAndFound();
      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce(file as any) // Get resource
        .mockResolvedValueOnce(null) // Parent chain check
        .mockResolvedValueOnce(null); // Parent does not exist

      vi.mocked(findOrCreateLostAndFound).mockResolvedValue(lostAndFound as any);
      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      const result = await restoreResource(mockResourceId, mockUserId);

      expect(result).toEqual({ message: 'Restored to lost+found' });
      expect(ResourceModel.bulkWrite).toHaveBeenCalledWith([
        {
          updateOne: {
            filter: { _id: file._id },
            update: {
              $set: {
                deleted: false,
                deletedAt: null,
                path: 'my-files/lost+found/orphan.pdf',
                parent: mockLostAndFoundId,
              },
            },
          },
        },
      ]);
    });

    it('should restore folder to lost+found when parent is deleted', async () => {
      const folder = createMockResource({
        name: 'orphan-folder',
        type: ResourceType.Folder,
        path: '/deleted-parent/orphan-folder',
        deleted: true,
      });

      const lostAndFound = createMockLostAndFound();
      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce(folder as any)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      vi.mocked(findOrCreateLostAndFound).mockResolvedValue(lostAndFound as any);
      vi.mocked(findDescendantsByPath).mockResolvedValue([]);
      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      const result = await restoreResource(mockResourceId, mockUserId);

      expect(result).toEqual({ message: 'Restored to lost+found' });
      expect(ResourceModel.bulkWrite).toHaveBeenCalledWith([
        {
          updateOne: {
            filter: { _id: folder._id },
            update: {
              $set: {
                deleted: false,
                deletedAt: null,
                path: 'my-files/lost+found/orphan-folder',
                parent: mockLostAndFoundId,
              },
            },
          },
        },
      ]);
    });

    it('should restore folder with descendants to lost+found', async () => {
      const folder = createMockResource({
        _id: mockResourceId,
        name: 'orphan-folder',
        type: ResourceType.Folder,
        path: '/missing/orphan-folder',
      });

      const child = {
        _id: new Types.ObjectId(),
        name: 'child.pdf',
        path: '/missing/orphan-folder/child.pdf',
        parent: mockResourceId,
      };

      const lostAndFound = createMockLostAndFound();
      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce(folder as any)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      vi.mocked(findOrCreateLostAndFound).mockResolvedValue(lostAndFound as any);
      vi.mocked(findDescendantsByPath).mockResolvedValue([child] as any);
      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      await restoreResource(mockResourceId, mockUserId);

      const bulkWriteCall = vi.mocked(ResourceModel.bulkWrite).mock
        .calls[0][0] as any;
      expect(bulkWriteCall[0].updateOne.update.$set.path).toBe(
        'my-files/lost+found/orphan-folder/child.pdf'
      );
      expect(bulkWriteCall[1].updateOne.update.$set.path).toBe(
        'my-files/lost+found/orphan-folder'
      );
      expect(bulkWriteCall[1].updateOne.update.$set.parent).toBe(
        mockLostAndFoundId
      );
    });

    it('should normalize paths when restoring to lost+found', async () => {
      const file = createMockResource({
        name: 'file.pdf',
        path: '//deleted///file.pdf',
      });

      const lostAndFound = createMockLostAndFound();
      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce(file as any)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      vi.mocked(findOrCreateLostAndFound).mockResolvedValue(lostAndFound as any);
      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      await restoreResource(mockResourceId, mockUserId);

      const bulkWriteCall = vi.mocked(ResourceModel.bulkWrite).mock
        .calls[0][0] as any;
      expect(bulkWriteCall[0].updateOne.update.$set.path).toBe(
        'my-files/lost+found/file.pdf'
      );
    });
  });

  describe('restoreAllResources - Basic functionality', () => {
    it('should throw NOT_FOUND when no trashed resources exist', async () => {
      vi.mocked(ResourceModel.find).mockResolvedValue([]);

      await expect(restoreAllResources(mockUserId)).rejects.toThrow(AppError);

      await expect(restoreAllResources(mockUserId)).rejects.toMatchObject({
        statusCode: NOT_FOUND,
        message: 'No trashed resources found',
      });

      expect(ResourceModel.find).toHaveBeenCalledWith({
        userId: mockUserId,
        deleted: true,
      });
    });

    it('should restore all trashed resources when no conflicts exist', async () => {
      const file1 = createMockResource({
        _id: new Types.ObjectId(),
        name: 'file1.pdf',
        path: '/documents/file1.pdf',
      });

      const file2 = createMockResource({
        _id: new Types.ObjectId(),
        name: 'file2.pdf',
        path: '/documents/file2.pdf',
      });

      const parentFolder = {
        path: '/documents',
        type: ResourceType.Folder,
        deleted: false,
      };

      vi.mocked(ResourceModel.find).mockResolvedValue([file1, file2] as any);
      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce(parentFolder as any)
        .mockResolvedValueOnce(null) // No conflict for file1
        .mockResolvedValueOnce(parentFolder as any)
        .mockResolvedValueOnce(null); // No conflict for file2

      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      const result = await restoreAllResources(mockUserId);

      expect(result).toEqual({
        message: 'All possible resources restored from trash',
      });
      expect(ResourceModel.bulkWrite).toHaveBeenCalledTimes(2);
    });

    it('should skip resources with conflicts', async () => {
      const file1 = createMockResource({
        _id: new Types.ObjectId(),
        name: 'file1.pdf',
        path: '/documents/file1.pdf',
      });

      const file2 = createMockResource({
        _id: new Types.ObjectId(),
        name: 'file2.pdf',
        path: '/documents/file2.pdf',
      });

      const parentFolder = {
        path: '/documents',
        type: ResourceType.Folder,
        deleted: false,
      };

      const conflictingFile = {
        path: '/documents/file1.pdf',
        deleted: false,
      };

      vi.mocked(ResourceModel.find).mockResolvedValue([file1, file2] as any);
      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce(parentFolder as any)
        .mockResolvedValueOnce(conflictingFile as any) // file1 has conflict
        .mockResolvedValueOnce(parentFolder as any)
        .mockResolvedValueOnce(null); // file2 has no conflict

      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      const result = await restoreAllResources(mockUserId);

      expect(result).toEqual({
        message: 'All possible resources restored from trash',
      });
      expect(ResourceModel.bulkWrite).toHaveBeenCalledTimes(1); // Only file2 restored
    });

    it('should restore orphaned resources to lost+found', async () => {
      const orphan1 = createMockResource({
        _id: new Types.ObjectId(),
        name: 'orphan1.pdf',
        path: '/deleted/orphan1.pdf',
      });

      const orphan2 = createMockResource({
        _id: new Types.ObjectId(),
        name: 'orphan2.pdf',
        path: '/deleted/orphan2.pdf',
      });

      const lostAndFound = createMockLostAndFound();
      vi.mocked(ResourceModel.find).mockResolvedValue([
        orphan1,
        orphan2,
      ] as any);
      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce(null) // orphan1 parent missing
        .mockResolvedValueOnce(null); // orphan2 parent missing

      vi.mocked(findOrCreateLostAndFound).mockResolvedValue(lostAndFound as any);
      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      const result = await restoreAllResources(mockUserId);

      expect(result).toEqual({
        message: 'All possible resources restored from trash',
      });
      expect(ResourceModel.bulkWrite).toHaveBeenCalledTimes(2);
    });

    it('should handle mix of normal and lost+found restorations', async () => {
      const normalFile = createMockResource({
        _id: new Types.ObjectId(),
        name: 'normal.pdf',
        path: '/documents/normal.pdf',
      });

      const orphanFile = createMockResource({
        _id: new Types.ObjectId(),
        name: 'orphan.pdf',
        path: '/deleted/orphan.pdf',
      });

      const parentFolder = {
        path: '/documents',
        type: ResourceType.Folder,
        deleted: false,
      };

      const lostAndFound = createMockLostAndFound();
      vi.mocked(ResourceModel.find).mockResolvedValue([
        normalFile,
        orphanFile,
      ] as any);
      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce(parentFolder as any)
        .mockResolvedValueOnce(null) // normal file has no conflict
        .mockResolvedValueOnce(null); // orphan parent missing

      vi.mocked(findOrCreateLostAndFound).mockResolvedValue(lostAndFound as any);
      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      await restoreAllResources(mockUserId);

      expect(ResourceModel.bulkWrite).toHaveBeenCalledTimes(2);
    });

    it('should restore folders with descendants', async () => {
      const folder = createMockResource({
        _id: mockResourceId,
        type: ResourceType.Folder,
        path: '/documents/folder',
      });

      const child = {
        _id: new Types.ObjectId(),
        path: '/documents/folder/child.pdf',
        parent: mockResourceId,
      };

      const parentFolder = {
        path: '/documents',
        type: ResourceType.Folder,
        deleted: false,
      };

      vi.mocked(ResourceModel.find).mockResolvedValue([folder] as any);
      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce(parentFolder as any)
        .mockResolvedValueOnce(null);

      vi.mocked(findDescendantsByPath).mockResolvedValue([child] as any);
      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      await restoreAllResources(mockUserId);

      const bulkWriteCall = vi.mocked(ResourceModel.bulkWrite).mock
        .calls[0][0] as any;
      expect(bulkWriteCall).toHaveLength(2); // child + parent
    });
  });

  describe('Edge cases', () => {
    it('should handle resource at root level', async () => {
      const file = createMockResource({
        path: '/file.pdf',
        parent: null,
      });

      const rootFolder = {
        path: '',
        type: ResourceType.Folder,
        deleted: false,
      };

      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce(file as any)
        .mockResolvedValueOnce(rootFolder as any)
        .mockResolvedValueOnce(null);

      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      await restoreResource(mockResourceId, mockUserId);

      expect(ResourceModel.bulkWrite).toHaveBeenCalled();
    });

    it('should handle resource with special characters in name', async () => {
      const file = createMockResource({
        name: 'file (copy) [2].pdf',
        path: '/documents/file (copy) [2].pdf',
      });

      const parentFolder = {
        path: '/documents',
        type: ResourceType.Folder,
        deleted: false,
      };

      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce(file as any)
        .mockResolvedValueOnce(parentFolder as any)
        .mockResolvedValueOnce(parentFolder as any)
        .mockResolvedValueOnce(null);

      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      await restoreResource(mockResourceId, mockUserId);

      const bulkWriteCall = vi.mocked(ResourceModel.bulkWrite).mock
        .calls[0][0] as any;
      expect(bulkWriteCall[0].updateOne.update.$set.path).toBe(
        '/documents/file (copy) [2].pdf'
      );
    });

    it('should handle deeply nested folder hierarchy', async () => {
      const folder = createMockResource({
        _id: mockResourceId,
        type: ResourceType.Folder,
        path: '/a/b/c/d/e',
      });

      const descendants = Array.from({ length: 10 }, (_, i) => ({
        _id: new Types.ObjectId(),
        path: `/a/b/c/d/e/file${i}.pdf`,
        parent: mockResourceId,
      }));

      const parentFolder = {
        path: '/a/b/c/d',
        type: ResourceType.Folder,
        deleted: false,
      };

      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce(folder as any)
        .mockResolvedValueOnce(parentFolder as any)
        .mockResolvedValueOnce(parentFolder as any)
        .mockResolvedValueOnce(null);

      vi.mocked(findDescendantsByPath).mockResolvedValue(descendants as any);
      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      await restoreResource(mockResourceId, mockUserId);

      const bulkWriteCall = vi.mocked(ResourceModel.bulkWrite).mock
        .calls[0][0] as any;
      expect(bulkWriteCall).toHaveLength(11); // 10 files + 1 folder
    });

    it('should handle large number of trashed resources in restoreAll', async () => {
      const resources = Array.from({ length: 100 }, (_, i) =>
        createMockResource({
          _id: new Types.ObjectId(),
          name: `file${i}.pdf`,
          path: `/documents/file${i}.pdf`,
        })
      );

      const parentFolder = {
        path: '/documents',
        type: ResourceType.Folder,
        deleted: false,
      };

      vi.mocked(ResourceModel.find).mockResolvedValue(resources as any);
      vi.mocked(ResourceModel.findOne).mockImplementation(((query: any) => {
        if (query.path === '/documents') {
          return Promise.resolve(parentFolder as any);
        }
        return Promise.resolve(null);
      }) as any);

      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      await restoreAllResources(mockUserId);

      expect(ResourceModel.bulkWrite).toHaveBeenCalledTimes(100);
    });

    it('should handle resource with empty name', async () => {
      const file = createMockResource({
        name: '',
        path: '/missing/',
      });

      const lostAndFound = createMockLostAndFound();
      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce(file as any)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      vi.mocked(findOrCreateLostAndFound).mockResolvedValue(lostAndFound as any);
      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      await restoreResource(mockResourceId, mockUserId);

      const bulkWriteCall = vi.mocked(ResourceModel.bulkWrite).mock
        .calls[0][0] as any;
      expect(bulkWriteCall[0].updateOne.update.$set.path).toContain(
        'lost+found'
      );
    });

    it('should maintain parent references for nested descendants', async () => {
      const folder = createMockResource({
        _id: mockResourceId,
        type: ResourceType.Folder,
        path: '/root',
      });

      const subFolder = {
        _id: new Types.ObjectId(),
        path: '/root/subfolder',
        parent: mockResourceId,
        type: ResourceType.Folder,
      };

      const deepFile = {
        _id: new Types.ObjectId(),
        path: '/root/subfolder/file.pdf',
        parent: subFolder._id,
        type: ResourceType.File,
      };

      const parentFolder = {
        path: '',
        type: ResourceType.Folder,
        deleted: false,
      };

      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce(folder as any)
        .mockResolvedValueOnce(parentFolder as any)
        .mockResolvedValueOnce(parentFolder as any)
        .mockResolvedValueOnce(null);

      vi.mocked(findDescendantsByPath).mockResolvedValue([
        subFolder,
        deepFile,
      ] as any);
      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      await restoreResource(mockResourceId, mockUserId);

      const bulkWriteCall = vi.mocked(ResourceModel.bulkWrite).mock
        .calls[0][0] as any;

      // SubFolder should keep folder._id as parent
      expect(bulkWriteCall[0].updateOne.update.$set.parent).toBe(
        mockResourceId
      );

      // Deep file should keep subFolder._id as parent (not changed)
      expect(bulkWriteCall[1].updateOne.update.$set.parent).toBe(subFolder._id);

      // Root folder should keep its original parent
      expect(bulkWriteCall[2].updateOne.update.$set.parent).toBe(mockParentId);
    });
  });

  describe('Error handling', () => {
    it('should propagate errors from ResourceModel.findOne', async () => {
      const dbError = new Error('Database connection failed');
      vi.mocked(ResourceModel.findOne).mockRejectedValue(dbError);

      await expect(restoreResource(mockResourceId, mockUserId)).rejects.toThrow(
        'Database connection failed'
      );
    });

    it('should propagate errors from findDescendantsByPath', async () => {
      const folder = createMockResource({
        type: ResourceType.Folder,
      });

      const parentFolder = {
        path: '/documents',
        type: ResourceType.Folder,
        deleted: false,
      };

      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce(folder as any)
        .mockResolvedValueOnce(parentFolder as any)
        .mockResolvedValueOnce(parentFolder as any)
        .mockResolvedValueOnce(null);

      vi.mocked(findDescendantsByPath).mockRejectedValue(
        new Error('Failed to get descendants')
      );

      await expect(restoreResource(mockResourceId, mockUserId)).rejects.toThrow(
        'Failed to get descendants'
      );
    });

    it('should propagate errors from findOrCreateLostAndFound', async () => {
      const file = createMockResource({
        path: '/deleted/file.pdf',
      });

      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce(file as any)
        .mockResolvedValueOnce(null)
        .mockRejectedValueOnce(new Error('Root folder not found')); // findOrCreateLostAndFound needs root folder

      await expect(restoreResource(mockResourceId, mockUserId)).rejects.toThrow(
        'Root folder not found'
      );
    });

    it('should propagate errors from bulkWrite', async () => {
      const file = createMockResource();

      const parentFolder = {
        path: '',
        type: ResourceType.Folder,
        deleted: false,
      };

      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce(file as any)
        .mockResolvedValueOnce(parentFolder as any)
        .mockResolvedValueOnce(parentFolder as any)
        .mockResolvedValueOnce(null);

      vi.mocked(ResourceModel.bulkWrite).mockRejectedValue(
        new Error('Bulk write failed')
      );

      await expect(restoreResource(mockResourceId, mockUserId)).rejects.toThrow(
        'Bulk write failed'
      );
    });

    it('should propagate errors in restoreAllResources', async () => {
      const file = createMockResource();

      vi.mocked(ResourceModel.find).mockResolvedValue([file] as any);
      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce({ deleted: false } as any)
        .mockResolvedValueOnce(null);

      vi.mocked(ResourceModel.bulkWrite).mockRejectedValue(
        new Error('Bulk write failed')
      );

      await expect(restoreAllResources(mockUserId)).rejects.toThrow(
        'Bulk write failed'
      );
    });
  });
});
