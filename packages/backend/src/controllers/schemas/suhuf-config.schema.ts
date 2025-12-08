import { z } from 'zod';
import FileType from '../../constants/enums/fileType';
import Direction from '../../constants/enums/direction';

export const readingLayoutSchema = z.object({
  id: z.string().min(1),
  sidebar: z.string().optional(),
  sidebarOpen: z.boolean().optional(),
});

export const layoutSchema = z.object({
  layout: z.object({
    leftTab: z.string().optional(),
    isLeftTabOpen: z.boolean().optional(),
    bottomTab: z.string().optional(),
    isBottomTabOpen: z.boolean().optional(),
    isSplit: z.boolean().optional(),
    splitRatio: z.array(z.number().min(0).max(100)).length(2).optional(),
    reading: z.array(readingLayoutSchema).optional(),
  }),
});

const panelSchema = z.object({
  fileId: z.string().min(1).optional(),
  fileType: z.nativeEnum(FileType),
  scrollPosition: z.number().min(0).optional(),
  active: z.boolean(),
  direction: z.nativeEnum(Direction),
});

export const suhufConfigSchema = z.object({
  panels: z.array(panelSchema).optional(),
  layout: layoutSchema.shape.layout.optional(),
});
