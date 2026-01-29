import { z } from 'zod';

const forbiddenChars = /[\/\\:*?"<>|]/;

export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .refine((val) => val.trim() === val, {
    message: 'Name must not have leading or trailing spaces',
  })
  .refine((val) => !forbiddenChars.test(val), {
    message: 'Name contains invalid characters: / \\ : * ? " < > |',
  });

export const renameSchema = z.object({
  name: nameSchema,
});
