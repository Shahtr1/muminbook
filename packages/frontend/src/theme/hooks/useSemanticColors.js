import { useColorMode } from '@chakra-ui/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useSemanticColors = () => {
  const { colorMode } = useColorMode();
  const queryClient = useQueryClient();

  const isDark = colorMode === 'dark';

  const { data: isWin = false } = useQuery({
    queryKey: ['windowMode'],
    queryFn: () => queryClient.getQueryData(['windowMode']) ?? false,
    initialData: () => queryClient.getQueryData(['windowMode']) ?? false,
    staleTime: Infinity,
  });

  /* =====================================
     THEME MATRICES (mode × light/dark)
  ====================================== */

  const defaultTheme = {
    light: {
      surface: {
        base: 'gray.50',
        content: 'white',
      },
      icon: {
        default: 'gray.700',
        hover: 'gray.200',
      },
    },
    dark: {
      surface: {
        base: 'gray.900',
        content: 'gray.800',
      },
      icon: {
        default: 'gray.300',
        hover: 'gray.600',
      },
    },
  };

  const winTheme = {
    light: {
      surface: {
        base: 'wn.bg.light',
        content: 'wn.bg_content.light',
      },
      icon: {
        default: 'wn.icon.light',
        hover: 'wn.icon.hover.light',
      },
    },
    dark: {
      surface: {
        base: 'wn.bg.dark',
        content: 'wn.bg_content.dark',
      },
      icon: {
        default: 'wn.icon.dark',
        hover: 'wn.icon.hover.dark',
      },
    },
  };

  const activeTheme = isWin ? winTheme : defaultTheme;
  const themeVariant = activeTheme[isDark ? 'dark' : 'light'];

  /* =====================================
     SEMANTIC GROUPS
  ====================================== */

  const surface = {
    ...themeVariant.surface,
    elevated: isDark ? 'gray.800' : 'white',
    subtle: isDark ? 'gray.700' : 'gray.100',
    gutter: isDark ? 'wn.gutter.dark' : 'wn.gutter.light',
  };

  const text = {
    primary: isDark ? 'whiteAlpha.900' : 'text.primary',
    secondary: 'text.secondary',
    disabled: isDark ? 'text.disabled' : 'text.secondary',
    contrast: isDark ? 'text.primary' : 'white',
  };

  const icon = {
    ...themeVariant.icon,
    muted: isDark ? 'gray.400' : 'gray.600',
    active: isDark ? 'wn.bold.dark' : 'wn.bold.light',
    invertedActive: isDark ? 'wn.bold.light' : 'wn.bold.dark',
  };

  const border = {
    default: isDark ? 'whiteAlpha.500' : 'gray.300',
    subtle: isDark ? 'whiteAlpha.300' : 'gray.300',
    light: isDark ? 'whiteAlpha.300' : 'gray.200',
    error: isDark ? 'red.300' : 'red.500',
  };

  const state = {
    hoverSurface: isDark ? 'gray.700' : 'gray.100',
    active: isDark ? 'active.dark' : 'active.light',
    default: isDark ? 'default.dark' : 'default.light',
  };

  const overlay = {
    subtle: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    strong: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
  };

  const brand = {
    primary: isDark ? 'brand.300' : 'brand.500',
    hover: isDark ? 'brand.600' : 'brand.400',
    solid: 'brand.500',
  };

  return {
    surface,
    text,
    icon,
    border,
    state,
    overlay,
    brand,
    isWin,
  };
};
