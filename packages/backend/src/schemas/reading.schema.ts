import z from 'zod';
import QuranDivisionType from '../constants/types/quran/quranDivisionType';

export const readingSchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(100).default(40),

    divisionType: z.nativeEnum(QuranDivisionType).optional(),

    // Anchor for starting a division (e.g. Surah 2)
    uuid: z.coerce.number().int().optional(),

    // Forward cursor
    afterUuid: z.coerce.number().int().optional(),

    // Backward cursor
    beforeUuid: z.coerce.number().int().optional(),
  })
  .superRefine((data, ctx) => {
    // uuid requires divisionType
    if (data.uuid !== undefined && !data.divisionType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'divisionType is required when uuid is provided',
        path: ['divisionType'],
      });
    }

    // Cannot use both cursors at the same time
    if (data.afterUuid !== undefined && data.beforeUuid !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Cannot use afterUuid and beforeUuid together',
        path: ['afterUuid'],
      });
    }

    // Anchor and cursor cannot be used together
    if (
      data.uuid !== undefined &&
      (data.afterUuid !== undefined || data.beforeUuid !== undefined)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Cannot use uuid with afterUuid/beforeUuid',
        path: ['uuid'],
      });
    }
  });

export type ReadingQuery = z.infer<typeof readingSchema>;
