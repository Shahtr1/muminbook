import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getReading, getReadings } from "@/services/index.js";

export const useReadings = () => {
  const { data = [], ...rest } = useQuery({
    queryKey: ["readings"],
    queryFn: getReadings,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: Infinity,
  });

  return { readings: data, ...rest };
};

export const useReadingDetail = (id) => {
  return useInfiniteQuery({
    queryKey: ["reading", id],
    queryFn: ({ pageParam = 1 }) => getReading(id, pageParam),
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.page + 1 : undefined;
    },
    getPreviousPageParam: (firstPage) => {
      return firstPage.hasPrevPage ? firstPage.page - 1 : undefined;
    },
    enabled: !!id,
    staleTime: Infinity,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
  });
};
