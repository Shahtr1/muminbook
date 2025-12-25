import { Router } from 'express';
import { getSurahHandler } from '../controllers/surah.controller';

const surahRoutes = Router();

// prefix surahs
surahRoutes.get('/', getSurahHandler);

export default surahRoutes;
