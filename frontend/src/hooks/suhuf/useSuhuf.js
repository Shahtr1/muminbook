import { useQuery } from "@tanstack/react-query";
import { getSuhuf } from "@/services/index.js";

export const useSuhuf = (id) => {
  return useQuery({
    queryKey: ["suhuf", id],
    queryFn: () => getSuhuf(id),
    enabled: !!id,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
  });
};
