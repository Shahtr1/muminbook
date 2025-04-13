import { useQuery } from "@tanstack/react-query";
import { getSuhuf } from "@/lib/services/index.js";

export const useSuhuf = (id) => {
  return useQuery({
    queryKey: ["suhuf", id],
    queryFn: () => getSuhuf(id),
    enabled: !!id,
  });
};
