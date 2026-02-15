import z from 'zod';
import QuranDivisionType from '../constants/types/quran/quranDivisionType.js';
import QuranCategoryType from '../constants/types/quran/quranCategoryType.js';

export const readingSchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(100).default(40),

    category: z.nativeEnum(QuranCategoryType).optional(),

    divisionType: z.nativeEnum(QuranDivisionType).optional(),

    // Anchor for Surah/Juz/etc
    divisionNumber: z.coerce.number().int().optional(),

    // Forward cursor
    afterUuid: z.coerce.number().int().optional(),

    // Backward cursor
    beforeUuid: z.coerce.number().int().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.divisionNumber !== undefined && !data.divisionType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'divisionType is required when divisionNumber is provided',
        path: ['divisionType'],
      });
    }

    if (data.afterUuid !== undefined && data.beforeUuid !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Cannot use afterUuid and beforeUuid together',
        path: ['afterUuid'],
      });
    }

    if (
      data.divisionNumber !== undefined &&
      (data.afterUuid !== undefined || data.beforeUuid !== undefined)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Cannot use divisionNumber together with afterUuid/beforeUuid',
        path: ['divisionNumber'],
      });
    }
  });

export type ReadingQuery = z.infer<typeof readingSchema>;
