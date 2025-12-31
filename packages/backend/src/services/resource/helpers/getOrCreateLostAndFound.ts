import ResourceModel from '../../../models/resource.model';
import { PrimaryId } from '../../../constants/primaryId';
import ResourceType from '../../../constants/enums_types/resourceType';
import appAssert from '../../../utils/appAssert';
import { NOT_FOUND } from '../../../constants/http';

export const getOrCreateLostAndFound = async (userId: PrimaryId) => {
  const rootFolder = await ResourceModel.findOne({
    path: 'my-files',
    type: ResourceType.Folder,
    userId,
  });

  appAssert(rootFolder, NOT_FOUND, 'Root folder not found');

  const lostAndFoundPath = 'my-files/lost+found';

  return ResourceModel.findOneAndUpdate(
    {
      path: lostAndFoundPath,
      type: ResourceType.Folder,
      userId,
    },
    {
      $setOnInsert: {
        name: 'lost+found',
        parent: rootFolder._id,
        path: lostAndFoundPath,
        type: ResourceType.Folder,
        userId,
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );
};
