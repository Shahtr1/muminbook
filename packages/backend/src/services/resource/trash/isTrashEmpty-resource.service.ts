import { PrimaryId } from '../../../constants/ids.js';
import ResourceModel from '../../../models/resource.model.js';

export const isTrashEmpty = async (userId: PrimaryId) => {
  const trash = await ResourceModel.findOne({
    userId,
    deleted: true,
  });

  return { empty: !trash };
};
