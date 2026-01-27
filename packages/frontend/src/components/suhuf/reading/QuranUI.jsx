import React from 'react';
import { Box } from '@chakra-ui/react';
import { useReadingInfinite } from '@/hooks/reading/useReadings.js';
import { Loader } from '@/components/layout/Loader.jsx';
import { SomethingWentWrong } from '@/components/layout/SomethingWentWrong.jsx';
import QuranDivisionType from '@/constants/QuranDivisionType.js';

export const QuranUI = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isError,
  } = useReadingInfinite({
    uuid: 'quran',
    divisionType: QuranDivisionType.Surah,
    position: 1,
    limit: 30,
  });

  if (isPending) return <Loader />;
  if (isError) return <SomethingWentWrong />;

  return (
    <Box
      fontFamily="ArabicFont"
      whiteSpace="normal"
      wordBreak="break-word"
      textAlign="right"
    >
      {data?.pages.map((page) =>
        page.data.map((dt) => <Box key={dt._id}>{dt.ayah}</Box>)
      )}

      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? 'Loading...' : 'Load More'}
        </button>
      )}
    </Box>
  );
};
