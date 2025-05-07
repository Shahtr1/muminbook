import { useQuery } from "@tanstack/react-query";
import { getReading, getReadings } from "@/services/index.js";

export const useReadings = () => {
  const { data = [], ...rest } = useQuery({
    queryKey: ["readings"],
    queryFn: getReadings,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
  });

  return { readings: data, ...rest };
};

export const useReadingDetail = (id, page = 1) => {
  const { data, ...rest } = useQuery({
    queryKey: ["reading", id, page],
    queryFn: () => getReading(id, page),
    enabled: !!id,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
  });

  return {
    reading: data,
    ...rest,
  };
};
