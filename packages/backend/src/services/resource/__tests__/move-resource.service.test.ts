/**
 * @fileoverview Move Resource Service Test Suite
 *
 * Tests for move-resource service:
 * - moveResource: Moves a resource to a destination path
 * - Handles file and folder moving
 * - Validates destination paths and prevents circular moves
 * - Checks for name conflicts
 * - Updates descendants when moving folders
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Types } from 'mongoose';
import { moveResource } from '../move-resource.service';
import ResourceModel from '../../../models/resource.model';
import ResourceType from '../../../constants/enums/resourceType';
import { PrimaryId } from '../../../constants/primaryId';
import AppError from '../../../utils/AppError';
import { NOT_FOUND, BAD_REQUEST, CONFLICT } from '../../../constants/http';

vi.mock('../../../models/resource.model', () => {
  const MockResourceModel: any = {
    findOne: vi.fn(),
    bulkWrite: vi.fn(),
    prototype: {
      _id: new Types.ObjectId(),
    },
  };
  MockResourceModel.mockImplementation = function () {
    return { _id: new Types.ObjectId() };
  };

  return {
    default: MockResourceModel,
  };
});

vi.mock('../common-resource.service', () => ({
  assertNotRootFolder: vi.fn(),
  getAllDescendants: vi.fn(),
}));

import {
  assertNotRootFolder,
  getAllDescendants,
} from '../common-resource.service';

describe('Move Resource Service', () => {
  const mockUserId = new Types.ObjectId() as PrimaryId;
  const mockResourceId = new Types.ObjectId() as PrimaryId;
  const mockParentId = new Types.ObjectId() as PrimaryId;
  const mockDestinationId = new Types.ObjectId() as PrimaryId;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  const createMockResource = (overrides: any = {}) => ({
    _id: mockResourceId,
    userId: mockUserId,
    name: 'Test Resource',
    type: ResourceType.File,
    path: 'my-files/documents/test-file.pdf',
    parent: mockParentId,
    deleted: false,
    ...overrides,
  });

  const createMockFolder = (path: string, overrides: any = {}) => ({
    _id: new Types.ObjectId(),
    userId: mockUserId,
    name: path.split('/').pop(),
    type: ResourceType.Folder,
    path,
    parent: new Types.ObjectId(),
    deleted: false,
    ...overrides,
  });

  describe('moveResource - Basic validation', () => {
    it('should throw NOT_FOUND error when resource does not exist', async () => {
      vi.mocked(ResourceModel.findOne).mockResolvedValue(null);

      expect(
        moveResource(mockResourceId, 'my-files/target', mockUserId)
      ).rejects.toThrow(AppError);

      expect(
        moveResource(mockResourceId, 'my-files/target', mockUserId)
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

      expect(
        moveResource(mockResourceId, 'my-files/target', differentUserId)
      ).rejects.toThrow();
    });

    it('should throw BAD_REQUEST when trying to move root folder', async () => {
      const rootFolder = createMockResource({
        name: 'my-files',
        type: ResourceType.Folder,
        path: 'my-files',
        parent: null,
      });

      vi.mocked(ResourceModel.findOne).mockResolvedValue(rootFolder as any);
      vi.mocked(assertNotRootFolder).mockImplementation(() => {
        throw new AppError(BAD_REQUEST, 'Cannot move root folder');
      });

      await expect(
        moveResource(mockResourceId, 'my-files/target', mockUserId)
      ).rejects.toThrow('Cannot move root folder');

      await expect(assertNotRootFolder).toHaveBeenCalled();
    });

    it('should throw NOT_FOUND when destination folder does not exist', async () => {
      const file = createMockResource();

      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce(file as any) // First call: get resource
        .mockResolvedValueOnce(null); // Second call: destination not found

      await expect(
        moveResource(mockResourceId, 'my-files/nonexistent', mockUserId)
      ).rejects.toMatchObject({
        statusCode: NOT_FOUND,
        message: 'Destination folder not found',
      });
    });

    it('should throw NOT_FOUND when destination is deleted', async () => {
      const file = createMockResource();

      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce(file as any)
        .mockResolvedValueOnce(null); // Won't find because of deleted: false filter

      await expect(
        moveResource(mockResourceId, 'my-files/target', mockUserId)
      ).rejects.toMatchObject({
        statusCode: NOT_FOUND,
        message: 'Destination folder not found',
      });
    });

    it('should decode URL-encoded destination path', async () => {
      const file = createMockResource();
      const destination = createMockFolder('my-files/folder with spaces', {
        _id: mockDestinationId,
      });

      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce(file as any)
        .mockResolvedValueOnce(destination as any)
        .mockResolvedValueOnce(null); // No conflict

      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      await moveResource(
        mockResourceId,
        'my-files%2Ffolder%20with%20spaces',
        mockUserId
      );

      expect(ResourceModel.findOne).toHaveBeenCalledWith({
        path: 'my-files/folder with spaces',
        type: ResourceType.Folder,
        userId: mockUserId,
        deleted: false,
      });
    });
  });

  describe('moveResource - Circular move prevention', () => {
    it('should throw BAD_REQUEST when moving folder into itself', async () => {
      const folder = createMockResource({
        name: 'documents',
        type: ResourceType.Folder,
        path: 'my-files/documents',
      });

      const destination = createMockFolder('my-files/documents', {
        _id: folder._id,
      });

      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce(folder as any)
        .mockResolvedValueOnce(destination as any);

      await expect(
        moveResource(mockResourceId, 'my-files/documents', mockUserId)
      ).rejects.toMatchObject({
        statusCode: BAD_REQUEST,
        message: 'Cannot copy a folder into itself or its subfolders.',
      });
    });

    it('should throw BAD_REQUEST when moving folder into its subfolder', async () => {
      const folder = createMockResource({
        name: 'documents',
        type: ResourceType.Folder,
        path: 'my-files/documents',
      });

      const subfolderDestination = createMockFolder(
        'my-files/documents/subfolder'
      );

      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce(folder as any)
        .mockResolvedValueOnce(subfolderDestination as any);

      await expect(
        moveResource(mockResourceId, 'my-files/documents/subfolder', mockUserId)
      ).rejects.toMatchObject({
        statusCode: BAD_REQUEST,
        message: 'Cannot copy a folder into itself or its subfolders.',
      });
    });

    it('should throw BAD_REQUEST when moving folder into deeply nested subfolder', async () => {
      const folder = createMockResource({
        name: 'documents',
        type: ResourceType.Folder,
        path: 'my-files/documents',
      });

      const deepSubfolder = createMockFolder('my-files/documents/a/b/c/d');

      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce(folder as any)
        .mockResolvedValueOnce(deepSubfolder as any);

      await expect(
        moveResource(mockResourceId, 'my-files/documents/a/b/c/d', mockUserId)
      ).rejects.toMatchObject({
        statusCode: BAD_REQUEST,
        message: 'Cannot copy a folder into itself or its subfolders.',
      });
    });

    it('should allow moving folder to similarly named path that is not a subfolder', async () => {
      const folder = createMockResource({
        name: 'documents',
        type: ResourceType.Folder,
        path: 'my-files/documents',
      });

      const similarDestination = createMockFolder('my-files/documents-backup', {
        _id: mockDestinationId,
      });

      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce(folder as any)
        .mockResolvedValueOnce(similarDestination as any)
        .mockResolvedValueOnce(null); // No conflict

      vi.mocked(getAllDescendants).mockResolvedValue([]);
      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      await expect(
        moveResource(mockResourceId, 'my-files/documents-backup', mockUserId)
      ).resolves.toEqual({ message: 'Moved successfully' });
    });

    it('should handle trailing slashes in paths correctly', async () => {
      const folder = createMockResource({
        name: 'documents',
        type: ResourceType.Folder,
        path: 'my-files/documents/',
      });

      const destination = createMockFolder('my-files/target/', {
        _id: mockDestinationId,
      });

      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce(folder as any)
        .mockResolvedValueOnce(destination as any)
        .mockResolvedValueOnce(null); // No conflict

      vi.mocked(getAllDescendants).mockResolvedValue([]);
      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      await expect(
        moveResource(mockResourceId, 'my-files/target/', mockUserId)
      ).resolves.toEqual({ message: 'Moved successfully' });
    });

    it('should allow moving file into any folder', async () => {
      const file = createMockResource({
        type: ResourceType.File,
        path: 'my-files/documents/file.pdf',
      });

      const destination = createMockFolder('my-files/documents/subfolder', {
        _id: mockDestinationId,
      });

      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce(file as any)
        .mockResolvedValueOnce(destination as any)
        .mockResolvedValueOnce(null); // No conflict

      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      await expect(
        moveResource(mockResourceId, 'my-files/documents/subfolder', mockUserId)
      ).resolves.toEqual({ message: 'Moved successfully' });
    });
  });

  describe('moveResource - Name conflict detection', () => {
    it('should throw CONFLICT when file with same name exists in destination', async () => {
      const file = createMockResource({
        name: 'document.pdf',
        type: ResourceType.File,
        path: 'my-files/source/document.pdf',
      });

      const destination = createMockFolder('my-files/target', {
        _id: mockDestinationId,
      });

      const conflictingFile = createMockResource({
        _id: new Types.ObjectId() as PrimaryId,
        name: 'document.pdf',
        path: 'my-files/target/document.pdf',
      });

      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce(file as any)
        .mockResolvedValueOnce(destination as any)
        .mockResolvedValueOnce(conflictingFile as any); // Conflict check

      await expect(
        moveResource(mockResourceId, 'my-files/target', mockUserId)
      ).rejects.toMatchObject({
        statusCode: CONFLICT,
        message:
          'A resource with the same name already exists in target folder',
      });

      expect(ResourceModel.findOne).toHaveBeenCalledWith({
        path: 'my-files/target/document.pdf',
        userId: mockUserId,
      });
    });

    it('should throw CONFLICT when folder with same name exists in destination', async () => {
      const folder = createMockResource({
        name: 'reports',
        type: ResourceType.Folder,
        path: 'my-files/source/reports',
      });

      const destination = createMockFolder('my-files/target', {
        _id: mockDestinationId,
      });

      const conflictingFolder = createMockFolder('my-files/target/reports');

      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce(folder as any)
        .mockResolvedValueOnce(destination as any)
        .mockResolvedValueOnce(conflictingFolder as any); // Conflict check

      await expect(
        moveResource(mockResourceId, 'my-files/target', mockUserId)
      ).rejects.toMatchObject({
        statusCode: CONFLICT,
        message:
          'A resource with the same name already exists in target folder',
      });
    });

    it('should allow moving when no conflict exists', async () => {
      const file = createMockResource({
        name: 'document.pdf',
        type: ResourceType.File,
        path: 'my-files/source/document.pdf',
      });

      const destination = createMockFolder('my-files/target', {
        _id: mockDestinationId,
      });

      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce(file as any)
        .mockResolvedValueOnce(destination as any)
        .mockResolvedValueOnce(null); // No conflict

      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      await expect(
        moveResource(mockResourceId, 'my-files/target', mockUserId)
      ).resolves.toEqual({ message: 'Moved successfully' });
    });
  });

  describe('moveResource - File moving', () => {
    it('should successfully move a file', async () => {
      const file = createMockResource({
        name: 'document.pdf',
        type: ResourceType.File,
        path: 'my-files/documents/document.pdf',
      });

      const destination = createMockFolder('my-files/target', {
        _id: mockDestinationId,
      });

      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce(file as any)
        .mockResolvedValueOnce(destination as any)
        .mockResolvedValueOnce(null); // No conflict

      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      const result = await moveResource(
        mockResourceId,
        'my-files/target',
        mockUserId
      );

      expect(result).toEqual({ message: 'Moved successfully' });
      expect(ResourceModel.bulkWrite).toHaveBeenCalledWith([
        {
          updateOne: {
            filter: { _id: file._id },
            update: {
              $set: {
                parent: mockDestinationId,
                path: 'my-files/target/document.pdf',
              },
            },
          },
        },
      ]);
    });

    it('should normalize multiple slashes in path', async () => {
      const file = createMockResource({
        name: 'file.txt',
        type: ResourceType.File,
        path: 'my-files/documents/file.txt',
      });

      const destination = createMockFolder('my-files//target///folder', {
        _id: mockDestinationId,
      });

      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce(file as any)
        .mockResolvedValueOnce(destination as any)
        .mockResolvedValueOnce(null); // No conflict

      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      await moveResource(
        mockResourceId,
        'my-files//target///folder',
        mockUserId
      );

      expect(ResourceModel.bulkWrite).toHaveBeenCalledWith([
        {
          updateOne: {
            filter: { _id: file._id },
            update: {
              $set: {
                parent: mockDestinationId,
                path: 'my-files/target/folder/file.txt',
              },
            },
          },
        },
      ]);
    });

    it('should update file parent reference', async () => {
      const file = createMockResource({
        name: 'report.pdf',
        type: ResourceType.File,
        path: 'my-files/old/report.pdf',
        parent: mockParentId,
      });

      const newParentId = new Types.ObjectId() as PrimaryId;
      const destination = createMockFolder('my-files/new', {
        _id: newParentId,
      });

      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce(file as any)
        .mockResolvedValueOnce(destination as any)
        .mockResolvedValueOnce(null); // No conflict

      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      await moveResource(mockResourceId, 'my-files/new', mockUserId);

      expect(ResourceModel.bulkWrite).toHaveBeenCalledWith([
        {
          updateOne: {
            filter: { _id: file._id },
            update: {
              $set: {
                parent: newParentId,
                path: 'my-files/new/report.pdf',
              },
            },
          },
        },
      ]);
    });
  });

  describe('moveResource - Folder moving', () => {
    it('should successfully move an empty folder', async () => {
      const folder = createMockResource({
        name: 'empty-folder',
        type: ResourceType.Folder,
        path: 'my-files/documents/empty-folder',
      });

      const destination = createMockFolder('my-files/target', {
        _id: mockDestinationId,
      });

      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce(folder as any)
        .mockResolvedValueOnce(destination as any)
        .mockResolvedValueOnce(null); // No conflict

      vi.mocked(getAllDescendants).mockResolvedValue([]);
      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      const result = await moveResource(
        mockResourceId,
        'my-files/target',
        mockUserId
      );

      expect(result).toEqual({ message: 'Moved successfully' });
      expect(getAllDescendants).toHaveBeenCalledWith(
        'my-files/documents/empty-folder',
        mockUserId,
        false
      );
      expect(ResourceModel.bulkWrite).toHaveBeenCalledWith([
        {
          updateOne: {
            filter: { _id: folder._id },
            update: {
              $set: {
                parent: mockDestinationId,
                path: 'my-files/target/empty-folder',
              },
            },
          },
        },
      ]);
    });

    it('should successfully move folder with descendants', async () => {
      const folder = createMockResource({
        name: 'project',
        type: ResourceType.Folder,
        path: 'my-files/documents/project',
      });

      const destination = createMockFolder('my-files/backup', {
        _id: mockDestinationId,
      });

      const mockDescendants = [
        {
          _id: new Types.ObjectId(),
          name: 'file1.txt',
          type: ResourceType.File,
          path: 'my-files/documents/project/file1.txt',
        },
        {
          _id: new Types.ObjectId(),
          name: 'subfolder',
          type: ResourceType.Folder,
          path: 'my-files/documents/project/subfolder',
        },
        {
          _id: new Types.ObjectId(),
          name: 'file2.txt',
          type: ResourceType.File,
          path: 'my-files/documents/project/subfolder/file2.txt',
        },
      ];

      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce(folder as any)
        .mockResolvedValueOnce(destination as any)
        .mockResolvedValueOnce(null); // No conflict

      vi.mocked(getAllDescendants).mockResolvedValue(mockDescendants as any);
      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      const result = await moveResource(
        mockResourceId,
        'my-files/backup',
        mockUserId
      );

      expect(result).toEqual({ message: 'Moved successfully' });
      expect(getAllDescendants).toHaveBeenCalledWith(
        'my-files/documents/project',
        mockUserId,
        false
      );
      expect(ResourceModel.bulkWrite).toHaveBeenCalledWith([
        {
          updateOne: {
            filter: { _id: mockDescendants[0]._id },
            update: {
              $set: {
                path: 'my-files/backup/project/file1.txt',
              },
            },
          },
        },
        {
          updateOne: {
            filter: { _id: mockDescendants[1]._id },
            update: {
              $set: {
                path: 'my-files/backup/project/subfolder',
              },
            },
          },
        },
        {
          updateOne: {
            filter: { _id: mockDescendants[2]._id },
            update: {
              $set: {
                path: 'my-files/backup/project/subfolder/file2.txt',
              },
            },
          },
        },
        {
          updateOne: {
            filter: { _id: folder._id },
            update: {
              $set: {
                parent: mockDestinationId,
                path: 'my-files/backup/project',
              },
            },
          },
        },
      ]);
    });

    it('should update all descendant paths when moving folder', async () => {
      const folder = createMockResource({
        name: 'reports',
        type: ResourceType.Folder,
        path: 'my-files/old/reports',
      });

      const destination = createMockFolder('my-files/new', {
        _id: mockDestinationId,
      });

      const descendant1Id = new Types.ObjectId();
      const descendant2Id = new Types.ObjectId();

      const mockDescendants = [
        {
          _id: descendant1Id,
          path: 'my-files/old/reports/2023.pdf',
        },
        {
          _id: descendant2Id,
          path: 'my-files/old/reports/archive/2022.pdf',
        },
      ];

      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce(folder as any)
        .mockResolvedValueOnce(destination as any)
        .mockResolvedValueOnce(null); // No conflict

      vi.mocked(getAllDescendants).mockResolvedValue(mockDescendants as any);
      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      await moveResource(mockResourceId, 'my-files/new', mockUserId);

      expect(ResourceModel.bulkWrite).toHaveBeenCalledWith([
        {
          updateOne: {
            filter: { _id: descendant1Id },
            update: {
              $set: {
                path: 'my-files/new/reports/2023.pdf',
              },
            },
          },
        },
        {
          updateOne: {
            filter: { _id: descendant2Id },
            update: {
              $set: {
                path: 'my-files/new/reports/archive/2022.pdf',
              },
            },
          },
        },
        {
          updateOne: {
            filter: { _id: folder._id },
            update: {
              $set: {
                parent: mockDestinationId,
                path: 'my-files/new/reports',
              },
            },
          },
        },
      ]);
    });

    it('should handle deeply nested folder structure', async () => {
      const folder = createMockResource({
        name: 'root',
        type: ResourceType.Folder,
        path: 'my-files/root',
      });

      const destination = createMockFolder('my-files/target', {
        _id: mockDestinationId,
      });

      const mockDescendants = Array.from({ length: 10 }, (_, i) => ({
        _id: new Types.ObjectId(),
        name: `item-${i}`,
        type: i % 2 === 0 ? ResourceType.Folder : ResourceType.File,
        path: `my-files/root/${Array(i + 1)
          .fill('sub')
          .join('/')}/item-${i}`,
      }));

      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce(folder as any)
        .mockResolvedValueOnce(destination as any)
        .mockResolvedValueOnce(null); // No conflict

      vi.mocked(getAllDescendants).mockResolvedValue(mockDescendants as any);
      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      const result = await moveResource(
        mockResourceId,
        'my-files/target',
        mockUserId
      );

      expect(result).toEqual({ message: 'Moved successfully' });
      expect(ResourceModel.bulkWrite).toHaveBeenCalledTimes(1);
      const bulkWriteArg = vi.mocked(ResourceModel.bulkWrite).mock.calls[0][0];
      expect(bulkWriteArg).toHaveLength(11); // 10 descendants + 1 root folder
    });
  });

  describe('moveResource - Edge cases', () => {
    it('should handle resource names with special characters', async () => {
      const file = createMockResource({
        name: 'file (copy) [2023].pdf',
        type: ResourceType.File,
        path: 'my-files/documents/file (copy) [2023].pdf',
      });

      const destination = createMockFolder('my-files/target', {
        _id: mockDestinationId,
      });

      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce(file as any)
        .mockResolvedValueOnce(destination as any)
        .mockResolvedValueOnce(null); // No conflict

      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      await expect(
        moveResource(mockResourceId, 'my-files/target', mockUserId)
      ).resolves.toEqual({ message: 'Moved successfully' });
    });

    it('should handle very long resource names', async () => {
      const longName = 'a'.repeat(255);
      const file = createMockResource({
        name: longName,
        type: ResourceType.File,
        path: `my-files/documents/${longName}`,
      });

      const destination = createMockFolder('my-files/target', {
        _id: mockDestinationId,
      });

      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce(file as any)
        .mockResolvedValueOnce(destination as any)
        .mockResolvedValueOnce(null); // No conflict

      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      await expect(
        moveResource(mockResourceId, 'my-files/target', mockUserId)
      ).resolves.toEqual({ message: 'Moved successfully' });
    });

    it('should move to root folder (my-files)', async () => {
      const file = createMockResource({
        name: 'document.pdf',
        type: ResourceType.File,
        path: 'my-files/documents/document.pdf',
      });

      const myFilesRoot = createMockFolder('my-files', {
        _id: mockDestinationId,
      });

      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce(file as any)
        .mockResolvedValueOnce(myFilesRoot as any)
        .mockResolvedValueOnce(null); // No conflict

      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      await expect(
        moveResource(mockResourceId, 'my-files', mockUserId)
      ).resolves.toEqual({ message: 'Moved successfully' });

      expect(ResourceModel.bulkWrite).toHaveBeenCalledWith([
        {
          updateOne: {
            filter: { _id: file._id },
            update: {
              $set: {
                parent: mockDestinationId,
                path: 'my-files/document.pdf',
              },
            },
          },
        },
      ]);
    });

    it('should handle path replacement correctly with similar paths', async () => {
      const folder = createMockResource({
        name: 'docs',
        type: ResourceType.Folder,
        path: 'my-files/docs',
      });

      const destination = createMockFolder('my-files/new-location', {
        _id: mockDestinationId,
      });

      const mockDescendants = [
        {
          _id: new Types.ObjectId(),
          path: 'my-files/docs/file.txt',
        },
        {
          _id: new Types.ObjectId(),
          path: 'my-files/docs-backup/file.txt', // Should not be affected
        },
      ];

      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce(folder as any)
        .mockResolvedValueOnce(destination as any)
        .mockResolvedValueOnce(null); // No conflict

      vi.mocked(getAllDescendants).mockResolvedValue([
        mockDescendants[0],
      ] as any);
      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      await moveResource(mockResourceId, 'my-files/new-location', mockUserId);

      expect(ResourceModel.bulkWrite).toHaveBeenCalledWith([
        {
          updateOne: {
            filter: { _id: mockDescendants[0]._id },
            update: {
              $set: {
                path: 'my-files/new-location/docs/file.txt',
              },
            },
          },
        },
        {
          updateOne: {
            filter: { _id: folder._id },
            update: {
              $set: {
                parent: mockDestinationId,
                path: 'my-files/new-location/docs',
              },
            },
          },
        },
      ]);
    });

    it('should execute bulk operations atomically', async () => {
      const folder = createMockResource({
        name: 'data',
        type: ResourceType.Folder,
        path: 'my-files/old/data',
      });

      const destination = createMockFolder('my-files/new', {
        _id: mockDestinationId,
      });

      const mockDescendants = [
        { _id: new Types.ObjectId(), path: 'my-files/old/data/file1.txt' },
        { _id: new Types.ObjectId(), path: 'my-files/old/data/file2.txt' },
      ];

      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce(folder as any)
        .mockResolvedValueOnce(destination as any)
        .mockResolvedValueOnce(null); // No conflict

      vi.mocked(getAllDescendants).mockResolvedValue(mockDescendants as any);
      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      await moveResource(mockResourceId, 'my-files/new', mockUserId);

      expect(ResourceModel.bulkWrite).toHaveBeenCalledTimes(1);
      const operations = vi.mocked(ResourceModel.bulkWrite).mock.calls[0][0];
      expect(operations).toHaveLength(3); // 2 descendants + 1 folder
    });
  });
});
