import z from "zod";

export const getReadingQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => parseInt(val || "1", 10))
    .refine((val) => !isNaN(val) && val >= 1, {
      message: "Page must be a number greater than or equal to 1",
    }),
});
