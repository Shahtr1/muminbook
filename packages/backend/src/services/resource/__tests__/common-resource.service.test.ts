/**
 * @fileoverview Common Resource Service Test Suite
 *
 * Tests for common resource service functions:
 * - assertNotRootFolder: Validates that a resource is not the root folder
 * - getAllDescendants: Retrieves all descendant resources of a parent path
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Types } from 'mongoose';
import {
  assertNotRootFolder,
  getAllDescendants,
} from '../common-resource.service';
import ResourceModel, {
  ResourceDocument,
} from '../../../models/resource.model';
import ResourceType from '../../../constants/types/resourceType';
import { PrimaryId } from '../../../constants/primaryId';
import AppError from '../../../utils/AppError';
import { BAD_REQUEST } from '../../../constants/http';

vi.mock('../../../models/resource.model', () => {
  const MockResourceModel: any = {
    find: vi.fn(),
  };

  return {
    default: MockResourceModel,
  };
});

describe('Common Resource Service', () => {
  const mockUserId = new Types.ObjectId() as PrimaryId;
  const mockParentId = new Types.ObjectId() as PrimaryId;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockResource = (overrides: any = {}): ResourceDocument =>
    ({
      _id: new Types.ObjectId(),
      userId: mockUserId,
      name: 'Test Resource',
      type: ResourceType.File,
      path: '/test/resource',
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
    }) as any;

  describe('assertNotRootFolder', () => {
    describe('Valid scenarios (should not throw)', () => {
      it('should not throw for regular file', () => {
        const resource = createMockResource({
          path: '/documents/file.pdf',
          parent: mockParentId,
        });

        expect(() => assertNotRootFolder(resource)).not.toThrow();
      });

      it('should not throw for regular folder', () => {
        const resource = createMockResource({
          path: '/documents/folder',
          type: ResourceType.Folder,
          parent: mockParentId,
        });

        expect(() => assertNotRootFolder(resource)).not.toThrow();
      });

      it('should not throw for deeply nested resource', () => {
        const resource = createMockResource({
          path: '/a/b/c/d/e/f/file.pdf',
          parent: mockParentId,
        });

        expect(() => assertNotRootFolder(resource)).not.toThrow();
      });

      it('should not throw for resource with my-files in path but not as root', () => {
        const resource = createMockResource({
          path: '/documents/my-files-copy',
          parent: mockParentId,
        });

        expect(() => assertNotRootFolder(resource)).not.toThrow();
      });

      it('should not throw for resource with special characters in path', () => {
        const resource = createMockResource({
          path: '/documents/file (copy) [2].pdf',
          parent: mockParentId,
        });

        expect(() => assertNotRootFolder(resource)).not.toThrow();
      });
    });

    describe('Invalid scenarios (should throw)', () => {
      it('should throw BAD_REQUEST when resource path is "my-files"', () => {
        const resource = createMockResource({
          path: 'my-files',
          parent: mockParentId,
        });

        expect(() => assertNotRootFolder(resource)).toThrow(AppError);
        expect(() => assertNotRootFolder(resource)).toThrow(
          'Cannot modify root folder'
        );

        try {
          assertNotRootFolder(resource);
        } catch (error: any) {
          expect(error.statusCode).toBe(BAD_REQUEST);
        }
      });

      it('should throw BAD_REQUEST when resource parent is null', () => {
        const resource = createMockResource({
          path: '/some-folder',
          parent: null,
        });

        expect(() => assertNotRootFolder(resource)).toThrow(AppError);
        expect(() => assertNotRootFolder(resource)).toThrow(
          'Cannot modify root folder'
        );

        try {
          assertNotRootFolder(resource);
        } catch (error: any) {
          expect(error.statusCode).toBe(BAD_REQUEST);
        }
      });

      it('should throw when both path is "my-files" and parent is null', () => {
        const resource = createMockResource({
          path: 'my-files',
          parent: null,
        });

        expect(() => assertNotRootFolder(resource)).toThrow(
          'Cannot modify root folder'
        );
      });

      it('should throw with custom message when provided', () => {
        const resource = createMockResource({
          path: 'my-files',
          parent: mockParentId,
        });

        const customMessage = 'Custom error: root folder cannot be modified';
        expect(() => assertNotRootFolder(resource, customMessage)).toThrow(
          customMessage
        );
      });
    });

    describe('Edge cases', () => {
      it('should handle resource with undefined parent', () => {
        const resource = createMockResource({
          path: '/documents/file.pdf',
          parent: undefined,
        });

        // undefined is falsy, so it should not throw (only null triggers the check)
        expect(() => assertNotRootFolder(resource)).not.toThrow();
      });

      it('should handle resource with empty string path', () => {
        const resource = createMockResource({
          path: '',
          parent: mockParentId,
        });

        expect(() => assertNotRootFolder(resource)).not.toThrow();
      });

      it('should be case-sensitive for my-files path', () => {
        const resource = createMockResource({
          path: 'My-Files',
          parent: mockParentId,
        });

        expect(() => assertNotRootFolder(resource)).not.toThrow();
      });

      it('should handle path with trailing slash', () => {
        const resource = createMockResource({
          path: 'my-files/',
          parent: mockParentId,
        });

        expect(() => assertNotRootFolder(resource)).not.toThrow();
      });

      it('should handle path with leading slash', () => {
        const resource = createMockResource({
          path: '/my-files',
          parent: mockParentId,
        });

        expect(() => assertNotRootFolder(resource)).not.toThrow();
      });
    });
  });

  describe('getAllDescendants', () => {
    describe('Basic functionality', () => {
      it('should return all descendants including deleted by default', async () => {
        const mockDescendants = [
          createMockResource({ path: '/parent/child1.pdf', deleted: false }),
          createMockResource({ path: '/parent/child2.pdf', deleted: true }),
          createMockResource({
            path: '/parent/subfolder',
            type: ResourceType.Folder,
            deleted: false,
          }),
        ];

        vi.mocked(ResourceModel.find).mockResolvedValue(mockDescendants as any);

        const result = await getAllDescendants('/parent', mockUserId);

        expect(result).toEqual(mockDescendants);
        expect(ResourceModel.find).toHaveBeenCalledWith({
          path: new RegExp('^/parent/'),
          userId: mockUserId,
        });
      });

      it('should exclude deleted descendants when includeDeleted is false', async () => {
        const mockDescendants = [
          createMockResource({ path: '/parent/child1.pdf', deleted: false }),
        ];

        vi.mocked(ResourceModel.find).mockResolvedValue(mockDescendants as any);

        const result = await getAllDescendants('/parent', mockUserId, false);

        expect(result).toEqual(mockDescendants);
        expect(ResourceModel.find).toHaveBeenCalledWith({
          path: new RegExp('^/parent/'),
          userId: mockUserId,
          deleted: false,
        });
      });

      it('should return empty array when no descendants exist', async () => {
        vi.mocked(ResourceModel.find).mockResolvedValue([]);

        const result = await getAllDescendants('/parent', mockUserId);

        expect(result).toEqual([]);
      });

      it('should include deleted descendants when includeDeleted is true', async () => {
        const mockDescendants = [
          createMockResource({ path: '/parent/deleted.pdf', deleted: true }),
        ];

        vi.mocked(ResourceModel.find).mockResolvedValue(mockDescendants as any);

        const result = await getAllDescendants('/parent', mockUserId, true);

        expect(result).toEqual(mockDescendants);
        expect(ResourceModel.find).toHaveBeenCalledWith({
          path: new RegExp('^/parent/'),
          userId: mockUserId,
        });
      });
    });

    describe('Path matching and regex escaping', () => {
      it('should escape special regex characters in path', async () => {
        vi.mocked(ResourceModel.find).mockResolvedValue([]);

        await getAllDescendants('/path.with.dots', mockUserId);

        expect(ResourceModel.find).toHaveBeenCalledWith({
          path: new RegExp('^/path\\.with\\.dots/'),
          userId: mockUserId,
        });
      });

      it('should handle path with asterisk', async () => {
        vi.mocked(ResourceModel.find).mockResolvedValue([]);

        await getAllDescendants('/path*with*asterisk', mockUserId);

        expect(ResourceModel.find).toHaveBeenCalledWith({
          path: new RegExp('^/path\\*with\\*asterisk/'),
          userId: mockUserId,
        });
      });

      it('should handle path with plus sign', async () => {
        vi.mocked(ResourceModel.find).mockResolvedValue([]);

        await getAllDescendants('/lost+found', mockUserId);

        expect(ResourceModel.find).toHaveBeenCalledWith({
          path: new RegExp('^/lost\\+found/'),
          userId: mockUserId,
        });
      });

      it('should handle path with question mark', async () => {
        vi.mocked(ResourceModel.find).mockResolvedValue([]);

        await getAllDescendants('/path?with?questions', mockUserId);

        expect(ResourceModel.find).toHaveBeenCalledWith({
          path: new RegExp('^/path\\?with\\?questions/'),
          userId: mockUserId,
        });
      });

      it('should handle path with caret and dollar signs', async () => {
        vi.mocked(ResourceModel.find).mockResolvedValue([]);

        await getAllDescendants('/path^with$special', mockUserId);

        expect(ResourceModel.find).toHaveBeenCalledWith({
          path: new RegExp('^/path\\^with\\$special/'),
          userId: mockUserId,
        });
      });

      it('should handle path with curly braces', async () => {
        vi.mocked(ResourceModel.find).mockResolvedValue([]);

        await getAllDescendants('/path{with}braces', mockUserId);

        expect(ResourceModel.find).toHaveBeenCalledWith({
          path: new RegExp('^/path\\{with\\}braces/'),
          userId: mockUserId,
        });
      });

      it('should handle path with parentheses', async () => {
        vi.mocked(ResourceModel.find).mockResolvedValue([]);

        await getAllDescendants('/path(with)parens', mockUserId);

        expect(ResourceModel.find).toHaveBeenCalledWith({
          path: new RegExp('^/path\\(with\\)parens/'),
          userId: mockUserId,
        });
      });

      it('should handle path with pipe', async () => {
        vi.mocked(ResourceModel.find).mockResolvedValue([]);

        await getAllDescendants('/path|with|pipes', mockUserId);

        expect(ResourceModel.find).toHaveBeenCalledWith({
          path: new RegExp('^/path\\|with\\|pipes/'),
          userId: mockUserId,
        });
      });

      it('should handle path with square brackets', async () => {
        vi.mocked(ResourceModel.find).mockResolvedValue([]);

        await getAllDescendants('/path[with]brackets', mockUserId);

        expect(ResourceModel.find).toHaveBeenCalledWith({
          path: new RegExp('^/path\\[with\\]brackets/'),
          userId: mockUserId,
        });
      });

      it('should handle path with backslash', async () => {
        vi.mocked(ResourceModel.find).mockResolvedValue([]);

        await getAllDescendants('/path\\with\\backslash', mockUserId);

        expect(ResourceModel.find).toHaveBeenCalledWith({
          path: new RegExp('^/path\\\\with\\\\backslash/'),
          userId: mockUserId,
        });
      });

      it('should handle path with multiple special characters', async () => {
        vi.mocked(ResourceModel.find).mockResolvedValue([]);

        await getAllDescendants('/path.*+?^${}()|[]\\special', mockUserId);

        expect(ResourceModel.find).toHaveBeenCalledWith({
          path: new RegExp(
            '^/path\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\special/'
          ),
          userId: mockUserId,
        });
      });
    });

    describe('Path hierarchy', () => {
      it('should match only direct descendants and their children', async () => {
        const mockDescendants = [
          createMockResource({ path: '/parent/child.pdf' }),
          createMockResource({ path: '/parent/subfolder/file.pdf' }),
          createMockResource({ path: '/parent/subfolder/deep/file.pdf' }),
        ];

        vi.mocked(ResourceModel.find).mockResolvedValue(mockDescendants as any);

        const result = await getAllDescendants('/parent', mockUserId);

        expect(result).toHaveLength(3);
        expect(result).toEqual(mockDescendants);
      });

      it('should not match sibling paths', async () => {
        vi.mocked(ResourceModel.find).mockResolvedValue([]);

        await getAllDescendants('/folder1', mockUserId);

        // Regex should be ^/folder1/ which won't match /folder2/...
        const calledRegex = (
          vi.mocked(ResourceModel.find).mock.calls as any
        )[0][0].path as RegExp;
        expect('/folder2/file.pdf').not.toMatch(calledRegex);
      });

      it('should not match parent path itself', async () => {
        vi.mocked(ResourceModel.find).mockResolvedValue([]);

        await getAllDescendants('/parent', mockUserId);

        const calledRegex = (
          vi.mocked(ResourceModel.find).mock.calls as any
        )[0][0].path as RegExp;
        expect('/parent').not.toMatch(calledRegex);
      });

      it('should not match paths that only partially match', async () => {
        vi.mocked(ResourceModel.find).mockResolvedValue([]);

        await getAllDescendants('/doc', mockUserId);

        const calledRegex = (
          vi.mocked(ResourceModel.find).mock.calls as any
        )[0][0].path as RegExp;
        expect('/documents/file.pdf').not.toMatch(calledRegex);
      });

      it('should match deeply nested descendants', async () => {
        const mockDescendants = [
          createMockResource({ path: '/a/b/c/d/e/f/g/h/file.pdf' }),
        ];

        vi.mocked(ResourceModel.find).mockResolvedValue(mockDescendants as any);

        const result = await getAllDescendants('/a', mockUserId);

        expect(result).toHaveLength(1);
      });
    });

    describe('User isolation', () => {
      it('should filter by userId', async () => {
        const userId1 = new Types.ObjectId() as PrimaryId;
        const userId2 = new Types.ObjectId() as PrimaryId;

        vi.mocked(ResourceModel.find).mockResolvedValue([]);

        await getAllDescendants('/parent', userId1);

        expect(ResourceModel.find).toHaveBeenCalledWith({
          path: expect.any(RegExp),
          userId: userId1,
        });

        vi.clearAllMocks();
        await getAllDescendants('/parent', userId2);

        expect(ResourceModel.find).toHaveBeenCalledWith({
          path: expect.any(RegExp),
          userId: userId2,
        });
      });

      it('should not return descendants from different users', async () => {
        vi.mocked(ResourceModel.find).mockResolvedValue([]);

        await getAllDescendants('/parent', mockUserId);

        expect(ResourceModel.find).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: mockUserId,
          })
        );
      });
    });

    describe('Edge cases', () => {
      it('should handle empty parent path', async () => {
        vi.mocked(ResourceModel.find).mockResolvedValue([]);

        await getAllDescendants('', mockUserId);

        expect(ResourceModel.find).toHaveBeenCalledWith({
          path: new RegExp('^/'),
          userId: mockUserId,
        });
      });

      it('should handle root path', async () => {
        vi.mocked(ResourceModel.find).mockResolvedValue([]);

        await getAllDescendants('/', mockUserId);

        expect(ResourceModel.find).toHaveBeenCalledWith({
          path: new RegExp('^//'),
          userId: mockUserId,
        });
      });

      it('should handle path with trailing slash', async () => {
        vi.mocked(ResourceModel.find).mockResolvedValue([]);

        await getAllDescendants('/parent/', mockUserId);

        expect(ResourceModel.find).toHaveBeenCalledWith({
          path: new RegExp('^/parent//'),
          userId: mockUserId,
        });
      });

      it('should handle path with multiple consecutive slashes', async () => {
        vi.mocked(ResourceModel.find).mockResolvedValue([]);

        await getAllDescendants('/parent//subfolder', mockUserId);

        expect(ResourceModel.find).toHaveBeenCalledWith({
          path: new RegExp('^/parent//subfolder/'),
          userId: mockUserId,
        });
      });

      it('should handle very long path', async () => {
        const longPath = '/a'.repeat(100);
        vi.mocked(ResourceModel.find).mockResolvedValue([]);

        await getAllDescendants(longPath, mockUserId);

        expect(ResourceModel.find).toHaveBeenCalled();
      });

      it('should handle path with unicode characters', async () => {
        vi.mocked(ResourceModel.find).mockResolvedValue([]);

        await getAllDescendants('/folder/文件夹/папка', mockUserId);

        expect(ResourceModel.find).toHaveBeenCalledWith({
          path: new RegExp('^/folder/文件夹/папка/'),
          userId: mockUserId,
        });
      });

      it('should handle path with emojis', async () => {
        vi.mocked(ResourceModel.find).mockResolvedValue([]);

        await getAllDescendants('/folder/📁/file', mockUserId);

        expect(ResourceModel.find).toHaveBeenCalledWith({
          path: new RegExp('^/folder/📁/file/'),
          userId: mockUserId,
        });
      });

      it('should handle path with spaces', async () => {
        vi.mocked(ResourceModel.find).mockResolvedValue([]);

        await getAllDescendants('/folder with spaces', mockUserId);

        expect(ResourceModel.find).toHaveBeenCalledWith({
          path: new RegExp('^/folder with spaces/'),
          userId: mockUserId,
        });
      });

      it('should return different results for different includeDeleted values', async () => {
        const allDescendants = [
          createMockResource({ deleted: false }),
          createMockResource({ deleted: true }),
        ];
        const activeDescendants = [createMockResource({ deleted: false })];

        vi.mocked(ResourceModel.find)
          .mockResolvedValueOnce(allDescendants as any)
          .mockResolvedValueOnce(activeDescendants as any);

        const resultAll = await getAllDescendants('/parent', mockUserId, true);
        const resultActive = await getAllDescendants(
          '/parent',
          mockUserId,
          false
        );

        expect(resultAll).toHaveLength(2);
        expect(resultActive).toHaveLength(1);
      });

      it('should handle large number of descendants', async () => {
        const mockDescendants = Array.from({ length: 1000 }, (_, i) =>
          createMockResource({ path: `/parent/file${i}.pdf` })
        );

        vi.mocked(ResourceModel.find).mockResolvedValue(mockDescendants as any);

        const result = await getAllDescendants('/parent', mockUserId);

        expect(result).toHaveLength(1000);
      });
    });

    describe('Error handling', () => {
      it('should propagate database errors', async () => {
        const dbError = new Error('Database connection failed');
        vi.mocked(ResourceModel.find).mockRejectedValue(dbError);

        await expect(getAllDescendants('/parent', mockUserId)).rejects.toThrow(
          'Database connection failed'
        );
      });

      it('should handle null response from database', async () => {
        vi.mocked(ResourceModel.find).mockResolvedValue(null as any);

        const result = await getAllDescendants('/parent', mockUserId);

        expect(result).toBeNull();
      });

      it('should handle undefined response from database', async () => {
        vi.mocked(ResourceModel.find).mockResolvedValue(undefined as any);

        const result = await getAllDescendants('/parent', mockUserId);

        expect(result).toBeUndefined();
      });
    });
  });
});
