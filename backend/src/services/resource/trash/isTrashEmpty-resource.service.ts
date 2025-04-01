import { PrimaryId } from "../../../constants/primaryId";
import ResourceModel from "../../../models/resource.model";

export const isTrashEmpty = async (userId: PrimaryId) => {
  const trash = await ResourceModel.findOne({
    userId,
    deleted: true,
  });

  return { empty: !trash };
};
