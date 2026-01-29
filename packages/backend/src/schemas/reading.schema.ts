import z from 'zod';
import QuranDivisionType from '../constants/types/quran/quranDivisionType';

export const readingSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(30),
  page: z.coerce.number().min(1).default(1),
  divisionType: z.nativeEnum(QuranDivisionType),
  position: z.coerce.number().optional(),
});
