import { PrimaryId } from '../../constants/primaryId';
import ResourceModel from '../../models/resource.model';
import ResourceType from '../../constants/enums_types/resourceType';
import appAssert from '../../utils/appAssert';
import { NOT_FOUND } from '../../constants/http';

export const getResourceChildren = async (
  folderPath: string,
  userId: PrimaryId
) => {
  const path = decodeURIComponent(folderPath || 'my-files');

  const folder = await ResourceModel.findOne({
    path,
    type: ResourceType.Folder,
    userId,
    deleted: false,
  });

  appAssert(folder, NOT_FOUND, 'Folder not found');

  const children = await ResourceModel.find({
    parent: folder._id,
    userId,
    deleted: false,
  });

  const folderIds = children
    .filter((child) => child.type === ResourceType.Folder)
    .map((f) => f._id);

  const childCounts = await ResourceModel.aggregate([
    { $match: { parent: { $in: folderIds }, userId, deleted: false } },
    { $group: { _id: '$parent', count: { $sum: 1 } } },
  ]);

  const childCountMap = new Map(
    childCounts.map((item) => [item._id.toString(), item.count])
  );

  const formattedChildren = children.map((child) => ({
    _id: child._id,
    name: child.name,
    type: child.type,
    empty:
      child.type === ResourceType.Folder
        ? !childCountMap.get((child._id as PrimaryId).toString())
        : undefined,
    pinned: child.pinned,
  }));

  // Custom ordering: lost+found → folders → files
  let lostFoundFolder = [];
  let otherFolders = [];
  let files = [];

  for (const child of formattedChildren) {
    if (
      path === 'my-files' &&
      child.name === 'lost+found' &&
      child.type === ResourceType.Folder
    ) {
      lostFoundFolder.push(child);
    } else if (child.type === ResourceType.Folder) {
      otherFolders.push(child);
    } else {
      files.push(child);
    }
  }

  return [...lostFoundFolder, ...otherFolders, ...files];
};
