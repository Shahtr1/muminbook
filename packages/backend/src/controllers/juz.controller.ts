import catchErrors from '../utils/catchErrors.js';
import { OK } from '../constants/http.js';
import JuzModel from '../models/reading/juz.model.js';

export const getJuzHandler = catchErrors(async (req, res) => {
  const juz = await JuzModel.find().sort({ uuid: 1 });
  return res.status(OK).json(juz);
});
