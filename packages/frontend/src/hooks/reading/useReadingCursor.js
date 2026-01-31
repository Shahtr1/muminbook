import { useQuery } from '@tanstack/react-query';
import { getReading } from '@/services/index.js';

export const useReadingCursor = ({
  fileId,
  divisionType,
  uuid, // anchor mode
  afterUuid, // forward cursor
  beforeUuid, // backward cursor
  limit = 30,
}) => {
  const query = useQuery({
    queryKey: [
      'reading',
      fileId,
      divisionType,
      uuid,
      afterUuid,
      beforeUuid,
      limit,
    ],
    queryFn: () =>
      getReading(fileId, {
        divisionType,
        uuid,
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
