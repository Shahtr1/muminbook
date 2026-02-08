import React, { Fragment, useMemo } from 'react';
import { Box, useBreakpointValue, useTheme } from '@chakra-ui/react';
import { Ayah } from '@/components/suhuf/reading/content/Ayah.jsx';
import { SurahHeader } from '@/components/suhuf/reading/content/SurahHeader.jsx';
import { useSuhufWorkspaceContext } from '@/context/SuhufWorkspaceContext.jsx';
import { useSemanticColors } from '@/theme/hooks/useSemanticColors.js';

export const QuranContent = ({ data }) => {
  const { overlay } = useSemanticColors();
  const { surahs } = useSuhufWorkspaceContext();

  const bismalah = 'بِّسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';

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

  const ruleColor = overlay.strong;

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
            <>
              <SurahHeader name={surahMap[ayah.surahId].name} />
              {ayah.uuid !== 1 &&
                ayah.uuid !== 9 && ( // skip bismalah for Al-Fatiha and At-Tawbah
                  <Ayah text={bismalah} block={true} />
                )}
            </>
          )}
          <Ayah
            text={ayah.content.text}
            ayahNumber={ayah.ayahNumber}
            block={ayah.surahStart && ayah.uuid === 1} // block if it's the first ayah of a surah
          />
        </Fragment>
      ))}
    </Box>
  );
};
