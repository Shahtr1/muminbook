import { PrimaryId } from '../../constants/ids';
import ResourceModel from '../../models/resource.model';
import ResourceType from '../../constants/types/resourceType';
import appAssert from '../../utils/appAssert';
import { NOT_FOUND } from '../../constants/http';

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
