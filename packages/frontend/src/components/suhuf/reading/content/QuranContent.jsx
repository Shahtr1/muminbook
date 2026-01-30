import React, { Fragment, useMemo } from 'react';
import { Box, Image, useColorModeValue } from '@chakra-ui/react';
import { Ayah } from '@/components/suhuf/reading/content/Ayah.jsx';
import { SurahHeader } from '@/components/suhuf/reading/content/SurahHeader.jsx';
import { useSuhufWorkspaceContext } from '@/context/SuhufWorkspaceContext.jsx';

export const QuranContent = ({ data }) => {
  const { surahs } = useSuhufWorkspaceContext();

  const surahMap = useMemo(() => {
    return (
      surahs?.reduce((acc, surah) => {
        acc[surah._id] = surah;
        return acc;
      }, {}) || {}
    );
  }, [surahs]);

  const ruleColor = useColorModeValue(
    'rgba(0,0,0,0.15)',
    'rgba(255,255,255,0.15)'
  );

  return (
    <Box
      dir="rtl"
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
      {/* Ayahs */}
      {data.map((ayah) => (
        <Fragment key={ayah._id}>
          {ayah.surahStart && surahMap[ayah.surahId] && (
            <SurahHeader name={surahMap[ayah.surahId].name} />
          )}
          <Ayah item={ayah} />
        </Fragment>
      ))}
    </Box>
  );
};
