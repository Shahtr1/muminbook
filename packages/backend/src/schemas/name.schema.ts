import { z } from 'zod';
import { sanitizeName } from '../utils/sanitizeName.js';

const allowedCharsRegex = /^[A-Za-z0-9 _-]+$/;

export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name exceeds maximum length')
  .transform((val) => sanitizeName(val))
  .refine((val) => val.length > 0, {
    message: 'Name is required',
  })
  .refine((val) => allowedCharsRegex.test(val), {
    message:
      'Only letters, numbers, spaces, hyphen (-), and underscore (_) are allowed',
  })
  .refine((val) => /[A-Za-z0-9]/.test(val), {
    message: 'Name must contain at least one letter or number',
  });

export const renameSchema = z.object({
  name: nameSchema,
});
