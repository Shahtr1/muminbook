import catchErrors from '../utils/catchErrors';
import { OK } from '../constants/http';
import JuzModel from '../models/juz.model';

export const getJuzHandler = catchErrors(async (req, res) => {
  const juz = await JuzModel.find().sort({ uuid: 1 });
  return res.status(OK).json(juz);
});
