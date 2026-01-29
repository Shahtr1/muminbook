import { z } from 'zod';

export const emailSchema = z.string().email().min(1).max(255);
const passwordSchema = z.string().min(6).max(255);

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  userAgent: z.string().optional(),
});

export const registerSchema = loginSchema
  .extend({
    confirmPassword: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters long' })
      .max(255, { message: 'Password cannot exceed 255 characters' }),

    firstname: z
      .string()
      .min(2, { message: 'First name must be at least 2 characters long' })
      .max(50, { message: 'First name cannot exceed 50 characters' }),

    lastname: z
      .string()
      .min(2, { message: 'Last name must be at least 2 characters long' })
      .max(50, { message: 'Last name cannot exceed 50 characters' }),

    dateOfBirth: z
      .number()
      .refine((val) => !isNaN(new Date(val).getTime()), {
        message: 'Invalid date. Must be a valid timestamp.',
      })
      .transform((val) => new Date(val)),

    gender: z.enum(['female', 'male'], {
      message: "Gender must be 'Male' or 'Female'",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const verificationCodeSchema = z.string().min(1).max(24);

export const resetPasswordSchema = z.object({
  password: passwordSchema,
  verificationCode: verificationCodeSchema,
});
