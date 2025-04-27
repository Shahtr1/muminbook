import { useQuery } from "@tanstack/react-query";
import { getReadings } from "@/services/index.js";

export const useReading = () => {
  const { data = [], ...rest } = useQuery({
    queryKey: ["readings"],
    queryFn: getReadings,
    refetchOnWindowFocus: false,
    retry: false,
  });

  return { readings: data, ...rest };
};
