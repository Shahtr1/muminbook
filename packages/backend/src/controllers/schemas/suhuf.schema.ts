import { z } from 'zod';
import { nameSchema } from './common.schema';

export const createSuhufSchema = z.object({
  title: z.string().min(1).max(100).optional(),
});

export const titleSchema = z.object({
  title: nameSchema,
});
