import { useQuery } from '@tanstack/react-query';
import { isMyFilesEmpty } from '@/services/index.js';

export const useIsMyFilesEmpty = () => {
  const { data, ...rest } = useQuery({
    queryKey: ['isMyFilesEmpty'],
    queryFn: isMyFilesEmpty,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
  });

  return { emptyMyFiles: data ?? false, ...rest };
};
