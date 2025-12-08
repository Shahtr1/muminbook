import { useQuery } from "@tanstack/react-query";
import { getWindows } from "@/services/index.js";

export const useWindows = () => {
  const { data = [], ...rest } = useQuery({
    queryKey: ["windows"],
    queryFn: () => getWindows(),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
  });

  return { windows: data, ...rest };
};
