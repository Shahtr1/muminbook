import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import mongoose from 'mongoose';

import * as svc from '../get-resource.service';
import ResourceModel from '../../../models/resource.model';
import ResourceType from '../../../constants/types/resourceType';
import { NOT_FOUND } from '../../../constants/http';
import { ResourcePreview } from '../get-resource.service';

const oid = () => new mongoose.Types.ObjectId();

describe('getResourceChildren', () => {
  let findOneSpy: any;
  let findSpy: any;
  let aggregateSpy: any;

  beforeEach(() => {
    findOneSpy = vi.spyOn(ResourceModel, 'findOne');
    findSpy = vi.spyOn(ResourceModel, 'find');
    aggregateSpy = vi.spyOn(ResourceModel, 'aggregate');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns [] for an empty folder (early return)', async () => {
    const folderId = oid();
    findOneSpy.mockResolvedValue({ _id: folderId });
    findSpy.mockResolvedValue([]);

    const res = await svc.getResourceChildren('some-path', folderId as any);
    expect(res).toEqual([]);
    expect(aggregateSpy).not.toHaveBeenCalled();
  });

  it('returns children with empty flag computed; lost+found ordered first (happy path)', async () => {
    const folderId = oid();
    findOneSpy.mockResolvedValue({ _id: folderId });

    const lostFound: ResourcePreview = {
      _id: oid(),
      name: 'lost+found',
      type: ResourceType.Folder,
      pinned: false,
    };
    const otherFolder: ResourcePreview = {
      _id: oid(),
      name: 'z-folder',
      type: ResourceType.Folder,
      pinned: false,
    };
    const file: ResourcePreview = {
      _id: oid(),
      name: 'a.txt',
      type: ResourceType.File,
      pinned: false,
    };

    // find returns children in mixed order
    findSpy.mockResolvedValue([file, otherFolder, lostFound]);

    // aggregate should return child counts for folders: only otherFolder has children (count 2)
    aggregateSpy.mockResolvedValue([
      { _id: otherFolder._id, count: 2 },
      // lostFound absent => treated as empty
    ]);

    const res = await svc.getResourceChildren('my-files', folderId as any);

    // lost+found should come first
    expect(res[0].name).toBe('lost+found');

    // otherFolder should have empty = false
    const other = res.find((r) => r.name === 'z-folder')!;
    expect(other.empty).toBe(false);

    // lostFound (since not present in aggregate) should be empty === true
    const lf = res.find((r) => r.name === 'lost+found')!;
    expect(lf.empty).toBe(true);
  });

  it('throws NOT_FOUND when folder missing', async () => {
    findOneSpy.mockResolvedValue(null);

    // AppError exposes `statusCode` (not `status`), assert accordingly
    await expect(
      svc.getResourceChildren('nope', oid() as any)
    ).rejects.toMatchObject({ statusCode: NOT_FOUND });
  });
});
