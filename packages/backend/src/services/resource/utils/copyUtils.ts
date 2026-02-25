import ResourceModel, {
  ResourceDocument,
} from '../../../models/resource.model.js';
import { PrimaryId } from '../../../constants/ids.js';

const cloneResource = (
  resource: ResourceDocument,
  overrides: Partial<ResourceDocument>
): Partial<ResourceDocument> => {
  const { _id, createdAt, updatedAt, ...rest } = resource.toObject();
  return { ...rest, ...overrides };
};

export const generateCopyName = async (
  resourceName: string,
  destinationPath: string,
  userId: PrimaryId
): Promise<string> => {
  const MAX_NAME_LENGTH = 100;
  const originalPath = `${destinationPath}/${resourceName}`.replace(/\/+/g, '/');
  const hasOriginalConflict = await ResourceModel.findOne({
    path: originalPath,
    userId,
    deleted: false,
  });

  if (!hasOriginalConflict) {
    return resourceName;
  }

  let counter = 1;

  const buildCandidate = (baseName: string, index: number) => {
    const suffix = ` (${index})`;
    const maxBaseLength = Math.max(1, MAX_NAME_LENGTH - suffix.length);
    const truncated = baseName.slice(0, maxBaseLength).trimEnd();
    return `${truncated}${suffix}`;
  };

  while (true) {
    const copyName = buildCandidate(resourceName, counter);
    const conflict = await ResourceModel.findOne({
      path: `${destinationPath}/${copyName}`.replace(/\/+/g, '/'),
      userId,
      deleted: false,
    });

    if (!conflict) {
      return copyName;
    }

    counter++;
  }
};

export const buildClonedRootResource = (
  resource: ResourceDocument,
  copyName: string,
  baseNewPath: string,
  destinationParentId: PrimaryId,
  userId: PrimaryId
) => {
  const newId = new ResourceModel()._id;
  const cloned = cloneResource(resource, {
    _id: newId,
    userId,
    name: copyName,
    path: baseNewPath,
    parent: destinationParentId,
  });
  return { newId, op: { insertOne: { document: cloned } } };
};

export const buildClonedDescendants = (
  descendants: ResourceDocument[],
  originalRootPath: string,
  baseNewPath: string,
  userId: PrimaryId,
  destinationParentId: PrimaryId,
  rootNewId: PrimaryId
) => {
  const ops: any[] = [];

  if (descendants.length === 0) {
    return ops;
  }

  const idMap = new Map<string, PrimaryId>();
  idMap.set(descendants[0].parent?.toString() || '', rootNewId);

  for (const desc of descendants) {
    const relativePath = desc.path.replace(originalRootPath, '');
    const newPath = `${baseNewPath}${relativePath}`.replace(/\/+/g, '/');
    const newId = new ResourceModel()._id as PrimaryId;
    idMap.set((desc._id as PrimaryId).toString(), newId);

    const newParentId =
      idMap.get(desc.parent?.toString() || '') || destinationParentId;

    const cloned = cloneResource(desc, {
      _id: newId,
      userId,
      path: newPath,
      parent: newParentId,
    });

    ops.push({ insertOne: { document: cloned } });
  }

  return ops;
};
