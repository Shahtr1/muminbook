import { useQuery } from '@tanstack/react-query';
import { getResources } from '@/services/index.js';

const RESOURCES = 'resources';

export const useResources = (path = 'my-files') => {
  const { data = [], ...rest } = useQuery({
    queryKey: [RESOURCES, path],
    queryFn: () => getResources(path),
    enabled: Boolean(path),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
  });

  return { resources: data, ...rest };
};
