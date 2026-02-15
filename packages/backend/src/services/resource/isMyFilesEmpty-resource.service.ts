import { PrimaryId } from '../../constants/ids.js';
import ResourceModel from '../../models/resource.model.js';
import ResourceType from '../../constants/types/resourceType.js';
import appAssert from '../../utils/appAssert.js';
import { NOT_FOUND } from '../../constants/http.js';

export const isMyFilesEmpty = async (userId: PrimaryId) => {
  const myFilesFolder = await ResourceModel.findOne({
    path: 'my-files',
    type: ResourceType.Folder,
    userId,
    deleted: false,
  });

  appAssert(myFilesFolder, NOT_FOUND, 'MyFiles folder not found');

  const hasChildren = await ResourceModel.exists({
    parent: myFilesFolder._id,
    userId,
    deleted: false,
  });

  return { empty: !hasChildren };
};
