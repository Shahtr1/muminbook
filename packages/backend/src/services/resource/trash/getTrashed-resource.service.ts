import { PrimaryId } from '../../../constants/primaryId';
import ResourceModel from '../../../models/resource.model';
import ResourceType from '../../../constants/types/resourceType';

export const getTrashedResources = async (userId: PrimaryId) => {
  const resources = await ResourceModel.find({
    userId,
    deleted: true,
  }).sort({ deletedAt: -1 });

  const trashedFolderIds = resources
    .filter((r) => r.type === ResourceType.Folder)
    .map((folder) => folder._id);

  const childCounts = await ResourceModel.aggregate([
    {
      $match: {
        parent: { $in: trashedFolderIds },
        userId,
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

  const childCountMap = new Map(
    childCounts.map((item) => [item._id.toString(), item.count])
  );

  const folders = [];
  const files = [];

  for (const r of resources) {
    const item = {
      _id: r._id,
      name: r.name,
      type: r.type,
      path: r.path,
      deletedAt: r.deletedAt,
      empty:
        r.type === ResourceType.Folder
          ? !childCountMap.get((r._id as PrimaryId).toString())
          : undefined,
    };

    if (r.type === ResourceType.Folder) {
      folders.push(item);
    } else {
      files.push(item);
    }
  }

  return [...folders, ...files];
};
