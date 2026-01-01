/**
 * @fileoverview Copy Resource Service Test Suite
 *
 * Tests for copy-resource service:
 * - copyResource: Copies a resource to a destination path
 * - Handles file and folder copying
 * - Validates destination paths and prevents circular copies
 * - Generates unique copy names
 * - Manages descendants when copying folders
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Types } from 'mongoose';
import { copyResource } from '../copy-resource.service';
import ResourceModel from '../../../models/resource.model';
import ResourceType from '../../../constants/types/resourceType';
import { PrimaryId } from '../../../constants/primaryId';
import AppError from '../../../utils/AppError';
import { NOT_FOUND, BAD_REQUEST } from '../../../constants/http';

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

vi.mock('../helpers/copyHelpers', () => ({
  generateCopyName: vi.fn(),
  buildClonedRootResource: vi.fn(),
  buildClonedDescendants: vi.fn(),
}));

import {
  assertNotRootFolder,
  getAllDescendants,
} from '../common-resource.service';
import {
  generateCopyName,
  buildClonedRootResource,
  buildClonedDescendants,
} from '../helpers/copyHelpers';

describe('Copy Resource Service', () => {
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

  describe('copyResource - Basic validation', () => {
    it('should throw NOT_FOUND error when resource does not exist', async () => {
      vi.mocked(ResourceModel.findOne).mockResolvedValue(null);

      expect(
        copyResource(mockResourceId, 'my-files/target', mockUserId)
      ).rejects.toThrow(AppError);

      expect(
        copyResource(mockResourceId, 'my-files/target', mockUserId)
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
        copyResource(mockResourceId, 'my-files/target', differentUserId)
      ).rejects.toThrow();
    });

    it('should throw BAD_REQUEST when trying to copy root folder', async () => {
      const rootFolder = createMockResource({
        name: 'my-files',
        type: ResourceType.Folder,
        path: 'my-files',
        parent: null,
      });

      vi.mocked(ResourceModel.findOne).mockResolvedValue(rootFolder as any);
      vi.mocked(assertNotRootFolder).mockImplementation(() => {
        throw new AppError(BAD_REQUEST, 'Cannot copy root folder');
      });

      await expect(
        copyResource(mockResourceId, 'my-files/target', mockUserId)
      ).rejects.toThrow('Cannot copy root folder');

      await expect(assertNotRootFolder).toHaveBeenCalled();
    });

    it('should throw NOT_FOUND when destination folder does not exist', async () => {
      const file = createMockResource();

      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce(file as any) // First call: get resource
        .mockResolvedValueOnce(null); // Second call: destination not found

      await expect(
        copyResource(mockResourceId, 'my-files/nonexistent', mockUserId)
      ).rejects.toMatchObject({
        statusCode: NOT_FOUND,
        message: 'Destination folder not found',
      });
    });

    it('should throw NOT_FOUND when destination is deleted', async () => {
      const file = createMockResource();
      const deletedDestination = createMockFolder('my-files/target', {
        deleted: true,
      });

      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce(file as any)
        .mockResolvedValueOnce(null); // Won't find because of deleted: false filter

      await expect(
        copyResource(mockResourceId, 'my-files/target', mockUserId)
      ).rejects.toMatchObject({
        statusCode: NOT_FOUND,
        message: 'Destination folder not found',
      });
    });

    it('should decode URL-encoded destination path', async () => {
      const file = createMockResource();
      const destination = createMockFolder('my-files/folder with spaces');

      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce(file as any)
        .mockResolvedValueOnce(destination as any);

      vi.mocked(generateCopyName).mockResolvedValue('Test Resource');
      vi.mocked(buildClonedRootResource).mockReturnValue({
        newId: new Types.ObjectId() as PrimaryId,
        op: { insertOne: { document: {} } },
      });
      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      await copyResource(
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

  describe('copyResource - Circular copy prevention', () => {
    it('should throw BAD_REQUEST when copying folder into itself', async () => {
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
        copyResource(mockResourceId, 'my-files/documents', mockUserId)
      ).rejects.toMatchObject({
        statusCode: BAD_REQUEST,
        message: 'Cannot copy a folder into itself or its subfolders.',
      });
    });

    it('should throw BAD_REQUEST when copying folder into its subfolder', async () => {
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
        copyResource(mockResourceId, 'my-files/documents/subfolder', mockUserId)
      ).rejects.toMatchObject({
        statusCode: BAD_REQUEST,
        message: 'Cannot copy a folder into itself or its subfolders.',
      });
    });

    it('should throw BAD_REQUEST when copying folder into deeply nested subfolder', async () => {
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
        copyResource(mockResourceId, 'my-files/documents/a/b/c/d', mockUserId)
      ).rejects.toMatchObject({
        statusCode: BAD_REQUEST,
        message: 'Cannot copy a folder into itself or its subfolders.',
      });
    });

    it('should allow copying folder to similarly named path that is not a subfolder', async () => {
      const folder = createMockResource({
        name: 'documents',
        type: ResourceType.Folder,
        path: 'my-files/documents',
      });

      const similarDestination = createMockFolder('my-files/documents-backup');

      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce(folder as any)
        .mockResolvedValueOnce(similarDestination as any);

      vi.mocked(generateCopyName).mockResolvedValue('documents');
      vi.mocked(buildClonedRootResource).mockReturnValue({
        newId: new Types.ObjectId() as PrimaryId,
        op: { insertOne: { document: {} } },
      });
      vi.mocked(getAllDescendants).mockResolvedValue([]);
      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      await expect(
        copyResource(mockResourceId, 'my-files/documents-backup', mockUserId)
      ).resolves.toEqual({ message: 'Copied successfully' });
    });

    it('should handle trailing slashes in paths correctly', async () => {
      const folder = createMockResource({
        name: 'documents',
        type: ResourceType.Folder,
        path: 'my-files/documents/',
      });

      const destination = createMockFolder('my-files/target/');

      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce(folder as any)
        .mockResolvedValueOnce(destination as any);

      vi.mocked(generateCopyName).mockResolvedValue('documents');
      vi.mocked(buildClonedRootResource).mockReturnValue({
        newId: new Types.ObjectId() as PrimaryId,
        op: { insertOne: { document: {} } },
      });
      vi.mocked(getAllDescendants).mockResolvedValue([]);
      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      await expect(
        copyResource(mockResourceId, 'my-files/target/', mockUserId)
      ).resolves.toEqual({ message: 'Copied successfully' });
    });

    it('should allow copying file into any folder', async () => {
      const file = createMockResource({
        type: ResourceType.File,
        path: 'my-files/documents/file.pdf',
      });

      const destination = createMockFolder('my-files/documents/subfolder');

      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce(file as any)
        .mockResolvedValueOnce(destination as any);

      vi.mocked(generateCopyName).mockResolvedValue('file.pdf');
      vi.mocked(buildClonedRootResource).mockReturnValue({
        newId: new Types.ObjectId() as PrimaryId,
        op: { insertOne: { document: {} } },
      });
      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      await expect(
        copyResource(mockResourceId, 'my-files/documents/subfolder', mockUserId)
      ).resolves.toEqual({ message: 'Copied successfully' });
    });
  });

  describe('copyResource - File copying', () => {
    it('should successfully copy a file', async () => {
      const file = createMockResource({
        name: 'document.pdf',
        type: ResourceType.File,
        path: 'my-files/documents/document.pdf',
      });

      const destination = createMockFolder('my-files/target', {
        _id: mockDestinationId,
      });

      const mockNewId = new Types.ObjectId() as PrimaryId;
      const mockInsertOp = {
        insertOne: { document: { name: 'document.pdf' } },
      };

      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce(file as any)
        .mockResolvedValueOnce(destination as any);

      vi.mocked(generateCopyName).mockResolvedValue('document.pdf');
      vi.mocked(buildClonedRootResource).mockReturnValue({
        newId: mockNewId,
        op: mockInsertOp,
      });
      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      const result = await copyResource(
        mockResourceId,
        'my-files/target',
        mockUserId
      );

      expect(result).toEqual({ message: 'Copied successfully' });
      expect(generateCopyName).toHaveBeenCalledWith(
        'document.pdf',
        'my-files/target',
        mockUserId
      );
      expect(buildClonedRootResource).toHaveBeenCalledWith(
        file,
        'document.pdf',
        'my-files/target/document.pdf',
        mockDestinationId,
        mockUserId
      );
      expect(ResourceModel.bulkWrite).toHaveBeenCalledWith([mockInsertOp]);
    });

    it('should handle file with copy name when conflict exists', async () => {
      const file = createMockResource({
        name: 'report.pdf',
        type: ResourceType.File,
        path: 'my-files/documents/report.pdf',
      });

      const destination = createMockFolder('my-files/target', {
        _id: mockDestinationId,
      });

      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce(file as any)
        .mockResolvedValueOnce(destination as any);

      vi.mocked(generateCopyName).mockResolvedValue('report.pdf (Copy)');
      vi.mocked(buildClonedRootResource).mockReturnValue({
        newId: new Types.ObjectId() as PrimaryId,
        op: { insertOne: { document: {} } },
      });
      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      await copyResource(mockResourceId, 'my-files/target', mockUserId);

      expect(buildClonedRootResource).toHaveBeenCalledWith(
        file,
        'report.pdf (Copy)',
        'my-files/target/report.pdf (Copy)',
        mockDestinationId,
        mockUserId
      );
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
        .mockResolvedValueOnce(destination as any);

      vi.mocked(generateCopyName).mockResolvedValue('file.txt');
      vi.mocked(buildClonedRootResource).mockReturnValue({
        newId: new Types.ObjectId() as PrimaryId,
        op: { insertOne: { document: {} } },
      });
      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      await copyResource(
        mockResourceId,
        'my-files//target///folder',
        mockUserId
      );

      expect(buildClonedRootResource).toHaveBeenCalledWith(
        expect.anything(),
        'file.txt',
        'my-files/target/folder/file.txt',
        mockDestinationId,
        mockUserId
      );
    });
  });

  describe('copyResource - Folder copying', () => {
    it('should successfully copy an empty folder', async () => {
      const folder = createMockResource({
        name: 'empty-folder',
        type: ResourceType.Folder,
        path: 'my-files/documents/empty-folder',
      });

      const destination = createMockFolder('my-files/target', {
        _id: mockDestinationId,
      });

      const mockNewId = new Types.ObjectId() as PrimaryId;
      const mockInsertOp = { insertOne: { document: {} } };

      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce(folder as any)
        .mockResolvedValueOnce(destination as any);

      vi.mocked(generateCopyName).mockResolvedValue('empty-folder');
      vi.mocked(buildClonedRootResource).mockReturnValue({
        newId: mockNewId,
        op: mockInsertOp,
      });
      vi.mocked(getAllDescendants).mockResolvedValue([]);
      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      const result = await copyResource(
        mockResourceId,
        'my-files/target',
        mockUserId
      );

      expect(result).toEqual({ message: 'Copied successfully' });
      expect(getAllDescendants).toHaveBeenCalledWith(
        'my-files/documents/empty-folder',
        mockUserId,
        false
      );
      expect(buildClonedDescendants).not.toHaveBeenCalled();
      expect(ResourceModel.bulkWrite).toHaveBeenCalledWith([mockInsertOp]);
    });

    it('should successfully copy folder with descendants', async () => {
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

      const mockNewId = new Types.ObjectId() as PrimaryId;
      const mockRootOp = { insertOne: { document: { name: 'project' } } };
      const mockDescendantOps = [
        { insertOne: { document: { name: 'file1.txt' } } },
        { insertOne: { document: { name: 'subfolder' } } },
        { insertOne: { document: { name: 'file2.txt' } } },
      ];

      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce(folder as any)
        .mockResolvedValueOnce(destination as any);

      vi.mocked(generateCopyName).mockResolvedValue('project');
      vi.mocked(buildClonedRootResource).mockReturnValue({
        newId: mockNewId,
        op: mockRootOp,
      });
      vi.mocked(getAllDescendants).mockResolvedValue(mockDescendants as any);
      vi.mocked(buildClonedDescendants).mockReturnValue(mockDescendantOps);
      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      const result = await copyResource(
        mockResourceId,
        'my-files/backup',
        mockUserId
      );

      expect(result).toEqual({ message: 'Copied successfully' });
      expect(getAllDescendants).toHaveBeenCalledWith(
        'my-files/documents/project',
        mockUserId,
        false
      );
      expect(buildClonedDescendants).toHaveBeenCalledWith(
        mockDescendants,
        'my-files/documents/project',
        'my-files/backup/project',
        mockUserId,
        mockDestinationId,
        mockNewId
      );
      expect(ResourceModel.bulkWrite).toHaveBeenCalledWith([
        mockRootOp,
        ...mockDescendantOps,
      ]);
    });

    it('should copy folder with generated copy name when conflict exists', async () => {
      const folder = createMockResource({
        name: 'reports',
        type: ResourceType.Folder,
        path: 'my-files/documents/reports',
      });

      const destination = createMockFolder('my-files/target', {
        _id: mockDestinationId,
      });

      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce(folder as any)
        .mockResolvedValueOnce(destination as any);

      vi.mocked(generateCopyName).mockResolvedValue('reports (Copy 2)');
      vi.mocked(buildClonedRootResource).mockReturnValue({
        newId: new Types.ObjectId() as PrimaryId,
        op: { insertOne: { document: {} } },
      });
      vi.mocked(getAllDescendants).mockResolvedValue([]);
      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      await copyResource(mockResourceId, 'my-files/target', mockUserId);

      expect(buildClonedRootResource).toHaveBeenCalledWith(
        folder,
        'reports (Copy 2)',
        'my-files/target/reports (Copy 2)',
        mockDestinationId,
        mockUserId
      );
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
        path: `my-files/root/${Array(i).fill('sub').join('/')}/item-${i}`,
      }));

      const mockNewId = new Types.ObjectId() as PrimaryId;
      const mockDescendantOps = mockDescendants.map(() => ({
        insertOne: { document: {} },
      }));

      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce(folder as any)
        .mockResolvedValueOnce(destination as any);

      vi.mocked(generateCopyName).mockResolvedValue('root');
      vi.mocked(buildClonedRootResource).mockReturnValue({
        newId: mockNewId,
        op: { insertOne: { document: {} } },
      });
      vi.mocked(getAllDescendants).mockResolvedValue(mockDescendants as any);
      vi.mocked(buildClonedDescendants).mockReturnValue(mockDescendantOps);
      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      const result = await copyResource(
        mockResourceId,
        'my-files/target',
        mockUserId
      );

      expect(result).toEqual({ message: 'Copied successfully' });
      expect(buildClonedDescendants).toHaveBeenCalledWith(
        mockDescendants,
        'my-files/root',
        'my-files/target/root',
        mockUserId,
        mockDestinationId,
        mockNewId
      );
    });
  });

  describe('copyResource - Edge cases', () => {
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
        .mockResolvedValueOnce(destination as any);

      vi.mocked(generateCopyName).mockResolvedValue('file (copy) [2023].pdf');
      vi.mocked(buildClonedRootResource).mockReturnValue({
        newId: new Types.ObjectId() as PrimaryId,
        op: { insertOne: { document: {} } },
      });
      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      await expect(
        copyResource(mockResourceId, 'my-files/target', mockUserId)
      ).resolves.toEqual({ message: 'Copied successfully' });
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
        .mockResolvedValueOnce(destination as any);

      vi.mocked(generateCopyName).mockResolvedValue(longName);
      vi.mocked(buildClonedRootResource).mockReturnValue({
        newId: new Types.ObjectId() as PrimaryId,
        op: { insertOne: { document: {} } },
      });
      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      await expect(
        copyResource(mockResourceId, 'my-files/target', mockUserId)
      ).resolves.toEqual({ message: 'Copied successfully' });
    });

    it('should copy to root folder (my-files)', async () => {
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
        .mockResolvedValueOnce(myFilesRoot as any);

      vi.mocked(generateCopyName).mockResolvedValue('document.pdf');
      vi.mocked(buildClonedRootResource).mockReturnValue({
        newId: new Types.ObjectId() as PrimaryId,
        op: { insertOne: { document: {} } },
      });
      vi.mocked(ResourceModel.bulkWrite).mockResolvedValue({} as any);

      await expect(
        copyResource(mockResourceId, 'my-files', mockUserId)
      ).resolves.toEqual({ message: 'Copied successfully' });

      expect(buildClonedRootResource).toHaveBeenCalledWith(
        file,
        'document.pdf',
        'my-files/document.pdf',
        mockDestinationId,
        mockUserId
      );
    });
  });
});
