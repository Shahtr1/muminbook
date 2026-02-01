import { z } from 'zod';
import FileType from '../constants/types/fileType';
import Direction from '../constants/types/direction';
import SuhufSidebar from '../constants/types/suhufSidebar';
import QuranDivisionType from '../constants/types/quran/quranDivisionType';

export const readingLayoutSchema = z.object({
  direction: z.nativeEnum(Direction),
  sidebar: z.nativeEnum(SuhufSidebar),
  sidebarOpen: z.boolean().optional(),
});

export const divisionSchema = z.object({
  divisionType: z.nativeEnum(QuranDivisionType),
  divisionNumber: z.number().min(1),
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
  source: z.string().min(1).optional(),
  fileType: z.nativeEnum(FileType),
  scrollPosition: z.number().min(0).optional(),
  active: z.boolean(),
  direction: z.nativeEnum(Direction),
  division: divisionSchema.optional(),
});

export const suhufConfigSchema = z.object({
  panels: z.array(panelSchema).optional(),
  layout: layoutSchema.shape.layout.optional(),
});
