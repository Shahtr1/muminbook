import { Box, Image, useColorModeValue, useTheme } from '@chakra-ui/react';
import React from 'react';

export const SurahHeader = ({ name }) => {
  const theme = useTheme();

  const minHeightBase = theme.space['ayat-base-height'];
  const minHeightMd = theme.space['ayat-md-height'];
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
        maxW={{ base: '210px', md: '230px' }}
        minH={{ base: minHeightBase, md: minHeightMd }}
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
