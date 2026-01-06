import { Types } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ResourceModel from '../../../models/resource.model';
import ResourceType from '../../../constants/types/resourceType';
import { renameResource } from '../rename-resource.service';
import * as commonService from '../common-resource.service';

vi.mock('../../../models/resource.model', () => {
  const MockResourceModel: any = {
    findOne: vi.fn(),
    bulkWrite: vi.fn(),
    prototype: { _id: new Types.ObjectId() },
  };
  MockResourceModel.mockImplementation = function () {
    return { _id: new Types.ObjectId() };
  };
  return { default: MockResourceModel };
});
vi.mock('../common-resource.service', () => ({
  assertNotRootFolder: vi.fn(),
  findDescendantsByPath: vi.fn(),
}));

const mockedResourceModel = vi.mocked(ResourceModel, true);
const mockedFindDescendants = vi.mocked(commonService.findDescendantsByPath);
const mockedAssertNotRoot = vi.mocked(commonService.assertNotRootFolder);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('renameResource service', () => {
  const userId = new Types.ObjectId();
  const resourceId = new Types.ObjectId();

  it('throws NOT_FOUND when resource missing', async () => {
    mockedResourceModel.findOne.mockResolvedValue(null as any);

    await expect(
      renameResource(resourceId as any, 'name', userId as any)
    ).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('throws BAD_REQUEST when resource is trashed', async () => {
    mockedResourceModel.findOne.mockResolvedValue({ deleted: true } as any);

    await expect(
      renameResource(resourceId as any, 'name', userId as any)
    ).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it('throws when trying to rename root folder', async () => {
    mockedResourceModel.findOne.mockResolvedValue({
      deleted: false,
      path: 'my-files',
      type: ResourceType.Folder,
    } as any);
    mockedAssertNotRoot.mockImplementationOnce(() => {
      throw new Error('root');
    });

    await expect(
      renameResource(resourceId as any, 'name', userId as any)
    ).rejects.toThrow('root');
  });

  it('throws CONFLICT when destination exists', async () => {
    const resource = {
      _id: resourceId,
      deleted: false,
      path: '/a/b',
      type: ResourceType.File,
    } as any;
    mockedResourceModel.findOne
      .mockResolvedValueOnce(resource) // find resource
      .mockResolvedValueOnce({
        _id: new Types.ObjectId(),
        type: ResourceType.File,
      }); // conflict lookup

    await expect(
      renameResource(resourceId as any, 'b', userId as any)
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it('renames a file successfully', async () => {
    const resource = {
      _id: resourceId,
      deleted: false,
      path: '/a/old',
      type: ResourceType.File,
    } as any;
    mockedResourceModel.findOne
      .mockResolvedValueOnce(resource) // find resource
      .mockResolvedValueOnce(null); // conflict lookup

    mockedResourceModel.bulkWrite = vi.fn().mockResolvedValue({});

    const result = await renameResource(
      resourceId as any,
      'new',
      userId as any
    );
    expect(result).toEqual({ message: 'Renamed successfully' });

    expect(mockedResourceModel.bulkWrite).toHaveBeenCalledTimes(1);
    const ops = (mockedResourceModel.bulkWrite as any).mock.calls[0][0];
    expect(ops).toHaveLength(1);
    expect(ops[0].updateOne.update.$set.path).toBe('/a/new');
  });

  it('renames a folder and updates descendants', async () => {
    const resource = {
      _id: resourceId,
      deleted: false,
      path: '/root/old',
      type: ResourceType.Folder,
    } as any;
    const descendants = [
      { _id: new Types.ObjectId(), path: '/root/old/child1' },
      { _id: new Types.ObjectId(), path: '/root/old/child2/grand' },
    ];

    mockedResourceModel.findOne
      .mockResolvedValueOnce(resource) // find resource
      .mockResolvedValueOnce(null); // conflict lookup

    mockedFindDescendants.mockResolvedValue(descendants as any);
    mockedResourceModel.bulkWrite = vi.fn().mockResolvedValue({});

    const res = await renameResource(
      resourceId as any,
      'newroot',
      userId as any
    );
    expect(res).toEqual({ message: 'Renamed successfully' });

    expect(mockedFindDescendants).toHaveBeenCalledWith(
      '/root/old',
      userId,
      false
    );
    expect(mockedResourceModel.bulkWrite).toHaveBeenCalledTimes(1);

    const ops = (mockedResourceModel.bulkWrite as any).mock.calls[0][0];
    // two descendants + one resource
    expect(ops).toHaveLength(3);
    const paths = ops.map((op: any) => op.updateOne.update.$set.path);
    expect(paths).toContain('/root/newroot/child1');
    expect(paths).toContain('/root/newroot/child2/grand');
    expect(paths).toContain('/root/newroot');
  });

  it('normalizes multiple slashes in paths', async () => {
    const resource = {
      _id: resourceId,
      deleted: false,
      path: '/root//old',
      type: ResourceType.Folder,
    } as any;
    const descendants = [
      { _id: new Types.ObjectId(), path: '/root//old//child' },
    ];

    mockedResourceModel.findOne
      .mockResolvedValueOnce(resource)
      .mockResolvedValueOnce(null);
    mockedFindDescendants.mockResolvedValue(descendants as any);
    mockedResourceModel.bulkWrite = vi.fn().mockResolvedValue({});

    const res = await renameResource(resourceId as any, 'new', userId as any);
    expect(res).toEqual({ message: 'Renamed successfully' });

    const ops = (mockedResourceModel.bulkWrite as any).mock.calls[0][0];
    const paths = ops.map((op: any) => op.updateOne.update.$set.path);
    expect(paths).toContain('/root/new/child');
    expect(paths).toContain('/root/new');
  });

  it('propagates errors from findDescendantsByPath', async () => {
    const resource = {
      _id: resourceId,
      deleted: false,
      path: '/root/old',
      type: ResourceType.Folder,
    } as any;
    mockedResourceModel.findOne.mockResolvedValueOnce(resource);
    mockedResourceModel.findOne.mockResolvedValueOnce(null);
    mockedFindDescendants.mockRejectedValue(new Error('desc error'));

    await expect(
      renameResource(resourceId as any, 'newname', userId as any)
    ).rejects.toThrow('desc error');
  });

  it('propagates errors from bulkWrite', async () => {
    const resource = {
      _id: resourceId,
      deleted: false,
      path: '/a/old',
      type: ResourceType.File,
    } as any;
    mockedResourceModel.findOne
      .mockResolvedValueOnce(resource)
      .mockResolvedValueOnce(null);

    mockedResourceModel.bulkWrite = vi
      .fn()
      .mockRejectedValue(new Error('bulk failed'));

    await expect(
      renameResource(resourceId as any, 'new', userId as any)
    ).rejects.toThrow('bulk failed');
  });
});
