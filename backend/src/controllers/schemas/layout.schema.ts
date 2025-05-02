import { z } from "zod";

export const layoutSchema = z.object({
  layout: z.object({
    leftTab: z.string().optional(),
    isLeftTabOpen: z.boolean().optional(),
    bottomTab: z.string().optional(),
    isBottomTabOpen: z.boolean().optional(),
    isSplit: z.boolean().optional(),
    splitRatio: z.array(z.number().min(0).max(100)).length(2).optional(),
  }),
});
