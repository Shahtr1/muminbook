import catchErrors from '../utils/catchErrors';
import { OK } from '../constants/http';
import SurahModel from '../models/reading/surah.model';

export const getSurahHandler = catchErrors(async (req, res) => {
  const surahs = await SurahModel.find().sort({ uuid: 1 });
  return res.status(OK).json(surahs);
});
