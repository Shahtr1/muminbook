import { PrimaryId } from "../../../constants/primaryId";
import ResourceModel from "../../../models/resource.model";

export const getTrashedResources = async (userId: PrimaryId) => {
  const resources = await ResourceModel.find({
    userId,
    deleted: true,
  }).sort({ deletedAt: -1 });

  return resources.map((r: any) => ({
    _id: r._id,
    name: r.name,
    type: r.type,
    path: r.path,
    deletedAt: r.deletedAt,
  }));
};
