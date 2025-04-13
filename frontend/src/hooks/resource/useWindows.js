import { useQuery } from "@tanstack/react-query";
import { getWindows } from "@/lib/services/index.js";

export const useWindows = () => {
  const { data = [], ...rest } = useQuery({
    queryKey: ["windows"],
    queryFn: () => getWindows(),
    refetchOnWindowFocus: false,
    retry: false,
  });

  return { windows: data, ...rest };
};
