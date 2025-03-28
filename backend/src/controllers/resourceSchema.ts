import { z } from "zod";

const forbiddenChars = /[\/\\:*?"<>|]/;

export const nameSchema = z
  .string()
  .refine((val) => val.trim() === val, {
    message: "Name must not have leading or trailing spaces",
  })
  .refine((val) => !forbiddenChars.test(val), {
    message: 'Name contains invalid characters: / \\ : * ? " < > |',
  });

export const resourceSchema = z.object({
  name: nameSchema,
  type: z.enum(["file", "folder"], {
    message: "Type must be 'file' or 'folder'",
  }),
  path: z.string(),
  fileUrl: z.string().url("Invalid file URL").optional(),
  contentType: z.string().optional(),
});

export const renameSchema = z.object({
  name: nameSchema,
});

export const dstPathSchema = z.object({
  destinationPath: z.string().min(1, "Destination path is required"),
});
