import { PrimaryId } from '../../constants/ids.js';
import ResourceModel, {
  ResourceDocument,
} from '../../models/resource.model.js';
import ResourceType from '../../constants/types/resourceType.js';
import appAssert from '../../utils/appAssert.js';
import { NOT_FOUND } from '../../constants/http.js';

export type ResourcePreview = Pick<
  ResourceDocument,
  '_id' | 'name' | 'type' | 'pinned'
> & {
  empty?: boolean;
};

export const getResourceChildren = async (
  folderPath: string | undefined,
  userId: PrimaryId
): Promise<ResourcePreview[]> => {
  const path = decodeURIComponent(folderPath || 'my-files');

  const folder = await findFolder(path, userId);

  appAssert(folder, NOT_FOUND, 'Folder not found');

  const children = await ResourceModel.find({
    parent: folder._id,
    userId,
    deleted: false,
  });

  if (children.length === 0) return [];

  const folderIds = children
    .filter((child) => child.type === ResourceType.Folder)
    .map((f) => f._id);

  const childCountMap = folderIds.length
    ? await buildChildCountMap(folderIds, userId)
    : new Map<string, number>();

  const formattedChildren = children.map((child) =>
    formatChild(child as ResourceDocument, childCountMap)
  );

  return sortChildrenForDisplay(formattedChildren, path);
};

async function findFolder(path: string, userId: PrimaryId) {
  return ResourceModel.findOne({
    path,
    type: ResourceType.Folder,
    userId,
    deleted: false,
  });
}

async function buildChildCountMap(folderIds: PrimaryId[], userId: PrimaryId) {
  if (!folderIds || folderIds.length === 0) return new Map<string, number>();

  const childCounts = await ResourceModel.aggregate([
    { $match: { parent: { $in: folderIds }, userId, deleted: false } },
    { $group: { _id: '$parent', count: { $sum: 1 } } },
  ]);

  return new Map(
    childCounts.map((item: any) => [item._id.toString(), item.count])
  );
}

function formatChild(
  child: ResourceDocument,
  childCountMap: Map<string, number>
): ResourcePreview {
  const isFolder = child.type === ResourceType.Folder;
  const empty = isFolder
    ? !childCountMap.get((child._id as PrimaryId).toString())
    : undefined;

  return {
    _id: child._id,
    name: child.name,
    type: child.type,
    empty,
    pinned: child.pinned,
  };
}

/**
 * Sort children for UI display:
 * - If on root ('my-files'), place the folder named 'lost+found' first
 * - Then all other folders
 * - Then files
 */
function sortChildrenForDisplay(children: ResourcePreview[], path: string) {
  const isRoot = path === 'my-files';

  // Find the special 'lost+found' folder (only relevant at root)
  const lostFound = isRoot
    ? children.find(
        (c) => c.type === ResourceType.Folder && c.name === 'lost+found'
      )
    : undefined;

  // Collect all folders except the special one
  const folders = children.filter(
    (c) => c.type === ResourceType.Folder && c !== lostFound
  );

  // Collect non-folder children (files)
  const files = children.filter((c) => c.type !== ResourceType.Folder);

  // Compose final ordering
  return lostFound ? [lostFound, ...folders, ...files] : [...folders, ...files];
}
