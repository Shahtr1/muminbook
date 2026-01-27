import { useQuery } from '@tanstack/react-query';
import { getOverview } from '@/services/index.js';

const Overview = 'overview';

export const useOverviewResource = () => {
  const { data = [], ...rest } = useQuery({
    queryKey: [Overview],
    queryFn: getOverview,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
  });

  return { overview: data, ...rest };
};
