import catchErrors from "../utils/catchErrors";
import { CREATED, OK } from "../constants/http";
import { assertUserAndSession } from "../utils/assertUserRoleSession";
import ResourceType from "../constants/resourceType";
import {
  createResource,
  deleteResource,
  getResourceChildren,
  moveToTrashResource,
} from "../services/resource.service";
import { resourceSchema } from "./resourceSchema";
import mongoose from "mongoose";
import { getUserId } from "../utils/getUserId";

export const getResourceHandler = catchErrors(async (req, res) => {
  assertUserAndSession(req);

  const userId = await getUserId(req);

  const folderPath = req.query.path as string;

  const children = await getResourceChildren(folderPath, userId);

  return res.status(OK).json(children);
});

export const createResourceHandler = catchErrors(async (req, res) => {
  assertUserAndSession(req);

  const userId = await getUserId(req);

  const parsed = resourceSchema.parse(req.body);

  const resourceInput = {
    ...parsed,
    type: parsed.type as ResourceType,
  };

  const response = await createResource(resourceInput, userId);

  return res.status(CREATED).json(response);
});

export const deleteResourceHandler = catchErrors(async (req, res) => {
  assertUserAndSession(req);

  const resourceId = new mongoose.Types.ObjectId(req.params.id);

  const userId = await getUserId(req);

  await deleteResource(resourceId, userId);

  return res.status(OK).json({ message: "Deleted successfully" });
});

export const moveToTrashResourceHandler = catchErrors(async (req, res) => {
  assertUserAndSession(req);

  const resourceId = new mongoose.Types.ObjectId(req.params.id);

  const userId = await getUserId(req);

  await moveToTrashResource(resourceId, userId);

  return res.status(OK).json({ message: "Moved to trash successfully" });
});
