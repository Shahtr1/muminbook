import catchErrors from '../utils/catchErrors';
import { assertUserAndSession } from '../utils/assertUserRoleSession';
import { NOT_FOUND, OK } from '../constants/http';
import ReadingModel from '../models/reading.model';
import { getReading } from '../services/reading/get-reading.service';
import appAssert from '../utils/appAssert';
import { readingSchema } from './schemas/reading.schema';

export const getAllReadingsHandler = catchErrors(async (req, res) => {
  assertUserAndSession(req);
  const readings = await ReadingModel.find();
  return res.status(OK).json(readings);
});

export const getReadingHandler = catchErrors(async (req, res) => {
  assertUserAndSession(req);

  const { id } = req.params;

  appAssert(id, NOT_FOUND, 'Missing reading ID in params');

  const query = readingSchema.parse(req.query);
  const result = await getReading(id, query);
  return res.status(OK).json(result);
});
