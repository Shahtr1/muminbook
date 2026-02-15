import catchErrors from '../utils/catchErrors.js';
import { OK } from '../constants/http.js';
import ReadingModel from '../models/reading/reading.model.js';
import { getReading } from '../services/reading/get-reading.service.js';
import { readingSchema } from '../schemas/reading.schema.js';
import { getQuranStructureCounts } from '../services/reading/get-reading-structure.service.js';

export const getAllReadingsHandler = catchErrors(async (req, res) => {
  const readings = await ReadingModel.find().sort({ order: 1 });
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
  return res.status(OK).json(counts);
});
