import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getReading, getReadings } from "@/services/index.js";
import { useMemo } from "react";

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

export const useReadingInfinite = (
  { fileId, startType = "surah", startValue, limit = 20 },
  options = {},
) => {
  const queryKey = useMemo(() => {
    return ["reading", fileId, startType, startValue];
  }, [fileId, startType, startValue]);

  return useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam }) => {
      const params = {
        startType,
        startValue,
        limit,
        ...pageParam,
      };

      return await getReading(fileId, params);
    },
    initialPageParam: {},

    getNextPageParam: (lastPage) =>
      lastPage?.nextCursor !== null
        ? { after: lastPage.nextCursor }
        : undefined,

    getPreviousPageParam: (firstPage) =>
      firstPage?.prevCursor !== null
        ? { before: firstPage.prevCursor }
        : undefined,

    staleTime: Infinity,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
    enabled: options.enabled !== false,
  });
};
