import { useQuery } from "@tanstack/react-query";
import { getJuz } from "@/services/index.js";

export const useJuz = () => {
  const { data = [], ...rest } = useQuery({
    queryKey: ["juzList"],
    queryFn: getJuz,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: Infinity,
  });

  return { juzList: data, ...rest };
};
