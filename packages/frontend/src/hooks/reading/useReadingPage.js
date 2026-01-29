import { useQuery } from '@tanstack/react-query';
import { getReading } from '@/services/index.js';

export const useReadingPage = ({
  uuid,
  divisionType,
  position,
  page,
  limit = 30,
}) => {
  const query = useQuery({
    queryKey: ['reading', uuid, divisionType, position, page, limit],
    queryFn: () =>
      getReading(uuid, {
        divisionType,
        position,
        page,
        limit,
      }),
    placeholderData: (prev) => prev,
    staleTime: Infinity,
  });

  const hasNextPage = !!query.data?.hasNextPage;
  const hasPreviousPage = !!query.data?.hasPreviousPage;

  return {
    ...query,
    hasNextPage,
    hasPreviousPage,
  };
};
