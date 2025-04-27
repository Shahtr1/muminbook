import catchErrors from "../utils/catchErrors";
import { assertUserAndSession } from "../utils/assertUserRoleSession";
import { OK } from "../constants/http";
import ReadingModel from "../models/reading.model";

export const getReadingsHandler = catchErrors(async (req, res) => {
  assertUserAndSession(req);
  const readings = await ReadingModel.find();
  return res.status(OK).json(readings);
});
