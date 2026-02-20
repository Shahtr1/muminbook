import { mode } from '@chakra-ui/theme-tools';

const modalTheme = {
  baseStyle: (props) => ({
    overlay: {
      bg: mode('blackAlpha.400', 'blackAlpha.700')(props),
      backdropFilter: 'blur(2px)',
    },

    dialog: {
      borderRadius: 'sm',
      bg: mode('white', 'gray.800')(props), // match Input bg
      border: '1px solid',
      borderColor: mode('gray.300', 'whiteAlpha.500')(props), // match Input border
      boxShadow: 'lg',
    },

    header: {
      fontWeight: '600',
      color: mode('text.primary', 'whiteAlpha.900')(props),
      borderBottom: '1px solid',
      borderColor: mode('gray.300', 'whiteAlpha.500')(props),
    },

    body: {
      color: mode('text.primary', 'whiteAlpha.900')(props),
    },

    footer: {
      borderTop: '1px solid',
      borderColor: mode('gray.300', 'whiteAlpha.500')(props),
    },

    closeButton: {
      color: mode('text.secondary', 'whiteAlpha.700')(props),
      _hover: {
        bg: mode('gray.100', 'whiteAlpha.200')(props),
      },
    },
  }),

  defaultProps: {
    size: 'md',
    motionPreset: 'scale',
    isCentered: true,
  },
};

export default modalTheme;
