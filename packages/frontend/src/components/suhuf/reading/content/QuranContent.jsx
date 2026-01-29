import React from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';

export const QuranContent = ({ data }) => {
  const ruleColor = useColorModeValue(
    'rgba(0,0,0,0.15)',
    'rgba(255,255,255,0.15)'
  );

  return (
    <Box
      fontFamily="ArabicFont"
      textAlign="right"
      lineHeight="60px"
      fontSize="35px"
      wordSpacing="3px"
      position="relative"
      backgroundImage={`repeating-linear-gradient(
        to bottom,
        transparent 0px,
        transparent 59px,
        ${ruleColor} 59px,
        ${ruleColor} 60px
      )`}
    >
      {data.map((ayah) => (
        <Box as="span" key={ayah._id}>
          {/*don't remove empty space after ayah below*/}
          {ayah.ayah}{' '}
        </Box>
      ))}
    </Box>
  );
};
