import { Router } from 'express';
import { getJuzHandler } from '../controllers/juz.controller.js';

const juzRoutes = Router();

// prefix juz
juzRoutes.get('/', getJuzHandler);

export default juzRoutes;
