/**
 * @fileoverview Move To Trash Resource Service Test Suite
 *
 * Tests for moveToTrashResource service:
 * - Moves resources to trash (soft delete)
 * - Handles folders and their descendants
 * - Removes conflicting trashed resources with same path
 * - Validates resource ownership and existence
 * - Prevents modification of root folder
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Types } from 'mongoose';
import { moveToTrashResource } from '../moveToTrash-resource.service';
import ResourceModel from '../../../../models/resource.model';
import ResourceType from '../../../../constants/types/resourceType';
import { PrimaryId } from '../../../../constants/primaryId';
import AppError from '../../../../utils/AppError';
import { NOT_FOUND, BAD_REQUEST } from '../../../../constants/http';

vi.mock('../../../../models/resource.model', () => {
  const MockResourceModel: any = {
    findOne: vi.fn(),
    deleteMany: vi.fn(),
    bulkWrite: vi.fn(),
    find: vi.fn(),
  };

  return {
    default: MockResourceModel,
  };
});

vi.mock('../../common-resource.service', () => ({
  assertNotRootFolder: vi.fn(),
  findDescendantsByPath: vi.fn(),
}));

import {
  assertNotRootFolder,
  findDescendantsByPath,
} from '../../common-resource.service';

describe('moveToTrashResource', () => {
  const mockUserId = new Types.ObjectId() as PrimaryId;
  const mockResourceId = new Types.ObjectId() as PrimaryId;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockResource = (overrides: any = {}) => ({
    _id: mockResourceId,
    userId: mockUserId,
    name: 'Test Resource',
    type: ResourceType.File,
    path: '/test-file.pdf',
    parent: new Types.ObjectId(),
    deleted: false,
    deletedAt: null,
    ...overrides,
  });

  describe('Basic validation', () => {
    it('should throw NOT_FOUND error when resource does not exist', async () => {
      vi.mocked(ResourceModel.findOne).mockResolvedValue(null);

      expect(moveToTrashResource(mockResourceId, mockUserId)).rejects.toThrow(
        AppError
      );

      expect(
        moveToTrashResource(mockResourceId, mockUserId)
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
        moveToTrashResource(mockResourceId, differentUserId)
      ).rejects.toThrow();

      expect(ResourceModel.findOne).toHaveBeenCalledWith({
        _id: mockResourceId,
        userId: differentUserId,
      });
    });

    it('should call assertNotRootFolder to validate resource is not root', async () => {
      const resource = createMockResource();
      vi.mocked(ResourceModel.findOne).mockResolvedValue(resource as any);
      vi.mocked(assertNotRootFolder).mockImplementation(() => {
        throw new AppError(BAD_REQUEST, 'Cannot modify root folder');
      });

      await expect(
        moveToTrashResource(mockResourceId, mockUserId)
      ).rejects.toThrow('Cannot modify root folder');

      expect(assertNotRootFolder).toHaveBeenCalledWith(resource);
    });
  });

  describe('Moving file to trash', () => {
    it('should successfully move a file to trash', async () => {
      const file = createMockResource({
        name: 'document.pdf',
        type: ResourceType.File,
        path: '/documents/document.pdf',
      });

      vi.mocked(ResourceModel.findOne).mockResolvedValue(file as any);
      vi.mocked(assertNotRootFolder).mockImplementation(() => {});
      vi.mocked(ResourceModel.deleteMany).mockResolvedValue({
        deletedCount: 0,
      } as any);
      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      await moveToTrashResource(mockResourceId, mockUserId);

      expect(ResourceModel.bulkWrite).toHaveBeenCalledWith([
        {
          updateOne: {
            filter: { _id: file._id },
            update: {
              $set: {
                deleted: true,
                deletedAt: expect.any(Date),
              },
            },
          },
        },
      ]);
    });

    it('should remove existing trashed file with same path before moving', async () => {
      const file = createMockResource({
        path: '/documents/report.pdf',
        type: ResourceType.File,
      });

      vi.mocked(ResourceModel.findOne).mockResolvedValue(file as any);
      vi.mocked(assertNotRootFolder).mockImplementation(() => {});
      vi.mocked(ResourceModel.deleteMany).mockResolvedValue({
        deletedCount: 1,
      } as any);
      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      await moveToTrashResource(mockResourceId, mockUserId);

      expect(ResourceModel.deleteMany).toHaveBeenCalledWith({
        path: '/documents/report.pdf',
        userId: mockUserId,
        deleted: true,
      });
    });

    it('should set deletedAt timestamp when moving file to trash', async () => {
      const file = createMockResource({
        type: ResourceType.File,
      });
      const beforeTime = new Date();

      vi.mocked(ResourceModel.findOne).mockResolvedValue(file as any);
      vi.mocked(assertNotRootFolder).mockImplementation(() => {});
      vi.mocked(ResourceModel.deleteMany).mockResolvedValue({
        deletedCount: 0,
      } as any);
      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      await moveToTrashResource(mockResourceId, mockUserId);

      const afterTime = new Date();
      const bulkWriteCall = vi.mocked(ResourceModel.bulkWrite).mock
        .calls[0][0] as any;
      const deletedAt = bulkWriteCall[0].updateOne.update.$set.deletedAt;

      expect(deletedAt).toBeInstanceOf(Date);
      expect(deletedAt.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(deletedAt.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });

    it('should not call getAllDescendants for files', async () => {
      const file = createMockResource({
        type: ResourceType.File,
      });

      vi.mocked(ResourceModel.findOne).mockResolvedValue(file as any);
      vi.mocked(assertNotRootFolder).mockImplementation(() => {});
      vi.mocked(ResourceModel.deleteMany).mockResolvedValue({
        deletedCount: 0,
      } as any);
      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      await moveToTrashResource(mockResourceId, mockUserId);

      expect(findDescendantsByPath).not.toHaveBeenCalled();
    });
  });

  describe('Moving empty folder to trash', () => {
    it('should successfully move empty folder to trash', async () => {
      const folder = createMockResource({
        name: 'Empty Folder',
        type: ResourceType.Folder,
        path: '/documents/empty-folder',
      });

      vi.mocked(ResourceModel.findOne).mockResolvedValue(folder as any);
      vi.mocked(assertNotRootFolder).mockImplementation(() => {});
      vi.mocked(findDescendantsByPath).mockResolvedValue([]);
      vi.mocked(ResourceModel.deleteMany).mockResolvedValue({
        deletedCount: 0,
      } as any);
      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      await moveToTrashResource(mockResourceId, mockUserId);

      expect(findDescendantsByPath).toHaveBeenCalledWith(
        '/documents/empty-folder',
        mockUserId
      );

      expect(ResourceModel.bulkWrite).toHaveBeenCalledWith([
        {
          updateOne: {
            filter: { _id: folder._id },
            update: {
              $set: {
                deleted: true,
                deletedAt: expect.any(Date),
              },
            },
          },
        },
      ]);
    });

    it('should remove existing trashed folder with same path', async () => {
      const folder = createMockResource({
        path: '/documents/folder',
        type: ResourceType.Folder,
      });

      vi.mocked(ResourceModel.findOne).mockResolvedValue(folder as any);
      vi.mocked(assertNotRootFolder).mockImplementation(() => {});
      vi.mocked(findDescendantsByPath).mockResolvedValue([]);
      vi.mocked(ResourceModel.deleteMany).mockResolvedValue({
        deletedCount: 1,
      } as any);
      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      await moveToTrashResource(mockResourceId, mockUserId);

      expect(ResourceModel.deleteMany).toHaveBeenCalledWith({
        path: '/documents/folder',
        userId: mockUserId,
        deleted: true,
      });
    });
  });

  describe('Moving folder with descendants to trash', () => {
    it('should move folder and all descendants to trash', async () => {
      const folder = createMockResource({
        _id: mockResourceId,
        name: 'Parent Folder',
        type: ResourceType.Folder,
        path: '/parent',
      });

      const child1 = createMockResource({
        _id: new Types.ObjectId(),
        name: 'child1.pdf',
        type: ResourceType.File,
        path: '/parent/child1.pdf',
      });

      const child2 = createMockResource({
        _id: new Types.ObjectId(),
        name: 'child2.pdf',
        type: ResourceType.File,
        path: '/parent/child2.pdf',
      });

      vi.mocked(ResourceModel.findOne).mockResolvedValue(folder as any);
      vi.mocked(assertNotRootFolder).mockImplementation(() => {});
      vi.mocked(findDescendantsByPath).mockResolvedValue([
        child1,
        child2,
      ] as any);
      vi.mocked(ResourceModel.deleteMany).mockResolvedValue({
        deletedCount: 0,
      } as any);
      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      await moveToTrashResource(mockResourceId, mockUserId);

      expect(ResourceModel.bulkWrite).toHaveBeenCalledWith([
        {
          updateOne: {
            filter: { _id: child1._id },
            update: {
              $set: {
                deleted: true,
                deletedAt: expect.any(Date),
              },
            },
          },
        },
        {
          updateOne: {
            filter: { _id: child2._id },
            update: {
              $set: {
                deleted: true,
                deletedAt: expect.any(Date),
              },
            },
          },
        },
        {
          updateOne: {
            filter: { _id: folder._id },
            update: {
              $set: {
                deleted: true,
                deletedAt: expect.any(Date),
              },
            },
          },
        },
      ]);
    });

    it('should move folder with nested hierarchy to trash', async () => {
      const folder = createMockResource({
        _id: mockResourceId,
        type: ResourceType.Folder,
        path: '/root',
      });

      const subFolder = createMockResource({
        _id: new Types.ObjectId(),
        type: ResourceType.Folder,
        path: '/root/subfolder',
      });

      const deepFile = createMockResource({
        _id: new Types.ObjectId(),
        type: ResourceType.File,
        path: '/root/subfolder/deep.pdf',
      });

      vi.mocked(ResourceModel.findOne).mockResolvedValue(folder as any);
      vi.mocked(assertNotRootFolder).mockImplementation(() => {});
      vi.mocked(findDescendantsByPath).mockResolvedValue([
        subFolder,
        deepFile,
      ] as any);
      vi.mocked(ResourceModel.deleteMany).mockResolvedValue({
        deletedCount: 0,
      } as any);
      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      await moveToTrashResource(mockResourceId, mockUserId);

      const bulkWriteCall = vi.mocked(ResourceModel.bulkWrite).mock.calls[0][0];
      expect(bulkWriteCall).toHaveLength(3); // 2 descendants + 1 parent

      // Verify all have same deletedAt timestamp
      const timestamps = bulkWriteCall.map(
        (op: any) => op.updateOne.update.$set.deletedAt
      );
      expect(timestamps[0]).toEqual(timestamps[1]);
      expect(timestamps[1]).toEqual(timestamps[2]);
    });

    it('should remove conflicting trashed descendants before moving', async () => {
      const folder = createMockResource({
        type: ResourceType.Folder,
        path: '/documents',
      });

      const child = createMockResource({
        _id: new Types.ObjectId(),
        path: '/documents/file.pdf',
        type: ResourceType.File,
      });

      vi.mocked(ResourceModel.findOne).mockResolvedValue(folder as any);
      vi.mocked(assertNotRootFolder).mockImplementation(() => {});
      vi.mocked(findDescendantsByPath).mockResolvedValue([child] as any);
      vi.mocked(ResourceModel.deleteMany).mockResolvedValue({
        deletedCount: 1,
      } as any);
      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      await moveToTrashResource(mockResourceId, mockUserId);

      // Should delete both parent and child conflicting paths
      expect(ResourceModel.deleteMany).toHaveBeenCalledTimes(2);
      expect(ResourceModel.deleteMany).toHaveBeenCalledWith({
        path: '/documents',
        userId: mockUserId,
        deleted: true,
      });
      expect(ResourceModel.deleteMany).toHaveBeenCalledWith({
        path: '/documents/file.pdf',
        userId: mockUserId,
        deleted: true,
      });
    });

    it('should handle folder with many descendants', async () => {
      const folder = createMockResource({
        type: ResourceType.Folder,
        path: '/large-folder',
      });

      const descendants = Array.from({ length: 100 }, (_, i) =>
        createMockResource({
          _id: new Types.ObjectId(),
          name: `file-${i}.pdf`,
          path: `/large-folder/file-${i}.pdf`,
          type: ResourceType.File,
        })
      );

      vi.mocked(ResourceModel.findOne).mockResolvedValue(folder as any);
      vi.mocked(assertNotRootFolder).mockImplementation(() => {});
      vi.mocked(findDescendantsByPath).mockResolvedValue(descendants as any);
      vi.mocked(ResourceModel.deleteMany).mockResolvedValue({
        deletedCount: 0,
      } as any);
      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      await moveToTrashResource(mockResourceId, mockUserId);

      const bulkWriteCall = vi.mocked(ResourceModel.bulkWrite).mock.calls[0][0];
      expect(bulkWriteCall).toHaveLength(101); // 100 descendants + 1 parent
    });
  });

  describe('Bulk operations', () => {
    it('should use bulkWrite for atomic updates', async () => {
      const file = createMockResource({
        type: ResourceType.File,
      });

      vi.mocked(ResourceModel.findOne).mockResolvedValue(file as any);
      vi.mocked(assertNotRootFolder).mockImplementation(() => {});
      vi.mocked(ResourceModel.deleteMany).mockResolvedValue({
        deletedCount: 0,
      } as any);
      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      await moveToTrashResource(mockResourceId, mockUserId);

      expect(ResourceModel.bulkWrite).toHaveBeenCalledTimes(1);
    });

    it('should execute bulkWrite only once even with multiple descendants', async () => {
      const folder = createMockResource({
        type: ResourceType.Folder,
        path: '/folder',
      });

      const descendants = [
        createMockResource({
          _id: new Types.ObjectId(),
          path: '/folder/child1',
        }),
        createMockResource({
          _id: new Types.ObjectId(),
          path: '/folder/child2',
        }),
        createMockResource({
          _id: new Types.ObjectId(),
          path: '/folder/child3',
        }),
      ];

      vi.mocked(ResourceModel.findOne).mockResolvedValue(folder as any);
      vi.mocked(assertNotRootFolder).mockImplementation(() => {});
      vi.mocked(findDescendantsByPath).mockResolvedValue(descendants as any);
      vi.mocked(ResourceModel.deleteMany).mockResolvedValue({
        deletedCount: 0,
      } as any);
      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      await moveToTrashResource(mockResourceId, mockUserId);

      expect(ResourceModel.bulkWrite).toHaveBeenCalledTimes(1);
    });

    it('should structure bulkWrite operations correctly', async () => {
      const file = createMockResource({
        _id: mockResourceId,
        type: ResourceType.File,
      });

      vi.mocked(ResourceModel.findOne).mockResolvedValue(file as any);
      vi.mocked(assertNotRootFolder).mockImplementation(() => {});
      vi.mocked(ResourceModel.deleteMany).mockResolvedValue({
        deletedCount: 0,
      } as any);
      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      await moveToTrashResource(mockResourceId, mockUserId);

      expect(ResourceModel.bulkWrite).toHaveBeenCalledWith([
        {
          updateOne: {
            filter: { _id: mockResourceId },
            update: {
              $set: {
                deleted: true,
                deletedAt: expect.any(Date),
              },
            },
          },
        },
      ]);
    });
  });

  describe('Edge cases', () => {
    it('should handle resource with special characters in path', async () => {
      const file = createMockResource({
        name: 'file (with) [special] chars.pdf',
        path: '/folder/file (with) [special] chars.pdf',
        type: ResourceType.File,
      });

      vi.mocked(ResourceModel.findOne).mockResolvedValue(file as any);
      vi.mocked(assertNotRootFolder).mockImplementation(() => {});
      vi.mocked(ResourceModel.deleteMany).mockResolvedValue({
        deletedCount: 0,
      } as any);
      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      await moveToTrashResource(mockResourceId, mockUserId);

      expect(ResourceModel.deleteMany).toHaveBeenCalledWith({
        path: '/folder/file (with) [special] chars.pdf',
        userId: mockUserId,
        deleted: true,
      });
    });

    it('should handle resource with very long path', async () => {
      const longPath =
        '/a/b/c/d/e/f/g/h/i/j/k/l/m/n/o/p/q/r/s/t/u/v/w/x/y/z/file.pdf';
      const file = createMockResource({
        path: longPath,
        type: ResourceType.File,
      });

      vi.mocked(ResourceModel.findOne).mockResolvedValue(file as any);
      vi.mocked(assertNotRootFolder).mockImplementation(() => {});
      vi.mocked(ResourceModel.deleteMany).mockResolvedValue({
        deletedCount: 0,
      } as any);
      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      await moveToTrashResource(mockResourceId, mockUserId);

      expect(ResourceModel.deleteMany).toHaveBeenCalledWith({
        path: longPath,
        userId: mockUserId,
        deleted: true,
      });
    });

    it('should handle folder at root level', async () => {
      const folder = createMockResource({
        path: '/root-folder',
        type: ResourceType.Folder,
      });

      vi.mocked(ResourceModel.findOne).mockResolvedValue(folder as any);
      vi.mocked(assertNotRootFolder).mockImplementation(() => {});
      vi.mocked(findDescendantsByPath).mockResolvedValue([]);
      vi.mocked(ResourceModel.deleteMany).mockResolvedValue({
        deletedCount: 0,
      } as any);
      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      await moveToTrashResource(mockResourceId, mockUserId);

      expect(findDescendantsByPath).toHaveBeenCalledWith(
        '/root-folder',
        mockUserId
      );
    });

    it('should handle multiple deleteMany calls for folder with descendants', async () => {
      const folder = createMockResource({
        type: ResourceType.Folder,
        path: '/folder',
      });

      const child = createMockResource({
        _id: new Types.ObjectId(),
        path: '/folder/child',
      });

      vi.mocked(ResourceModel.findOne).mockResolvedValue(folder as any);
      vi.mocked(assertNotRootFolder).mockImplementation(() => {});
      vi.mocked(findDescendantsByPath).mockResolvedValue([child] as any);
      vi.mocked(ResourceModel.deleteMany).mockResolvedValue({
        deletedCount: 0,
      } as any);
      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      await moveToTrashResource(mockResourceId, mockUserId);

      // Should call deleteMany for parent + each child
      expect(ResourceModel.deleteMany).toHaveBeenCalledTimes(2);
    });

    it('should handle getAllDescendants returning different resource quran-division', async () => {
      const folder = createMockResource({
        type: ResourceType.Folder,
        path: '/mixed',
      });

      const descendants = [
        createMockResource({
          _id: new Types.ObjectId(),
          path: '/mixed/subfolder',
          type: ResourceType.Folder,
        }),
        createMockResource({
          _id: new Types.ObjectId(),
          path: '/mixed/file.pdf',
          type: ResourceType.File,
        }),
      ];

      vi.mocked(ResourceModel.findOne).mockResolvedValue(folder as any);
      vi.mocked(assertNotRootFolder).mockImplementation(() => {});
      vi.mocked(findDescendantsByPath).mockResolvedValue(descendants as any);
      vi.mocked(ResourceModel.deleteMany).mockResolvedValue({
        deletedCount: 0,
      } as any);
      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      await moveToTrashResource(mockResourceId, mockUserId);

      const bulkWriteCall = vi.mocked(ResourceModel.bulkWrite).mock.calls[0][0];
      expect(bulkWriteCall).toHaveLength(3); // 2 descendants + 1 parent
    });

    it('should maintain consistent deletedAt timestamp across all updates', async () => {
      const folder = createMockResource({
        type: ResourceType.Folder,
        path: '/folder',
      });

      const descendants = Array.from({ length: 5 }, (_, i) =>
        createMockResource({
          _id: new Types.ObjectId(),
          path: `/folder/child${i}`,
        })
      );

      vi.mocked(ResourceModel.findOne).mockResolvedValue(folder as any);
      vi.mocked(assertNotRootFolder).mockImplementation(() => {});
      vi.mocked(findDescendantsByPath).mockResolvedValue(descendants as any);
      vi.mocked(ResourceModel.deleteMany).mockResolvedValue({
        deletedCount: 0,
      } as any);
      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      await moveToTrashResource(mockResourceId, mockUserId);

      const bulkWriteCall = vi.mocked(ResourceModel.bulkWrite).mock.calls[0][0];
      const timestamps = bulkWriteCall.map(
        (op: any) => op.updateOne.update.$set.deletedAt
      );

      // All timestamps should be the same
      const firstTimestamp = timestamps[0].getTime();
      timestamps.forEach((timestamp: Date) => {
        expect(timestamp.getTime()).toBe(firstTimestamp);
      });
    });
  });

  describe('Error handling', () => {
    it('should propagate errors from ResourceModel.findOne', async () => {
      const dbError = new Error('Database connection failed');
      vi.mocked(ResourceModel.findOne).mockRejectedValue(dbError);

      expect(moveToTrashResource(mockResourceId, mockUserId)).rejects.toThrow(
        'Database connection failed'
      );
    });

    it('should propagate errors from getAllDescendants', async () => {
      const folder = createMockResource({
        type: ResourceType.Folder,
      });

      vi.mocked(ResourceModel.findOne).mockResolvedValue(folder as any);
      vi.mocked(assertNotRootFolder).mockImplementation(() => {});
      vi.mocked(findDescendantsByPath).mockRejectedValue(
        new Error('Failed to get descendants')
      );

      expect(moveToTrashResource(mockResourceId, mockUserId)).rejects.toThrow(
        'Failed to get descendants'
      );
    });

    it('should propagate errors from bulkWrite', async () => {
      const file = createMockResource({
        type: ResourceType.File,
      });

      vi.mocked(ResourceModel.findOne).mockResolvedValue(file as any);
      vi.mocked(assertNotRootFolder).mockImplementation(() => {});
      vi.mocked(ResourceModel.deleteMany).mockResolvedValue({
        deletedCount: 0,
      } as any);
      vi.mocked(ResourceModel.bulkWrite).mockRejectedValue(
        new Error('Bulk write failed')
      );

      expect(moveToTrashResource(mockResourceId, mockUserId)).rejects.toThrow(
        'Bulk write failed'
      );
    });
  });
});
