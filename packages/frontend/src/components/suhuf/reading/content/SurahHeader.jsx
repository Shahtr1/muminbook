import { Box, Image, useColorModeValue } from '@chakra-ui/react';
import React from 'react';

export const SurahHeader = ({ name }) => {
  const surahHeaderFrame = useColorModeValue(
    '/images/frames/surah-dark.png',
    '/images/frames/surah-light.png'
  );
  if (!name) {
    console.error('No surah name passed to SurahHeader component');
    return;
  }
  return (
    <Box position="relative" textAlign="center">
      <Image
        src={surahHeaderFrame}
        alt="Surah Header Frame"
        mx="auto"
        maxW="230px"
        maxH="60px"
      />
      {name && (
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -55%)"
        >
          {name}
        </Box>
      )}
    </Box>
  );
};
