import catchErrors from '../utils/catchErrors';
import { OK } from '../constants/http';
import ReadingModel from '../models/reading/reading.model';
import { getReading } from '../services/reading/get-reading.service';
import { readingSchema } from '../schemas/reading.schema';
import { getQuranStructureCounts } from '../services/reading/get-reading-structure.service';

export const getAllReadingsHandler = catchErrors(async (req, res) => {
  const readings = await ReadingModel.find();
  return res.status(OK).json(readings);
});

export const getReadingHandler = catchErrors(async (req, res) => {
  const { source } = req.params;

  const query = readingSchema.parse(req.query);

  const result = await getReading(source, query);

  return res.status(OK).json(result);
});

export const getQuranStructureHandler = catchErrors(async (_req, res) => {
  const counts = await getQuranStructureCounts();
  return res.status(OK).json({ data: counts });
});
