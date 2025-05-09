import catchErrors from "../utils/catchErrors";
import { assertUserAndSession } from "../utils/assertUserRoleSession";
import { OK } from "../constants/http";
import SurahModel from "../models/surah.model";

export const getSurahHandler = catchErrors(async (req, res) => {
  assertUserAndSession(req);
  const surahs = await SurahModel.find().sort({ uuid: 1 });
  return res.status(OK).json(surahs);
});
