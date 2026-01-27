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

export const useReadingInfinite = ({
  uuid,
  divisionType,
  position,
  limit = 30,
}) => {
  const queryKey = useMemo(() => {
    return ['reading', uuid, divisionType, position, limit];
  }, [uuid, divisionType, position, limit]);

  return useInfiniteQuery({
    queryKey,

    queryFn: async ({ pageParam = 1 }) => {
      return await getReading(uuid, {
        divisionType,
        position,
        limit,
        page: pageParam,
      });
    },

    initialPageParam: 1,

    getNextPageParam: (lastPage) => {
      if (lastPage.hasNextPage) {
        return lastPage.page + 1;
      }
      return undefined;
    },

    getPreviousPageParam: (firstPage) => {
      if (firstPage.hasPreviousPage) {
        return firstPage.page - 1;
      }
      return undefined;
    },

    staleTime: Infinity,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
  });
};
