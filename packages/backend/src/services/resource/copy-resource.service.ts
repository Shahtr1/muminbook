import { PrimaryId } from '../../constants/primaryId';
import ResourceModel from '../../models/resource.model';
import appAssert from '../../utils/appAssert';
import { BAD_REQUEST, NOT_FOUND } from '../../constants/http';
import ResourceType from '../../constants/types/resourceType';
import {
  buildClonedDescendants,
  buildClonedRootResource,
  generateCopyName,
} from './helpers/copyHelpers';
import {
  assertNotRootFolder,
  findDescendantsByPath,
} from './common-resource.service';

export const copyResource = async (
  resourceId: PrimaryId,
  destinationPath: string,
  userId: PrimaryId
) => {
  destinationPath = decodeURIComponent(destinationPath);
  const resource = await ResourceModel.findOne({ _id: resourceId, userId });
  appAssert(resource, NOT_FOUND, 'Resource not found');
  assertNotRootFolder(resource, 'Cannot copy root folder');

  const destinationFolder = await ResourceModel.findOne({
    path: destinationPath,
    type: ResourceType.Folder,
    userId,
    deleted: false,
  });
  appAssert(destinationFolder, NOT_FOUND, 'Destination folder not found');

  // Define and normalize both paths before comparison
  const sourcePath = resource.path.replace(/\/+$/, ''); // remove trailing slash
  const destPath = destinationPath.replace(/\/+$/, '');

  appAssert(
    !(
      resource.type === ResourceType.Folder &&
      (destPath === sourcePath || destPath.startsWith(sourcePath + '/'))
    ),
    BAD_REQUEST,
    'Cannot copy a folder into itself or its subfolders.'
  );

  const copyName = await generateCopyName(
    resource.name,
    destinationPath,
    userId
  );
  const baseNewPath = `${destinationPath}/${copyName}`.replace(/\/+/g, '/');

  const ops: any[] = [];

  const { newId: rootNewId, op: rootInsertOp } = buildClonedRootResource(
    resource,
    copyName,
    baseNewPath,
    destinationFolder._id as PrimaryId,
    userId
  );
  ops.push(rootInsertOp);

  if (resource.type === ResourceType.Folder) {
    const descendants = await findDescendantsByPath(
      resource.path,
      userId,
      false
    );
    if (descendants.length > 0) {
      const descendantOps = buildClonedDescendants(
        descendants,
        resource.path,
        baseNewPath,
        userId,
        destinationFolder._id as PrimaryId,
        rootNewId as PrimaryId
      );
      ops.push(...descendantOps);
    }
  }

  await ResourceModel.bulkWrite(ops);
  return { message: 'Copied successfully' };
};
