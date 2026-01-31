import { PrimaryId } from '../../constants/ids';
import ResourceModel from '../../models/resource.model';
import appAssert from '../../utils/appAssert';
import { NOT_FOUND } from '../../constants/http';
import ResourceType from '../../constants/types/resourceType';
import { thirtyDaysAgo } from '../../utils/date';
import {
  assertNotRootFolder,
  findDescendantsByPath,
} from './common-resource.service';

export const deleteResource = async (
  resourceId: PrimaryId,
  userId: PrimaryId
) => {
  const resource = await ResourceModel.findOne({ _id: resourceId, userId });
  appAssert(resource, NOT_FOUND, 'Resource not found');

  assertNotRootFolder(resource);

  if (resource.type === ResourceType.Folder) {
    const descendants = await findDescendantsByPath(resource.path, userId);

    await ResourceModel.bulkWrite([
      ...descendants.map((child) => ({
        deleteOne: { filter: { _id: child._id } },
      })),
      { deleteOne: { filter: { _id: resource._id } } },
    ]);
  } else {
    await ResourceModel.deleteOne({ _id: resource._id });
  }
};

export const permanentlyDeleteTrashedResources = async (userId: PrimaryId) => {
  const trashed = await ResourceModel.find({ userId, deleted: true });

  const deletes = trashed.map((r) => ({
    deleteOne: { filter: { _id: r._id } },
  }));

  await ResourceModel.bulkWrite(deletes);
};

export const permanentlyDeleteTrashedResourcesForJob =
  async (): Promise<number> => {
    const trashed = await ResourceModel.find({
      deleted: true,
      deletedAt: { $lte: thirtyDaysAgo() },
    });

    const deletes = trashed.map((r) => ({
      deleteOne: { filter: { _id: r._id } },
    }));

    await ResourceModel.bulkWrite(deletes);

    return trashed.length;
  };
