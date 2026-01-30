import { Box, useColorModeValue } from '@chakra-ui/react';
import { toArabicNumeral } from '@/utils/toArabicNumeral.js';
import React from 'react';

export const Ayah = ({ item }) => {
  const svgImage = useColorModeValue(
    '/images/frames/ayat-dark.svg',
    '/images/frames/ayat-light.svg'
  );

  const hoverGray = useColorModeValue(
    'wn.icon.hover.light',
    'wn.icon.hover.dark'
  );

  return (
    <Box as="span">
      <Box as="span" px={1} _hover={{ bg: hoverGray }} cursor="pointer">
        {item.ayah}&nbsp;
      </Box>
      <Box
        as="span"
        display="inline-block"
        width="36px"
        height="36px"
        mx={2}
        position="relative"
        verticalAlign="middle"
      >
        {/* Background layer */}
        <Box
          position="absolute"
          inset="0"
          backgroundImage={`url(${svgImage})`}
          backgroundSize="contain"
          backgroundRepeat="no-repeat"
          backgroundPosition="center"
          transform="translateY(-4px)"
        />

        {/* Number layer */}
        <Box
          position="relative"
          zIndex={1}
          display="flex"
          alignItems="center"
          justifyContent="center"
          width="100%"
          height="100%"
          fontSize="20px"
          transform="translateY(-6px)"
        >
          {toArabicNumeral(item.sno)}
        </Box>
      </Box>
    </Box>
  );
};
