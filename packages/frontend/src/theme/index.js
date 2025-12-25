import { extendTheme } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';
import buttonTheme from '@/theme/buttonTheme.js';
import linkTheme from '@/theme/linkTheme.js';
import inputTheme from '@/theme/inputTheme.js';
import selectTheme from '@/theme/selectTheme.js';
import radioTheme from '@/theme/radioTheme.js';
import checkboxTheme from '@/theme/checkboxTheme.js';
import textTheme from '@/theme/textTheme.js';
import colors from '@/theme/colors.js';
import formLabelTheme from '@/theme/formLabelTheme.js';
import alertTheme from '@/theme/alertTheme.js';
import spacings from '@/theme/spacings.js';
import menuItemTheme from '@/theme/menuItemTheme.js';
import skeletonTheme from '@/theme/skeletonTheme.js';
import { tooltipTheme } from '@/theme/tooltipTheme.js';

const config = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

const styles = {
  global: (props) => ({
    body: {
      color: mode('black', 'whiteAlpha.900')(props),
      bg: mode('bg.light', 'bg.dark')(props),
      fontFamily: "'Nunito Sans', sans-serif",
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
    },
    'body::-webkit-scrollbar, *::-webkit-scrollbar': {
      display: 'none',
    },
    '@font-face': [
      {
        fontFamily: 'ArabicFont',
        src: "url('/fonts/al_mushaf-font.ttf') format('truetype')",
        fontWeight: 'normal',
        fontStyle: 'normal',
      },
    ],
  }),
};

const components = {
  Alert: alertTheme,
  Link: linkTheme,
  Button: buttonTheme,
  Input: inputTheme,
  Select: selectTheme,
  Radio: radioTheme,
  Checkbox: checkboxTheme,
  Text: textTheme,
  FormLabel: formLabelTheme,
  Menu: menuItemTheme,
  Skeleton: skeletonTheme,
  Tooltip: tooltipTheme,
};

const theme = extendTheme({
  config,
  styles,
  colors,
  components,
  ...spacings,
});

export default theme;
