import React from 'react';
import { Box } from '@chakra-ui/react';

export const Quran = ({ data }) => {
  return (
    <Box
      fontFamily="ArabicFont"
      textAlign="right"
      lineHeight="1.8"
      fontSize="35px"
    >
      {data.map((ayah) => (
        <span key={ayah._id}>{ayah.ayah} </span>
      ))}
    </Box>
  );
};
