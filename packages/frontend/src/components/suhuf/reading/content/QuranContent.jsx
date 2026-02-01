import React, { Fragment, useMemo } from 'react';
import {
  Box,
  useBreakpointValue,
  useColorModeValue,
  useTheme,
} from '@chakra-ui/react';
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

  const theme = useTheme();

  const lineHeight = useBreakpointValue({
    base: theme.space['ayat-base-height'],
    md: theme.space['ayat-md-height'],
  });

  const ruleColor = useColorModeValue(
    'rgba(0,0,0,0.15)',
    'rgba(255,255,255,0.15)'
  );

  return (
    <Box
      dir="rtl"
      fontFamily="ArabicFont"
      textAlign="right"
      lineHeight={lineHeight}
      fontSize={{ base: '32px', md: '35px' }}
      wordSpacing="3px"
      sx={{
        backgroundImage: `
      repeating-linear-gradient(
        to bottom,
        transparent 0px,
        transparent ${parseInt(lineHeight) - 1}px,
        ${ruleColor} ${parseInt(lineHeight) - 1}px,
        ${ruleColor} ${lineHeight}
      )
    `,
      }}
    >
      {data.map((ayah) => (
        <Fragment key={ayah._id}>
          {ayah.surahStart && surahMap[ayah.surahId] && (
            <SurahHeader name={surahMap[ayah.surahId].name} />
          )}
          <Ayah ayah={ayah.content.text} ayahNumber={ayah.ayahNumber} />
        </Fragment>
      ))}
    </Box>
  );
};
