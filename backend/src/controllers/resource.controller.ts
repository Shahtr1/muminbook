import catchErrors from "../utils/catchErrors";
import UserModel from "../models/user.model";
import appAssert from "../utils/appAssert";
import { CREATED, NOT_FOUND, OK } from "../constants/http";
import { assertUserAndSession } from "../utils/assertUserRoleSession";
import ResourceType from "../constants/resourceType";
import ResourceModel from "../models/resource.model";
import { createResource } from "../services/resource.service";
import { resourceSchema } from "./resourceSchema";
import mongoose from "mongoose";

export const getResourceHandler = catchErrors(async (req, res) => {
  assertUserAndSession(req);

  const user = await UserModel.findById(req.userId);
  appAssert(user, NOT_FOUND, "User not found");

  const userId = user._id;

  const folderPath = (req.query.path as string) || "my-files";

  const folder = await ResourceModel.findOne({
    path: folderPath,
    type: ResourceType.Folder,
    userId: userId,
  });

  appAssert(folder, NOT_FOUND, "Folder not found");

  const children = await ResourceModel.find({
    parent: folder._id,
    userId: userId,
  });

  const response = children.map((child) => ({
    _id: child._id,
    name: child.name,
    type: child.type,
  }));

  return res.status(OK).json(response);
});

export const createResourceHandler = catchErrors(async (req, res) => {
  assertUserAndSession(req);

  const user = await UserModel.findById(req.userId);
  appAssert(user, NOT_FOUND, "User not found");

  const userId = user._id as mongoose.Types.ObjectId;

  const parsed = resourceSchema.parse(req.body);

  const resourceInput = {
    ...parsed,
    type: parsed.type as ResourceType,
  };

  const response = await createResource(resourceInput, userId);

  return res.status(CREATED).json(response);
});
