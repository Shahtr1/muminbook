import catchErrors from "../utils/catchErrors";
import { CREATED, NOT_FOUND, OK } from "../constants/http";
import { assertUserAndSession } from "../utils/assertUserRoleSession";
import { getUserId } from "../utils/getUserId";
import z from "zod";
import { createSuhuf } from "../services/suhuf/create-suhuf.service";
import mongoose from "mongoose";
import SuhufModel from "../models/suhuf.model";
import appAssert from "../utils/appAssert";

export const createSuhufSchema = z.object({
  title: z.string().min(1).max(100).optional(),
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
