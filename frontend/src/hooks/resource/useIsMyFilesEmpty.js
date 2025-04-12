import { useQuery } from "@tanstack/react-query";
import { isMyFilesEmpty } from "@/lib/services/index.js";

export const useIsMyFilesEmpty = () => {
  const { data, ...rest } = useQuery({
    queryKey: ["isMyFilesEmpty"],
    queryFn: isMyFilesEmpty,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return { emptyMyFiles: data ?? false, ...rest };
};
