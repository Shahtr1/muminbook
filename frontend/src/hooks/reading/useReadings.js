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

export const useReadingInfinite = (
  { fileId, surahId, juzId, ruku, hizbQuarter, limit = 20 },
  options = {},
) => {
  const queryKey = useMemo(() => {
    const key = ["reading", fileId];
    if (surahId) key.push(["surahId", surahId]);
    if (juzId) key.push(["juzId", juzId]);
    if (ruku != null) key.push(["ruku", ruku]);
    if (hizbQuarter != null) key.push(["hizbQuarter", hizbQuarter]);
    return key;
  }, [fileId, surahId, juzId, ruku, hizbQuarter]);

  return useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 0 }) => {
      const params = new URLSearchParams({
        skip: pageParam.toString(),
        limit: limit.toString(),
      });

      if (surahId) params.append("surahId", surahId);
      if (juzId) params.append("juzId", juzId);
      if (ruku != null) params.append("ruku", ruku.toString());
      if (hizbQuarter != null)
        params.append("hizbQuarter", hizbQuarter.toString());

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
