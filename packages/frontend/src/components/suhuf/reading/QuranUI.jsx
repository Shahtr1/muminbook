import React from 'react';
import { Box } from '@chakra-ui/react';
import { useReadingInfinite } from '@/hooks/reading/useReadings.js';
import { Loader } from '@/components/layout/Loader.jsx';
import { SomethingWentWrong } from '@/components/layout/SomethingWentWrong.jsx';

export const QuranUI = () => {
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

  if (isReadingPending) return <Loader />;
  if (isReadingError) return <SomethingWentWrong />;

  return (
    <Box
      fontFamily="ArabicFont"
      whiteSpace="normal"
      wordBreak="break-word"
      textAlign="right"
    ></Box>
  );
};
