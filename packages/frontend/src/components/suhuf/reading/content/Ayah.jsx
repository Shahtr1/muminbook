import { Box, useColorModeValue } from '@chakra-ui/react';
import React from 'react';
import { toArabicNumeral } from '@/utils/toArabicNumeral.js';

export const Ayah = ({ text, ayahNumber, block }) => {
  const svgImage = useColorModeValue(
    '/images/frames/ayat-dark.svg',
    '/images/frames/ayat-light.svg'
  );

  const hoverGray = useColorModeValue(
    'wn.icon.hover.light',
    'wn.icon.hover.dark'
  );

  return (
    <Box as={block ? 'div' : 'span'} textAlign={block ? 'center' : 'unset'}>
      <Box as="span" px={1} _hover={{ bg: hoverGray }} cursor="pointer">
        {text}&nbsp;
      </Box>
      {ayahNumber && (
        <Box
          width={{ base: '28px', md: '36px' }}
          height={{ base: '28px', md: '36px' }}
          display="inline-block"
          backgroundImage={`url(${svgImage})`}
          backgroundSize="contain"
          backgroundRepeat="no-repeat"
          backgroundPosition="center"
          transform="translateY(8px)"
          position="relative"
        >
          <Box
            as="span"
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -58%)"
            fontSize={{ base: '20px', md: '24px' }}
          >
            {toArabicNumeral(ayahNumber)}
          </Box>
        </Box>
      )}
    </Box>
  );
};
