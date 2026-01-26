import React from 'react';
import { Box, Flex, useBreakpointValue } from '@chakra-ui/react';
import { useSurahs } from '@/hooks/quran/useSurahs.js';
import { useCachedQueryIfPresent } from '@/hooks/useCachedQueryIfPresent.js';
import { useJuz } from '@/hooks/quran/useJuz.js';
import { RdWrapperUI } from '@/components/suhuf/reading/RdWrapperUI.jsx';
import { useReadingInfinite } from '@/hooks/reading/useReadings.js';
import { Loader } from '@/components/layout/Loader.jsx';
import { SomethingWentWrong } from '@/components/layout/SomethingWentWrong.jsx';

export const QuranUI = ({ fileId, direction }) => {
  const {
    data: surahs,
    isPending: isSurahsPending,
    isError: isSurahsError,
  } = useCachedQueryIfPresent(['surahs'], useSurahs);

  const {
    data: juzList,
    isPending: isJuzListPending,
    isError: isJuzListError,
  } = useCachedQueryIfPresent(['juzList'], useJuz);

  const startValue = 114;

  const {
    data,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
    isPending: isReadingPending,
    isError: isReadingError,
  } = useReadingInfinite({
    fileId: 'quran',
    startType: 'surah',
    startValue: startValue,
    limit: 150,
  });

  if (isReadingPending || isSurahsPending || isJuzListPending)
    return <Loader />;
  if (isReadingError || isSurahsError || isJuzListError)
    return <SomethingWentWrong />;

  return (
    <Box
      fontFamily="ArabicFont"
      whiteSpace="normal"
      wordBreak="break-word"
      textAlign="right"
    ></Box>
  );
};
