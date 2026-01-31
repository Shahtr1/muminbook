/**
 * @fileoverview Create Resource Service Test Suite
 *
 * Tests:
 * - parent folder validation
 * - conflict detection
 * - path decoding and normalization
 * - file vs folder behavior
 * - returned DTO shape
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Types } from 'mongoose';
import { createResource } from '../create-resource.service';
import ResourceModel from '../../../models/resource.model';
import ResourceType from '../../../constants/types/resourceType';
import { PrimaryId } from '../../../constants/ids';
import { CONFLICT, NOT_FOUND } from '../../../constants/http';

vi.mock('../../../models/resource.model', () => {
  const MockResourceModel: any = {
    findOne: vi.fn(),
    create: vi.fn(),
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

vi.mock('../../../utils/appAssert', () => ({
  default: vi.fn((condition, status, message) => {
    if (!condition) {
      const err = new Error(message);
      (err as any).statusCode = status;
      throw err;
    }
  }),
}));

/* ------------------------------------------------------------------ */

describe('createResource service', () => {
  const userId = new Types.ObjectId() as PrimaryId;
  const parentId = new Types.ObjectId();
  const resourceId = new Types.ObjectId();

  const parentFolder = {
    _id: parentId,
    name: 'parent',
    type: ResourceType.Folder,
    path: '/parent',
    userId,
    deleted: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  /* ------------------------------------------------------------------ */
  /* Parent validation                                                   */
  /* ------------------------------------------------------------------ */

  it('should throw NOT_FOUND if parent folder does not exist', async () => {
    vi.mocked(ResourceModel.findOne).mockResolvedValueOnce(null);

    await expect(
      createResource(
        {
          name: 'child',
          type: ResourceType.Folder,
          path: '/parent',
        },
        userId
      )
    ).rejects.toMatchObject({
      statusCode: NOT_FOUND,
      message: 'Parent folder not found',
    });

    expect(ResourceModel.findOne).toHaveBeenCalledWith({
      path: '/parent',
      type: ResourceType.Folder,
      userId,
      deleted: false,
    });
  });

  /* ------------------------------------------------------------------ */
  /* Conflict detection                                                  */
  /* ------------------------------------------------------------------ */

  it('should throw CONFLICT if resource already exists (file)', async () => {
    vi.mocked(ResourceModel.findOne)
      .mockResolvedValueOnce(parentFolder as any)
      .mockResolvedValueOnce({ type: ResourceType.File } as any);

    await expect(
      createResource(
        {
          name: 'file.txt',
          type: ResourceType.File,
          path: '/parent',
        },
        userId
      )
    ).rejects.toMatchObject({
      statusCode: CONFLICT,
    });
  });

  it('should throw CONFLICT with folder message when folder exists', async () => {
    vi.mocked(ResourceModel.findOne)
      .mockResolvedValueOnce(parentFolder as any)
      .mockResolvedValueOnce({ type: ResourceType.Folder } as any);

    await expect(
      createResource(
        {
          name: 'docs',
          type: ResourceType.Folder,
          path: '/parent',
        },
        userId
      )
    ).rejects.toThrow('folder with this name already exists');
  });

  /* ------------------------------------------------------------------ */
  /* Path handling                                                       */
  /* ------------------------------------------------------------------ */

  it('should decode URI-encoded paths and collapse slashes', async () => {
    vi.mocked(ResourceModel.findOne)
      .mockResolvedValueOnce(parentFolder as any)
      .mockResolvedValueOnce(null);

    vi.mocked(ResourceModel.create).mockResolvedValue({
      _id: resourceId,
      name: 'child',
      type: ResourceType.Folder,
      path: '/parent/child',
    } as any);

    const result = await createResource(
      {
        name: 'child',
        type: ResourceType.Folder,
        path: '/parent%2F',
      },
      userId
    );

    expect(ResourceModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        path: '/parent/child',
      })
    );

    expect(result.path).toBe('/parent/child');
  });

  /* ------------------------------------------------------------------ */
  /* File vs Folder behavior                                             */
  /* ------------------------------------------------------------------ */

  it('should include fileUrl and contentType only for files', async () => {
    vi.mocked(ResourceModel.findOne)
      .mockResolvedValueOnce(parentFolder as any)
      .mockResolvedValueOnce(null);

    vi.mocked(ResourceModel.create).mockResolvedValue({
      _id: resourceId,
      name: 'file.txt',
      type: ResourceType.File,
      path: '/parent/file.txt',
    } as any);

    await createResource(
      {
        name: 'file.txt',
        type: ResourceType.File,
        path: '/parent',
        fileUrl: 'https://example.com/file.txt',
        contentType: 'text/plain',
      },
      userId
    );

    expect(ResourceModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        fileUrl: 'https://example.com/file.txt',
        contentType: 'text/plain',
      })
    );
  });

  it('should omit fileUrl and contentType for folders', async () => {
    vi.mocked(ResourceModel.findOne)
      .mockResolvedValueOnce(parentFolder as any)
      .mockResolvedValueOnce(null);

    vi.mocked(ResourceModel.create).mockResolvedValue({
      _id: resourceId,
      name: 'docs',
      type: ResourceType.Folder,
      path: '/parent/docs',
    } as any);

    await createResource(
      {
        name: 'docs',
        type: ResourceType.Folder,
        path: '/parent',
        fileUrl: 'should-not-save',
        contentType: 'should-not-save',
      },
      userId
    );

    expect(ResourceModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        fileUrl: undefined,
        contentType: undefined,
      })
    );
  });

  /* ------------------------------------------------------------------ */
  /* Return shape                                                        */
  /* ------------------------------------------------------------------ */

  it('should return only public fields', async () => {
    vi.mocked(ResourceModel.findOne)
      .mockResolvedValueOnce(parentFolder as any)
      .mockResolvedValueOnce(null);

    vi.mocked(ResourceModel.create).mockResolvedValue({
      _id: resourceId,
      name: 'docs',
      type: ResourceType.Folder,
      path: '/parent/docs',
      parent: parentId,
      userId,
    } as any);

    const result = await createResource(
      {
        name: 'docs',
        type: ResourceType.Folder,
        path: '/parent',
      },
      userId
    );

    expect(result).toEqual({
      _id: resourceId,
      name: 'docs',
      type: ResourceType.Folder,
      path: '/parent/docs',
    });
  });
});
