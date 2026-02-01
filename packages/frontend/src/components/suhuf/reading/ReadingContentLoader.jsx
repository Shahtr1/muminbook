import React, { useState, useEffect, useRef } from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';

import { useReadingCursor } from '@/hooks/reading/useReadingCursor.js';
import { Loader } from '@/components/layout/Loader.jsx';
import { SomethingWentWrong } from '@/components/layout/SomethingWentWrong.jsx';

export const ReadingContentLoader = ({
  source,
  divisionType,
  category,
  render,
}) => {
  const [divisionNumber, setDivisionNumber] = useState(1);
  const [afterUuid, setAfterUuid] = useState(undefined);
  const [beforeUuid, setBeforeUuid] = useState(undefined);

  const contentRef = useRef(null);

  const bgColor = useColorModeValue('wn.bg.light', 'wn.bg.dark');
  const iconHoverGray = useColorModeValue(
    'wn.icon.hover.light',
    'wn.icon.hover.dark'
  );
  const borderColor = useColorModeValue('gray.300', 'whiteAlpha.500');

  // Reset when file changes
  useEffect(() => {
    setDivisionNumber(1); // your default anchor
    setAfterUuid(undefined);
    setBeforeUuid(undefined);
  }, [source]);

  const {
    data,
    isPending,
    isFetching,
    isError,
    hasNext,
    hasPrevious,
    nextCursor,
    prevCursor,
  } = useReadingCursor({
    source,
    divisionType,
    divisionNumber: afterUuid || beforeUuid ? undefined : divisionNumber,
    category,
    afterUuid,
    beforeUuid,
    limit: 40,
  });

  // Scroll to top when data changes
  useEffect(() => {
    if (!isFetching && contentRef.current?.parentElement) {
      contentRef.current.parentElement.scrollTop = 0;
    }
  }, [data, isFetching]);

  if (isPending) return <Loader />;
  if (isError) return <SomethingWentWrong />;

  const items = data?.data || [];

  const handleNext = () => {
    if (!nextCursor) return;
    setAfterUuid(nextCursor);
    setBeforeUuid(undefined);
  };

  const handlePrevious = () => {
    if (!prevCursor) return;
    setBeforeUuid(prevCursor);
    setAfterUuid(undefined);
  };

  return (
    <>
      {hasPrevious && (
        <Box
          h="25px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          cursor="pointer"
          opacity={isFetching ? 0.6 : 1}
          pointerEvents={isFetching ? 'none' : 'auto'}
          onClick={handlePrevious}
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

      {hasNext && (
        <Box
          h="25px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          cursor="pointer"
          opacity={isFetching ? 0.6 : 1}
          pointerEvents={isFetching ? 'none' : 'auto'}
          onClick={handleNext}
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
