import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { getReading, getReadings } from '@/services/index.js';
import { useMemo } from 'react';
import QuranDivisionType from '@/constants/QuranDivisionType.js';

export const useReadings = () => {
  const { data = [], ...rest } = useQuery({
    queryKey: ['readings'],
    queryFn: getReadings,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: Infinity,
  });

  return { readings: data, ...rest };
};
