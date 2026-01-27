import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { getReading, getReadings } from '@/services/index.js';
import { useMemo } from 'react';
import QuranDivisionType from '@/constants/QuranDivisionType.js';

export const useReadingPage = ({
  uuid,
  divisionType,
  position,
  page,
  limit = 30,
}) => {
  return useQuery({
    queryKey: ['reading', uuid, divisionType, position, page, limit],
    queryFn: () =>
      getReading(uuid, {
        divisionType,
        position,
        page,
        limit,
      }),
    keepPreviousData: true,
    staleTime: Infinity,
  });
};
