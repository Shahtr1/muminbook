import { useQuery } from '@tanstack/react-query';
import { getQuranStructure } from '@/services/quran/quran-structure.service.js';

export const useQuranStructure = () => {
  const { data = [], ...rest } = useQuery({
    queryKey: ['quran-structure'],
    queryFn: getQuranStructure,
    staleTime: Infinity,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
  });

  return { quranStructure: data, ...rest };
};
