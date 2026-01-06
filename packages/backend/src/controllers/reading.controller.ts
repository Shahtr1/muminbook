import catchErrors from '../utils/catchErrors';
import { NOT_FOUND, OK } from '../constants/http';
import ReadingModel from '../models/reading.model';
import { getReading } from '../services/reading/get-reading.service';
import appAssert from '../utils/appAssert';
import { readingSchema } from './schemas/reading.schema';

export const getAllReadingsHandler = catchErrors(async (req, res) => {
  const readings = await ReadingModel.find();
  return res.status(OK).json(readings);
});

export const getReadingHandler = catchErrors(async (req, res) => {
  const { id } = req.params;

  const query = readingSchema.parse(req.query);
  const result = await getReading(id, query);
  return res.status(OK).json(result);
});
