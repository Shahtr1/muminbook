import catchErrors from '../utils/catchErrors.js';
import { CREATED, NOT_FOUND, OK } from '../constants/http.js';
import { getUserId } from '../utils/getUserId.js';
import { createSuhuf } from '../services/suhuf/create-suhuf.service.js';
import mongoose from 'mongoose';
import SuhufModel from '../models/suhuf.model.js';
import appAssert from '../utils/appAssert.js';
import { renameSuhuf } from '../services/suhuf/rename-suhuf.service.js';
import { suhufConfigSchema } from '../schemas/suhuf-config.schema.js';
import { createSuhufSchema, titleSchema } from '../schemas/suhuf.schema.js';

export const createSuhufHandler = catchErrors(async (req, res) => {
  const userId = await getUserId(req);

  const parsed = createSuhufSchema.parse(req.body);

  const { suhuf, window } = await createSuhuf({
    userId,
    title: parsed.title,
  });

  return res.status(CREATED).json({
    suhufId: suhuf._id,
    windowId: window._id,
  });
});

export const getSuhufHandler = catchErrors(async (req, res) => {
  const userId = await getUserId(req);

  const { id } = req.params;

  const suhufId = new mongoose.Types.ObjectId(id);

  const suhuf = await SuhufModel.findOne({ _id: suhufId, userId });

  appAssert(suhuf, NOT_FOUND, 'Suhuf not found');

  return res.status(OK).json(suhuf);
});

export const renameSuhufHandler = catchErrors(async (req, res) => {
  const userId = await getUserId(req);
  const { title } = titleSchema.parse(req.body);

  const { id } = req.params;

  const { message } = await renameSuhuf(id, userId, title as string);

  return res.status(OK).json({ message });
});

export const configSuhufHandler = catchErrors(async (req, res) => {
  const userId = await getUserId(req);
  const { id } = req.params;

  const { layout, panels } = suhufConfigSchema.parse(req.body);

  const update: any = {};

  // Merge layout fields instead of replacing entire object
  if (layout) {
    Object.entries(layout).forEach(([key, value]) => {
      update[`config.layout.${key}`] = value;
    });
  }

  if (panels) {
    update['config.panels'] = panels;
  }

  const updated = await SuhufModel.findOneAndUpdate(
    { _id: id, userId },
    { $set: update },
    { new: true }
  );

  appAssert(updated, NOT_FOUND, 'Suhuf not found');

  return res.status(OK).json(updated);
});
