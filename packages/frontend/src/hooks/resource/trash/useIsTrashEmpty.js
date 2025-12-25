import { useQuery } from '@tanstack/react-query';
import { isTrashEmpty } from '@/services/index.js';

export const useIsTrashEmpty = () => {
  const { data, ...rest } = useQuery({
    queryKey: ['isTrashEmpty'],
    queryFn: isTrashEmpty,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return { emptyTrash: data ?? false, ...rest };
};
