import ResourceModel from '../../../models/resource.model.js';
import { PrimaryId } from '../../../constants/ids.js';
import ResourceType from '../../../constants/types/resourceType.js';
import appAssert from '../../../utils/appAssert.js';
import { NOT_FOUND } from '../../../constants/http.js';

export const findOrCreateLostAndFound = async (userId: PrimaryId) => {
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
