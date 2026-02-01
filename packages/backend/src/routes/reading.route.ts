import { Router } from 'express';
import {
  getAllReadingsHandler,
  getReadingHandler,
} from '../controllers/reading.controller';

const readingRoutes = Router();

// prefix readings
readingRoutes.get('/', getAllReadingsHandler);
readingRoutes.get('/:source', getReadingHandler);

export default readingRoutes;
