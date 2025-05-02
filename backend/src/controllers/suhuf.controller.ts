import catchErrors from "../utils/catchErrors";
import { CREATED, NOT_FOUND, OK } from "../constants/http";
import { assertUserAndSession } from "../utils/assertUserRoleSession";
import { getUserId } from "../utils/getUserId";
import z from "zod";
import { createSuhuf } from "../services/suhuf/create-suhuf.service";
import mongoose from "mongoose";
import SuhufModel from "../models/suhuf.model";
import appAssert from "../utils/appAssert";
import { renameSuhuf } from "../services/suhuf/rename-suhuf.service";
import { nameSchema } from "./schemas/common.schema";
import { layoutSchema } from "./schemas/layout.schema";

export const createSuhufSchema = z.object({
  title: z.string().min(1).max(100).optional(),
});

export const titleSchema = z.object({
  title: nameSchema,
});

export const createSuhufHandler = catchErrors(async (req, res) => {
  assertUserAndSession(req);
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
  assertUserAndSession(req);
  const userId = await getUserId(req);
  const suhufId = new mongoose.Types.ObjectId(req.params.id);

  const suhuf = await SuhufModel.findOne({ _id: suhufId, userId });

  appAssert(suhuf, NOT_FOUND, "Suhuf not found");

  return res.status(OK).json(suhuf);
});

export const renameSuhufHandler = catchErrors(async (req, res) => {
  assertUserAndSession(req);
  const userId = await getUserId(req);
  const { title } = titleSchema.parse(req.body);
  const suhufId = req.params.id;
  const { message } = await renameSuhuf(suhufId, userId, title);

  return res.status(OK).json({ message });
});

export const layoutSuhufHandler = catchErrors(async (req, res) => {
  assertUserAndSession(req);
  const userId = await getUserId(req);
  const suhufId = req.params.id;

  const { layout } = layoutSchema.parse(req.body);

  const updated = await SuhufModel.findOneAndUpdate(
    { _id: suhufId, userId },
    { $set: { "config.layout": layout } },
    { new: true },
  );

  appAssert(updated, NOT_FOUND, "Suhuf not found");

  return res.status(OK).json(updated);
});
