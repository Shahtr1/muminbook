import { useColorMode } from '@chakra-ui/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

export const useSemanticColors = () => {
  const { colorMode } = useColorMode();
  const queryClient = useQueryClient();

  const isLight = colorMode === 'light';

  const { data: isWin = false } = useQuery({
    queryKey: ['windowMode'],
    queryFn: () => queryClient.getQueryData(['windowMode']) ?? false,
    initialData: () => queryClient.getQueryData(['windowMode']) ?? false,
    staleTime: Infinity,
  });

  /* =========================================================
     MODE HELPERS
     ========================================================= */

  const pair = (light, dark) => ({ light, dark });

  const mode = (tokenPair) => (isLight ? tokenPair.light : tokenPair.dark);

  const winPair = (win, normal) => ({ win, normal });

  /* =========================================================
     TOKEN PAIRS (SOURCE OF TRUTH)
     ========================================================= */

  const tokens = {
    textPrimary: pair('text.primary', 'whiteAlpha.900'),
    textDisabled: pair('text.secondary', 'text.disabled'),
    textContrast: pair('white', 'text.primary'),

    iconActive: pair('wn.bold.light', 'wn.bold.dark'),

    borderDefault: pair('gray.300', 'whiteAlpha.500'),
    borderSubtle: pair('gray.300', 'whiteAlpha.300'),
    borderLight: pair('gray.200', 'whiteAlpha.300'),
    borderError: pair('red.500', 'red.300'),

    stateActive: pair('active.light', 'active.dark'),
    stateDefault: pair('default.light', 'default.dark'),

    gutter: pair('wn.gutter.light', 'wn.gutter.dark'),
  };

  /* =========================================================
     WIN ↔ NON-WIN PAIRS
     ========================================================= */

  const winTokens = {
    surfaceBase: winPair(
      pair('wn.bg.light', 'wn.bg.dark'),
      pair('gray.50', 'gray.900')
    ),

    surfaceContent: winPair(
      pair('wn.bg_content.light', 'wn.bg_content.dark'),
      pair('white', 'gray.800')
    ),

    iconDefault: winPair(
      pair('wn.icon.light', 'wn.icon.dark'),
      pair('gray.700', 'gray.300')
    ),

    iconHover: winPair(
      pair('wn.icon.hover.light', 'wn.icon.hover.dark'),
      pair('gray.200', 'gray.600')
    ),
  };

  /* =========================================================
     MODE INVERSION MAP (light ↔ dark)
     ========================================================= */

  const modeInverseMap = useMemo(() => {
    const map = new Map();

    Object.values(tokens).forEach(({ light, dark }) => {
      map.set(light, dark);
      map.set(dark, light);
    });

    return map;
  }, []);

  const invert = (token) => modeInverseMap.get(token) ?? token;

  /* =========================================================
     WIN INVERSION MAP (win ↔ non-win)
     ========================================================= */

  const winInverseMap = useMemo(() => {
    const map = new Map();

    Object.values(winTokens).forEach(({ win, normal }) => {
      map.set(win.light, normal.light);
      map.set(normal.light, win.light);

      map.set(win.dark, normal.dark);
      map.set(normal.dark, win.dark);
    });

    return map;
  }, []);

  const invertWin = (token) => winInverseMap.get(token) ?? token;

  /* =========================================================
     RESOLVED SEMANTIC GROUPS
     ========================================================= */

  const surface = {
    base: isWin
      ? mode(pair('wn.bg.light', 'wn.bg.dark'))
      : mode(pair('gray.50', 'gray.900')),

    content: isWin
      ? mode(pair('wn.bg_content.light', 'wn.bg_content.dark'))
      : mode(pair('white', 'gray.800')),

    elevated: mode(pair('white', 'gray.800')),
    subtle: mode(pair('gray.100', 'gray.700')),
    gutter: mode(tokens.gutter),
  };

  const text = {
    primary: mode(tokens.textPrimary),
    secondary: 'text.secondary',
    disabled: mode(tokens.textDisabled),
    contrast: mode(tokens.textContrast),
  };

  const icon = {
    default: isWin
      ? mode(pair('wn.icon.light', 'wn.icon.dark'))
      : mode(pair('gray.700', 'gray.300')),

    hover: isWin
      ? mode(pair('wn.icon.hover.light', 'wn.icon.hover.dark'))
      : mode(pair('gray.200', 'gray.600')),

    muted: mode(pair('gray.600', 'gray.400')),
    active: mode(tokens.iconActive),
  };

  const border = {
    default: mode(tokens.borderDefault),
    subtle: mode(tokens.borderSubtle),
    light: mode(tokens.borderLight),
    error: mode(tokens.borderError),
  };

  const state = {
    hoverSurface: mode(pair('gray.100', 'gray.700')),
    active: mode(tokens.stateActive),
    default: mode(tokens.stateDefault),
  };

  const overlay = {
    subtle: mode(pair('rgba(0,0,0,0.1)', 'rgba(255,255,255,0.1)')),
    strong: mode(pair('rgba(0,0,0,0.15)', 'rgba(255,255,255,0.15)')),
  };

  const brand = {
    primary: mode(pair('brand.500', 'brand.300')),
    hover: mode(pair('brand.400', 'brand.600')),
    solid: 'brand.500',
    dark: mode(pair('brand.700', 'brand.500')),
  };

  return {
    surface,
    text,
    icon,
    border,
    state,
    overlay,
    brand,

    invert, // light <-> dark
    invertWin, // win <-> non-win

    isWin,
  };
};
