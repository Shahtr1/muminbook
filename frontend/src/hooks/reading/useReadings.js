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

export const useReadingFromPage = (id, startingPage = 1) => {
  return useInfiniteQuery({
    queryKey: ["reading", id],
    queryFn: ({ pageParam = startingPage }) => getReading(id, pageParam),
    initialPageParam: startingPage,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
    getPreviousPageParam: (firstPage) =>
      firstPage.hasPrevPage ? firstPage.page - 1 : undefined,
    enabled: !!id,
    staleTime: Infinity,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
  });
};
