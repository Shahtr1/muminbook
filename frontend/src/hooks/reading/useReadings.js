import { useQuery } from "@tanstack/react-query";
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
  const { data = [], ...rest } = useQuery({
    queryKey: ["reading", id],
    queryFn: () => getReading(id),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: Infinity,
  });

  return { reading: data, ...rest };
};
