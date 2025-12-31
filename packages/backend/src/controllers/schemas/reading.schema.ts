import z from 'zod';
import QuranDivisionType from '../../constants/types/quran/quranDivisionType';

export const getReadingQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => parseInt(val || '1', 10))
    .refine((val) => !isNaN(val) && val >= 1, {
      message: 'Page must be a number greater than or equal to 1',
    }),
  startType: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val ||
        Object.values(QuranDivisionType).includes(val as QuranDivisionType),
      {
        message: `startType must be one of: ${Object.values(QuranDivisionType).join(', ')}`,
      }
    )
    .transform((val) => (val as QuranDivisionType) || QuranDivisionType.Surah),
  startValue: z.string().optional(),
  after: z.string().optional(),
  before: z.string().optional(),
  limit: z
    .string()
    .optional()
    .transform((val) => parseInt(val || '20', 10))
    .refine((val) => !isNaN(val) && val >= 1 && val <= 100, {
      message: 'Limit must be a number between 1 and 100',
    }),
});
