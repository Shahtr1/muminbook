import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getReadings } from "@/services/index.js";
import API from "@/config/apiClient.js";
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

export const useReadingInfinite = ({ fileId, limit = 50000 }, options = {}) => {
  const queryKey = useMemo(() => {
    return ["reading", fileId];
  }, [fileId]);

  return useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 0 }) => {
      const params = new URLSearchParams({
        skip: pageParam.toString(),
        limit: limit.toString(),
      });

      return API.get(`/readings/${fileId}?${params}`);
    },
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length > 0 ? allPages.length * limit : undefined,
    staleTime: Infinity,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
    enabled: options.enabled !== false,
  });
};
