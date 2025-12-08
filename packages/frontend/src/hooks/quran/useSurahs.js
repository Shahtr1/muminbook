import { useQuery } from "@tanstack/react-query";
import { getSurahs } from "@/services/index.js";

export const useSurahs = () => {
  const { data = [], ...rest } = useQuery({
    queryKey: ["surahs"],
    queryFn: getSurahs,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: Infinity,
  });

  return { surahs: data, ...rest };
};
