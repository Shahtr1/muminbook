import { cssVar, defineStyle, defineStyleConfig } from '@chakra-ui/react';

const $startColor = cssVar('skeleton-start-color');
const $endColor = cssVar('skeleton-end-color');

const defaultVariant = defineStyle({
  borderRadius: 'sm',
  _light: {
    [$startColor.variable]: 'colors.gray.300',
    [$endColor.variable]: 'colors.gray.100',
  },
  _dark: {
    [$startColor.variable]: 'colors.gray.700',
    [$endColor.variable]: 'colors.gray.500',
  },
});

const skeletonTheme = defineStyleConfig({
  variants: {
    subtle: defaultVariant,
  },
  defaultProps: {
    variant: 'subtle',
  },
});

export default skeletonTheme;
