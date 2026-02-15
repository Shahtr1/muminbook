import { Router } from 'express';
import {
  getAllReadingsHandler,
  getReadingHandler,
  getQuranStructureHandler,
} from '../controllers/reading.controller.js';

const readingRoutes = Router();

// prefix readings
readingRoutes.get('/', getAllReadingsHandler);
readingRoutes.get('/quran-structure', getQuranStructureHandler);
readingRoutes.get('/:source', getReadingHandler);

export default readingRoutes;
