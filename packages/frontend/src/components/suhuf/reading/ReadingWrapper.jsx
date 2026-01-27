import { useReadingPage } from '@/hooks/reading/useReadingPage.js';
import { Loader } from '@/components/layout/Loader.jsx';
import { SomethingWentWrong } from '@/components/layout/SomethingWentWrong.jsx';
import React, { useState } from 'react';
import { Box } from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';

export const ReadingWrapper = ({ uuid, divisionType, render }) => {
  const [page, setPage] = useState(1);
  const { data, isPending, isError } = useReadingPage({
    uuid,
    divisionType,
    page,
    position: 1,
    limit: 30,
  });

  if (isPending) return <Loader />;
  if (isError) return <SomethingWentWrong />;

  return (
    <>
      <Box
        width="100%"
        height={10}
        onClick={() => setPage((p) => Math.max(1, p - 1))}
      >
        <ChevronUpIcon fontSize="20px" />
      </Box>

      {render(data.data)}

      <Box width="100%" height={10} onClick={() => setPage((p) => p + 1)}>
        <ChevronDownIcon fontSize="20px" />
      </Box>
    </>
  );
};
