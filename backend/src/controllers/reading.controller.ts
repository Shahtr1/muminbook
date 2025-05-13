import catchErrors from "../utils/catchErrors";
import { assertUserAndSession } from "../utils/assertUserRoleSession";
import { OK } from "../constants/http";
import ReadingModel from "../models/reading.model";
import { getReading } from "../services/reading/get-reading.service";
import { getReadingQuerySchema } from "./schemas/reading.schema";

export const getAllReadingsHandler = catchErrors(async (req, res) => {
  assertUserAndSession(req);
  const readings = await ReadingModel.find();
  return res.status(OK).json(readings);
});

export const getReadingHandler = catchErrors(async (req, res) => {
  assertUserAndSession(req);

  const { page } = getReadingQuerySchema.parse(req.query);
  const result = await getReading(req.params.id, page);

  return res.status(OK).json(result);
});
