/**
 * @fileoverview Copy Helpers Test Suite
 *
 * Tests for resource copy helper functions:
 * - generateCopyName: Generates unique copy names with collision handling
 * - buildClonedDescendants: Clones resource tree descendants with new IDs and paths
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Types } from 'mongoose';
import { generateCopyName, buildClonedDescendants } from '../copyHelpers';
import ResourceModel, {
  ResourceDocument,
} from '../../../../models/resource.model';
import ResourceType from '../../../../constants/types/resourceType';
import { PrimaryId } from '../../../../constants/primaryId';

vi.mock('../../../../models/resource.model', () => {
  const MockResourceModel: any = vi.fn(() => ({
    _id: new Types.ObjectId(),
  }));

  MockResourceModel.findOne = vi.fn();
  MockResourceModel.create = vi.fn();

  return {
    default: MockResourceModel,
  };
});

describe('Copy Helpers', () => {
  const mockUserId = new Types.ObjectId() as PrimaryId;
  const mockParentId = new Types.ObjectId() as PrimaryId;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateCopyName', () => {
    it('should return original name when no conflict exists', async () => {
      vi.mocked(ResourceModel.findOne).mockResolvedValue(null);

      const result = await generateCopyName(
        'MyDocument',
        '/path/to',
        mockUserId
      );

      expect(result).toBe('MyDocument');
      expect(ResourceModel.findOne).toHaveBeenCalledWith({
        path: '/path/to/MyDocument',
        userId: mockUserId,
        deleted: false,
      });
    });

    it('should append (Copy) when single conflict exists', async () => {
      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce({ name: 'MyDocument' } as any) // First call finds conflict
        .mockResolvedValueOnce(null); // Second call no conflict

      const result = await generateCopyName(
        'MyDocument',
        '/path/to',
        mockUserId
      );

      expect(result).toBe('MyDocument (Copy)');
      expect(ResourceModel.findOne).toHaveBeenCalledTimes(2);
    });

    it('should append (Copy 2) when two conflicts exist', async () => {
      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce({ name: 'MyDocument' } as any)
        .mockResolvedValueOnce({ name: 'MyDocument (Copy)' } as any)
        .mockResolvedValueOnce(null);

      const result = await generateCopyName(
        'MyDocument',
        '/path/to',
        mockUserId
      );

      expect(result).toBe('MyDocument (Copy 2)');
      expect(ResourceModel.findOne).toHaveBeenCalledTimes(3);
    });

    it('should handle multiple conflicts and increment counter correctly', async () => {
      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce({ name: 'MyDocument' } as any)
        .mockResolvedValueOnce({ name: 'MyDocument (Copy)' } as any)
        .mockResolvedValueOnce({ name: 'MyDocument (Copy 2)' } as any)
        .mockResolvedValueOnce({ name: 'MyDocument (Copy 3)' } as any)
        .mockResolvedValueOnce(null);

      const result = await generateCopyName(
        'MyDocument',
        '/path/to',
        mockUserId
      );

      expect(result).toBe('MyDocument (Copy 4)');
      expect(ResourceModel.findOne).toHaveBeenCalledTimes(5);
    });

    it('should handle empty base name', async () => {
      vi.mocked(ResourceModel.findOne).mockResolvedValue(null);

      const result = await generateCopyName('', '/path/to', mockUserId);

      expect(result).toBe('');
      expect(ResourceModel.findOne).toHaveBeenCalledWith({
        path: '/path/to/',
        userId: mockUserId,
        deleted: false,
      });
    });

    it('should handle root destination path', async () => {
      vi.mocked(ResourceModel.findOne).mockResolvedValue(null);

      const result = await generateCopyName('MyDocument', '/', mockUserId);

      expect(result).toBe('MyDocument');
      expect(ResourceModel.findOne).toHaveBeenCalledWith({
        path: '/MyDocument',
        userId: mockUserId,
        deleted: false,
      });
    });

    it('should handle destination path without leading slash', async () => {
      vi.mocked(ResourceModel.findOne).mockResolvedValue(null);

      const result = await generateCopyName(
        'MyDocument',
        'path/to',
        mockUserId
      );

      expect(result).toBe('MyDocument');
      expect(ResourceModel.findOne).toHaveBeenCalledWith({
        path: 'path/to/MyDocument',
        userId: mockUserId,
        deleted: false,
      });
    });

    it('should normalize multiple slashes in path', async () => {
      vi.mocked(ResourceModel.findOne).mockResolvedValue(null);

      const result = await generateCopyName(
        'MyDocument',
        '//path///to//',
        mockUserId
      );

      expect(result).toBe('MyDocument');
      expect(ResourceModel.findOne).toHaveBeenCalledWith({
        path: '/path/to/MyDocument',
        userId: mockUserId,
        deleted: false,
      });
    });

    it('should handle special characters in base name', async () => {
      vi.mocked(ResourceModel.findOne).mockResolvedValue(null);

      const result = await generateCopyName(
        'My Document (v1.0)',
        '/path/to',
        mockUserId
      );

      expect(result).toBe('My Document (v1.0)');
    });

    it('should handle base name with existing (Copy) pattern', async () => {
      vi.mocked(ResourceModel.findOne)
        .mockResolvedValueOnce({ name: 'File (Copy)' } as any)
        .mockResolvedValueOnce(null);

      const result = await generateCopyName(
        'File (Copy)',
        '/path/to',
        mockUserId
      );

      expect(result).toBe('File (Copy) (Copy)');
    });

    it('should handle empty destination path', async () => {
      vi.mocked(ResourceModel.findOne).mockResolvedValue(null);

      const result = await generateCopyName('MyDocument', '', mockUserId);

      expect(result).toBe('MyDocument');
      expect(ResourceModel.findOne).toHaveBeenCalledWith({
        path: '/MyDocument',
        userId: mockUserId,
        deleted: false,
      });
    });
  });

  describe('buildClonedDescendants', () => {
    const createMockResource = (
      overrides: Partial<ResourceDocument>
    ): ResourceDocument => {
      return {
        _id: new Types.ObjectId(),
        userId: mockUserId,
        name: 'Test',
        type: ResourceType.Folder,
        path: '/test',
        parent: mockParentId,
        pinned: false,
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        toObject: function () {
          const { toObject, ...rest } = this;
          return rest;
        },
        ...overrides,
      } as any;
    };

    it('should clone a single descendant with correct path and parent mapping', () => {
      const descendantId = new Types.ObjectId() as PrimaryId;
      const descendant = createMockResource({
        _id: descendantId,
        name: 'Child',
        path: '/original/Child',
        parent: mockParentId,
      });

      const rootNewId = new Types.ObjectId() as PrimaryId;
      const destinationParentId = new Types.ObjectId() as PrimaryId;

      const ops = buildClonedDescendants(
        [descendant],
        '/original',
        '/destination',
        mockUserId,
        destinationParentId,
        rootNewId
      );

      expect(ops).toHaveLength(1);
      expect(ops[0]).toHaveProperty('insertOne');
      expect(ops[0].insertOne.document.name).toBe('Child');
      expect(ops[0].insertOne.document.path).toBe('/destination/Child');
      expect(ops[0].insertOne.document.userId).toBe(mockUserId);
      expect(ops[0].insertOne.document.parent).toBe(rootNewId);
    });

    it('should clone multiple descendants maintaining hierarchy', () => {
      const child1Id = new Types.ObjectId() as PrimaryId;
      const child2Id = new Types.ObjectId() as PrimaryId;
      const grandchildId = new Types.ObjectId() as PrimaryId;

      const child1 = createMockResource({
        _id: child1Id,
        name: 'Child1',
        path: '/original/Child1',
        parent: mockParentId,
      });

      const child2 = createMockResource({
        _id: child2Id,
        name: 'Child2',
        path: '/original/Child2',
        parent: mockParentId,
      });

      const grandchild = createMockResource({
        _id: grandchildId,
        name: 'Grandchild',
        path: '/original/Child1/Grandchild',
        parent: child1Id,
      });

      const rootNewId = new Types.ObjectId() as PrimaryId;
      const destinationParentId = new Types.ObjectId() as PrimaryId;

      const ops = buildClonedDescendants(
        [child1, child2, grandchild],
        '/original',
        '/destination',
        mockUserId,
        destinationParentId,
        rootNewId
      );

      expect(ops).toHaveLength(3);

      // Check child1
      expect(ops[0].insertOne.document.name).toBe('Child1');
      expect(ops[0].insertOne.document.path).toBe('/destination/Child1');
      expect(ops[0].insertOne.document.parent).toBe(rootNewId);

      // Check child2
      expect(ops[1].insertOne.document.name).toBe('Child2');
      expect(ops[1].insertOne.document.path).toBe('/destination/Child2');
      expect(ops[1].insertOne.document.parent).toBe(rootNewId);

      // Check grandchild - should have new parent ID mapped from child1's new ID
      expect(ops[2].insertOne.document.name).toBe('Grandchild');
      expect(ops[2].insertOne.document.path).toBe(
        '/destination/Child1/Grandchild'
      );
      expect(ops[2].insertOne.document.parent).not.toBe(child1Id);
      expect(ops[2].insertOne.document.parent).toBeDefined();
    });

    it('should handle deep nested hierarchy', () => {
      const level1Id = new Types.ObjectId() as PrimaryId;
      const level2Id = new Types.ObjectId() as PrimaryId;
      const level3Id = new Types.ObjectId() as PrimaryId;

      const level1 = createMockResource({
        _id: level1Id,
        name: 'Level1',
        path: '/root/Level1',
        parent: mockParentId,
      });

      const level2 = createMockResource({
        _id: level2Id,
        name: 'Level2',
        path: '/root/Level1/Level2',
        parent: level1Id,
      });

      const level3 = createMockResource({
        _id: level3Id,
        name: 'Level3',
        path: '/root/Level1/Level2/Level3',
        parent: level2Id,
      });

      const rootNewId = new Types.ObjectId() as PrimaryId;
      const destinationParentId = new Types.ObjectId() as PrimaryId;

      const ops = buildClonedDescendants(
        [level1, level2, level3],
        '/root',
        '/newroot',
        mockUserId,
        destinationParentId,
        rootNewId
      );

      expect(ops).toHaveLength(3);

      expect(ops[0].insertOne.document.path).toBe('/newroot/Level1');
      expect(ops[0].insertOne.document.parent).toBe(rootNewId);

      expect(ops[1].insertOne.document.path).toBe('/newroot/Level1/Level2');
      expect(ops[1].insertOne.document.parent).not.toBe(level1Id);

      expect(ops[2].insertOne.document.path).toBe(
        '/newroot/Level1/Level2/Level3'
      );
      expect(ops[2].insertOne.document.parent).not.toBe(level2Id);
    });

    it('should handle empty descendants array', () => {
      const rootNewId = new Types.ObjectId() as PrimaryId;
      const destinationParentId = new Types.ObjectId() as PrimaryId;

      const ops = buildClonedDescendants(
        [],
        '/original',
        '/destination',
        mockUserId,
        destinationParentId,
        rootNewId
      );

      expect(ops).toHaveLength(0);
    });

    it('should normalize paths with multiple slashes', () => {
      const descendantId = new Types.ObjectId() as PrimaryId;
      const descendant = createMockResource({
        _id: descendantId,
        name: 'Child',
        path: '/original//Child',
        parent: mockParentId,
      });

      const rootNewId = new Types.ObjectId() as PrimaryId;
      const destinationParentId = new Types.ObjectId() as PrimaryId;

      const ops = buildClonedDescendants(
        [descendant],
        '/original',
        '/destination',
        mockUserId,
        destinationParentId,
        rootNewId
      );

      expect(ops[0].insertOne.document.path).toBe('/destination/Child');
    });

    it('should handle root level paths', () => {
      const descendantId = new Types.ObjectId() as PrimaryId;
      const descendant = createMockResource({
        _id: descendantId,
        name: 'Child',
        path: '/Child',
        parent: mockParentId,
      });

      const rootNewId = new Types.ObjectId() as PrimaryId;
      const destinationParentId = new Types.ObjectId() as PrimaryId;

      const ops = buildClonedDescendants(
        [descendant],
        '',
        '/destination',
        mockUserId,
        destinationParentId,
        rootNewId
      );

      expect(ops[0].insertOne.document.path).toBe('/destination/Child');
    });

    it('should generate unique IDs for each cloned resource', () => {
      const child1Id = new Types.ObjectId() as PrimaryId;
      const child2Id = new Types.ObjectId() as PrimaryId;

      const child1 = createMockResource({
        _id: child1Id,
        name: 'Child1',
        path: '/original/Child1',
        parent: mockParentId,
      });

      const child2 = createMockResource({
        _id: child2Id,
        name: 'Child2',
        path: '/original/Child2',
        parent: mockParentId,
      });

      const rootNewId = new Types.ObjectId() as PrimaryId;
      const destinationParentId = new Types.ObjectId() as PrimaryId;

      const ops = buildClonedDescendants(
        [child1, child2],
        '/original',
        '/destination',
        mockUserId,
        destinationParentId,
        rootNewId
      );

      const id1 = ops[0].insertOne.document._id;
      const id2 = ops[1].insertOne.document._id;

      expect(id1).not.toBe(id2);
      expect(id1).not.toBe(child1Id);
      expect(id2).not.toBe(child2Id);
    });

    it('should preserve resource properties except _id, userId, path, and parent', () => {
      const descendantId = new Types.ObjectId() as PrimaryId;
      const descendant = createMockResource({
        _id: descendantId,
        name: 'MyFile',
        type: ResourceType.File,
        path: '/original/MyFile',
        parent: mockParentId,
        fileUrl: 'https://example.com/file.pdf',
        contentType: 'application/pdf',
        pinned: true,
      });

      const rootNewId = new Types.ObjectId() as PrimaryId;
      const destinationParentId = new Types.ObjectId() as PrimaryId;

      const ops = buildClonedDescendants(
        [descendant],
        '/original',
        '/destination',
        mockUserId,
        destinationParentId,
        rootNewId
      );

      const clonedDoc = ops[0].insertOne.document;
      expect(clonedDoc.name).toBe('MyFile');
      expect(clonedDoc.type).toBe(ResourceType.File);
      expect(clonedDoc.fileUrl).toBe('https://example.com/file.pdf');
      expect(clonedDoc.contentType).toBe('application/pdf');
      expect(clonedDoc.pinned).toBe(true);
    });

    it('should handle descendant with null parent', () => {
      const descendantId = new Types.ObjectId() as PrimaryId;
      const descendant = createMockResource({
        _id: descendantId,
        name: 'Child',
        path: '/original/Child',
        parent: null,
      });

      const rootNewId = new Types.ObjectId() as PrimaryId;
      const destinationParentId = new Types.ObjectId() as PrimaryId;

      const ops = buildClonedDescendants(
        [descendant],
        '/original',
        '/destination',
        mockUserId,
        destinationParentId,
        rootNewId
      );

      expect(ops[0].insertOne.document.parent).toBe(rootNewId);
    });

    it('should handle descendant with undefined parent', () => {
      const descendantId = new Types.ObjectId() as PrimaryId;
      const descendant = createMockResource({
        _id: descendantId,
        name: 'Child',
        path: '/original/Child',
        parent: undefined,
      });

      const rootNewId = new Types.ObjectId() as PrimaryId;
      const destinationParentId = new Types.ObjectId() as PrimaryId;

      const ops = buildClonedDescendants(
        [descendant],
        '/original',
        '/destination',
        mockUserId,
        destinationParentId,
        rootNewId
      );

      expect(ops[0].insertOne.document.parent).toBe(rootNewId);
    });

    it('should handle paths with trailing slashes', () => {
      const descendantId = new Types.ObjectId() as PrimaryId;
      const descendant = createMockResource({
        _id: descendantId,
        name: 'Child',
        path: '/original/Child/',
        parent: mockParentId,
      });

      const rootNewId = new Types.ObjectId() as PrimaryId;
      const destinationParentId = new Types.ObjectId() as PrimaryId;

      const ops = buildClonedDescendants(
        [descendant],
        '/original',
        '/destination/',
        mockUserId,
        destinationParentId,
        rootNewId
      );

      expect(ops[0].insertOne.document.path).toBe('/destination/Child/');
    });

    it('should fallback to destinationParentId when parent mapping not found', () => {
      const unknownParentId = new Types.ObjectId() as PrimaryId;
      const descendantId = new Types.ObjectId() as PrimaryId;
      const anotherDescendantId = new Types.ObjectId() as PrimaryId;

      const descendant1 = createMockResource({
        _id: descendantId,
        name: 'Child',
        path: '/original/Child',
        parent: mockParentId, // This will be mapped to rootNewId
      });

      const descendant2 = createMockResource({
        _id: anotherDescendantId,
        name: 'Child2',
        path: '/original/Child2',
        parent: unknownParentId, // This parent is not in the idMap
      });

      const rootNewId = new Types.ObjectId() as PrimaryId;
      const destinationParentId = new Types.ObjectId() as PrimaryId;

      const ops = buildClonedDescendants(
        [descendant1, descendant2],
        '/original',
        '/destination',
        mockUserId,
        destinationParentId,
        rootNewId
      );

      // First descendant should have rootNewId as parent
      expect(ops[0].insertOne.document.parent).toBe(rootNewId);

      // Second descendant with unknown parent should fallback to destinationParentId
      expect(ops[1].insertOne.document.parent).toBe(destinationParentId);
    });
  });
});
