import { useMemo } from 'react';

/**
 * Adjust brightness
 */
const adjustColor = (hex, amount) => {
  const num = parseInt(hex.replace('#', ''), 16);

  let r = (num >> 16) + amount;
  let g = ((num >> 8) & 0xff) + amount;
  let b = (num & 0xff) + amount;

  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));

  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
};

/**
 * Mix color with gray (for dark mode softness)
 */
const addGray = (hex, amount = 20) => {
  const num = parseInt(hex.replace('#', ''), 16);

  let r = num >> 16;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;

  // move channels toward average (desaturate)
  const avg = (r + g + b) / 3;

  r += (avg - r) * (amount / 100);
  g += (avg - g) * (amount / 100);
  b += (avg - b) * (amount / 100);

  return `#${((Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b))
    .toString(16)
    .padStart(6, '0')}`;
};

export const useColorShades = (color, isDark) => {
  return useMemo(() => {
    if (!color) return null;

    const lightAmount = isDark ? 30 : 220;
    const darkAmount = isDark ? -40 : -25;

    let light = adjustColor(color, lightAmount);

    // make light tone slightly greyish in dark mode
    if (isDark) {
      light = addGray(light, 50);
    }

    return {
      light,
      base: color,
      dark: adjustColor(color, darkAmount),
    };
  }, [color, isDark]);
};
