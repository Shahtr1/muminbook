const whiteAlpha700 = 'rgba(255, 255, 255, 0.7)';
const primaryText = '#343637';
const secondaryText = '#797C82';
const disabledText = '#A2A5AC';

const colors = {
  brand: {
    50: '#e3fdfc',
    100: '#c1f7f4',
    200: '#97ede6',
    300: '#6ae2d9',
    400: '#44d7cc',
    500: '#27A69F', // Main primary color
    600: '#1e857f',
    700: '#166561',
    800: '#0e4443',
    900: '#072423',
  },
  secondary: {
    50: '#ffe8d9',
    100: '#ffd0b3',
    200: '#ffb98c',
    300: '#ffa166',
    400: '#f47827', // Main secondary color
    500: '#dc5f0f',
    600: '#b84c0c',
    700: '#94380a',
    800: '#702607',
    900: '#4c1705',
  },
  text: {
    primary: primaryText,
    secondary: secondaryText,
    disabled: disabledText,
  },
  active: {
    light: primaryText,
    dark: '#fff',
  },
  default: {
    light: secondaryText,
    dark: whiteAlpha700,
  },
  wn: {
    bg: {
      dark: '#181818',
      light: '#e5e5e5',
    },
    bg_content: {
      dark: '#1f1f1f',
      light: '#ffffff',
    },
    gutter: {
      dark: '#3f3f3f',
      light: '#d6d6d6',
    },
    icon: {
      dark: '#868686',
      light: '#616161',
      hover: {
        dark: '#3b3b3b',
        light: '#d7d6d6',
      },
    },
    content: {
      dark: '#d7d7d7',
      light: '#616161',
    },
    bold: {
      dark: '#d7d7d7',
      light: '#1f1f1f',
    },
  },
  bg: {
    dark: '#11151c',
    light: '#f4f2ee',
  },
  node: '#008040',
};

export default colors;
