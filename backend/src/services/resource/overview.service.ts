import { PrimaryId } from "../../constants/primaryId";
import ResourceModel from "../../models/resource.model";
import ResourceType from "../../constants/enums/resourceType";
import appAssert from "../../utils/appAssert";
import { BAD_REQUEST, NOT_FOUND } from "../../constants/http";
import { fiveMinutes } from "../../utils/date";

export const getOverview = async (userId: PrimaryId) => {
  const pinned = await ResourceModel.find({
    userId,
    type: ResourceType.Folder,
    pinned: true,
    deleted: false,
  }).lean();

  const quickAccess = await ResourceModel.find({
    userId,
    type: ResourceType.Folder,
    deleted: false,
    accessedAt: { $exists: true },
    pinned: false,
  })
    .sort({ accessedAt: -1 })
    .limit(5)
    .lean();

  // Sort pinned so "my-files" is always first
  const sortedPinned = pinned.sort((a, b) => {
    if (a.path === "my-files") return -1;
    if (b.path === "my-files") return 1;
    return 0;
  });

  return {
    pinned: sortedPinned,
    quickAccess,
  };
};

export const togglePinResource = async (
  userId: PrimaryId,
  resourceId: string,
) => {
  const resource = await ResourceModel.findOne({
    _id: resourceId,
    userId,
    type: ResourceType.Folder,
    deleted: false,
  });

  appAssert(resource, NOT_FOUND, "Folder not found");

  appAssert(
    resource.path !== "my-files",
    BAD_REQUEST,
    "Cannot modify pin state of My Files",
  );

  resource.pinned = !resource.pinned;
  await resource.save();

  return {
    message: resource.pinned ? "Pinned successfully" : "Unpinned successfully",
    pinned: resource.pinned,
  };
};

export const updateAccessedAt = async (
  userId: PrimaryId,
  resourceId: string,
) => {
  const resource = await ResourceModel.findOne({
    _id: resourceId,
    userId,
    deleted: false,
  });

  appAssert(resource, NOT_FOUND, "Resource not found");

  const now = Date.now();
  const lastAccess = resource.accessedAt?.getTime() || 0;

  if (now - lastAccess > fiveMinutes()) {
    resource.accessedAt = new Date();
    await resource.save();
    return { message: "Access time updated" };
  }

  return { message: "Access already updated recently" };
};
