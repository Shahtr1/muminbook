import { useQuery } from '@tanstack/react-query';
import { getReading } from '@/services/index.js';

export const useReadingCursor = ({
  source,
  divisionType,
  divisionNumber, // Anchor for Surah/Juz/etc
  category,
  afterUuid, // forward cursor
  beforeUuid, // backward cursor
  limit = 40,
}) => {
  const query = useQuery({
    queryKey: [
      'reading',
      source,
      divisionType,
      divisionNumber,
      category,
      afterUuid,
      beforeUuid,
      limit,
    ],
    queryFn: () =>
      getReading(source, {
        divisionType,
        divisionNumber,
        category,
        afterUuid,
        beforeUuid,
        limit,
      }),
    placeholderData: (prev) => prev,
    staleTime: Infinity,
  });

  const hasNext = !!query.data?.hasNext;
  const hasPrevious = !!query.data?.hasPrevious;

  const nextCursor = query.data?.nextCursor ?? null;
  const prevCursor = query.data?.prevCursor ?? null;

  return {
    ...query,
    hasNext,
    hasPrevious,
    nextCursor,
    prevCursor,
  };
};
