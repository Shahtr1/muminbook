import { PrimaryId } from "../../../constants/primaryId";
import ResourceModel from "../../../models/resource.model";
import ResourceType from "../../../constants/resourceType";

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
        _id: "$parent",
        count: { $sum: 1 },
      },
    },
  ]);

  const childCountMap = new Map(
    childCounts.map((item) => [item._id.toString(), item.count]),
  );

  return resources.map((r: any) => ({
    _id: r._id,
    name: r.name,
    type: r.type,
    path: r.path,
    deletedAt: r.deletedAt,
    empty:
      r.type === ResourceType.Folder
        ? !childCountMap.get(r._id.toString())
        : undefined,
  }));
};
