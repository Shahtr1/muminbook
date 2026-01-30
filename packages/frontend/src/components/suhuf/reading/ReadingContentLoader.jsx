import React, { useState, useEffect, useRef } from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';

import { useReadingPage } from '@/hooks/reading/useReadingPage.js';
import { Loader } from '@/components/layout/Loader.jsx';
import { SomethingWentWrong } from '@/components/layout/SomethingWentWrong.jsx';

export const ReadingContentLoader = ({ uuid, divisionType, render }) => {
  const [page, setPage] = useState(1);
  const contentRef = useRef(null);

  const bgColor = useColorModeValue('wn.bg.light', 'wn.bg.dark');

  const iconHoverGray = useColorModeValue(
    'wn.icon.hover.light',
    'wn.icon.hover.dark'
  );

  const borderColor = useColorModeValue('gray.300', 'whiteAlpha.500');

  // Reset page when reading changes
  useEffect(() => {
    setPage(1);
  }, [uuid, divisionType]);

  const { data, isPending, isFetching, isError, hasPreviousPage, hasNextPage } =
    useReadingPage({
      uuid,
      divisionType,
      page,
      position: 1,
      limit: 30,
    });

  useEffect(() => {
    if (!isFetching && contentRef.current?.parentElement) {
      contentRef.current.parentElement.scrollTop = 0;
    }
  }, [data, isFetching]);

  if (isPending) return <Loader />;
  if (isError) return <SomethingWentWrong />;

  const items = data?.data || [];

  return (
    <>
      {hasPreviousPage && (
        <Box
          h="25px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          cursor="pointer"
          opacity={isFetching ? 0.6 : 1}
          pointerEvents={isFetching ? 'none' : 'auto'}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          bgColor={bgColor}
          _hover={{ bg: iconHoverGray }}
          border="1px solid"
          borderColor={borderColor}
        >
          <ChevronUpIcon fontSize="20px" />
        </Box>
      )}

      <Box flex={1} ref={contentRef}>
        {render(items)}
      </Box>

      {hasNextPage && (
        <Box
          h="25px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          cursor="pointer"
          opacity={isFetching ? 0.6 : 1}
          pointerEvents={isFetching ? 'none' : 'auto'}
          onClick={() => setPage((p) => p + 1)}
          bgColor={bgColor}
          _hover={{ bg: iconHoverGray }}
          border="1px solid"
          borderColor={borderColor}
        >
          <ChevronDownIcon fontSize="20px" />
        </Box>
      )}
    </>
  );
};
