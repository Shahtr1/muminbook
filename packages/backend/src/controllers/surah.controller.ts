import catchErrors from '../utils/catchErrors.js';
import { OK } from '../constants/http.js';
import SurahModel from '../models/reading/surah.model.js';

export const getSurahHandler = catchErrors(async (req, res) => {
  const surahs = await SurahModel.find().sort({ uuid: 1 });
  return res.status(OK).json(surahs);
});
