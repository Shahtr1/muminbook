import { z } from "zod";

const forbiddenChars = /[\/\\:*?"<>|]/;

export const resourceSchema = z.object({
  name: z
    .string()
    .refine((val) => val.trim() === val, {
      message: "Name must not have leading or trailing spaces",
    })
    .refine((val) => !forbiddenChars.test(val), {
      message: 'Name contains invalid characters: / \\ : * ? " < > |',
    }),
  type: z.enum(["file", "folder"], {
    message: "Type must be 'file' or 'folder'",
  }),
  path: z.string(),
  fileUrl: z.string().url("Invalid file URL").optional(),
  contentType: z.string().optional(),
});
