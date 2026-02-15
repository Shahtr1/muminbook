import { z } from 'zod';
import { nameSchema } from './common.schema.js';

export const resourceSchema = z.object({
  name: nameSchema,
  type: z.enum(['file', 'folder'], {
    message: "Type must be 'file' or 'folder'",
  }),
  path: z.string(),
  fileUrl: z.string().url('Invalid file URL').optional(),
  contentType: z.string().optional(),
});

export const dstPathSchema = z.object({
  destinationPath: z.string().min(1, 'Destination path is required'),
});
