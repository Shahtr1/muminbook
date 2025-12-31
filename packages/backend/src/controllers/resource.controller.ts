import catchErrors from '../utils/catchErrors';
import { CREATED, OK } from '../constants/http';
import { assertUserAndSession } from '../utils/assertUserRoleSession';
import ResourceType from '../constants/enums_types/resourceType';
import {
  copyResource,
  createResource,
  deleteResource,
  getResourceChildren,
  getTrashedResources,
  moveResource,
  moveToTrashResource,
  permanentlyDeleteTrashedResources,
  renameResource,
  restoreAllResources,
  restoreResource,
} from '../services/resource';
import mongoose from 'mongoose';
import { getUserId } from '../utils/getUserId';
import { isMyFilesEmpty } from '../services/resource/isMyFilesEmpty-resource.service';
import {
  getOverview,
  togglePinResource,
  updateAccessedAt,
} from '../services/resource/overview.service';
import { isTrashEmpty } from '../services/resource/trash/isTrashEmpty-resource.service';
import { dstPathSchema, resourceSchema } from './schemas/resource.schema';
import { renameSchema } from './schemas/common.schema';

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

  return res.status(OK).json({ message: 'Deleted successfully' });
});

export const moveToTrashResourceHandler = catchErrors(async (req, res) => {
  assertUserAndSession(req);

  const resourceId = new mongoose.Types.ObjectId(req.params.id);

  const userId = await getUserId(req);

  await moveToTrashResource(resourceId, userId);

  return res.status(OK).json({ message: 'Moved to trash successfully' });
});

export const restoreResourceHandler = catchErrors(async (req, res) => {
  assertUserAndSession(req);
  const userId = await getUserId(req);

  const resourceId = new mongoose.Types.ObjectId(req.params.id);
  const { message } = await restoreResource(resourceId, userId);

  return res.status(OK).json({ message });
});

export const restoreAllResourceHandler = catchErrors(async (req, res) => {
  assertUserAndSession(req);
  const userId = await getUserId(req);

  const { message } = await restoreAllResources(userId);
  return res.status(OK).json({ message });
});

export const getTrashedResourcesHandler = catchErrors(async (req, res) => {
  assertUserAndSession(req);
  const userId = await getUserId(req);

  const trashed = await getTrashedResources(userId);

  return res.status(OK).json(trashed);
});

export const emptyTrashHandler = catchErrors(async (req, res) => {
  assertUserAndSession(req);
  const userId = await getUserId(req);

  await permanentlyDeleteTrashedResources(userId);

  return res.status(OK).json({ message: 'Trash emptied successfully' });
});

export const renameResourceHandler = catchErrors(async (req, res) => {
  assertUserAndSession(req);
  const userId = await getUserId(req);
  const resourceId = new mongoose.Types.ObjectId(req.params.id);

  const { name } = renameSchema.parse(req.body);
  const response = await renameResource(resourceId, name, userId);

  return res.status(OK).json(response);
});

export const moveResourceHandler = catchErrors(async (req, res) => {
  assertUserAndSession(req);
  const userId = await getUserId(req);
  const resourceId = new mongoose.Types.ObjectId(req.params.id);
  const { destinationPath } = dstPathSchema.parse(req.body);

  const result = await moveResource(resourceId, destinationPath, userId);
  return res.status(OK).json(result);
});

export const copyResourceHandler = catchErrors(async (req, res) => {
  assertUserAndSession(req);

  const userId = await getUserId(req);
  const resourceId = new mongoose.Types.ObjectId(req.params.id);
  const { destinationPath } = dstPathSchema.parse(req.body);

  const result = await copyResource(resourceId, destinationPath, userId);

  return res.status(OK).json(result);
});

export const isMyFilesEmptyHandler = catchErrors(async (req, res) => {
  assertUserAndSession(req);

  const userId = await getUserId(req);

  const { empty } = await isMyFilesEmpty(userId);

  return res.status(OK).json(empty);
});

export const getOverviewHandler = catchErrors(async (req, res) => {
  assertUserAndSession(req);

  const userId = await getUserId(req);

  const overview = await getOverview(userId);

  return res.status(OK).json(overview);
});
export const togglePinResourceHandler = catchErrors(async (req, res) => {
  assertUserAndSession(req);
  const userId = await getUserId(req);
  const { id } = req.params;

  const result = await togglePinResource(userId, id);
  return res.status(OK).json(result);
});

export const updateAccessedAtHandler = catchErrors(async (req, res) => {
  assertUserAndSession(req);
  const userId = await getUserId(req);
  const { id } = req.params;

  const result = await updateAccessedAt(userId, id);

  return res.status(OK).json(result);
});

export const isTrashEmptyHandler = catchErrors(async (req, res) => {
  assertUserAndSession(req);

  const userId = await getUserId(req);

  const { empty } = await isTrashEmpty(userId);

  return res.status(OK).json(empty);
});
