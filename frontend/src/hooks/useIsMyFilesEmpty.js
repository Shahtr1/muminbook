import { useQuery } from "@tanstack/react-query";
import { isMyFilesEmpty } from "@/lib/services/api.js";

export const useIsMyFilesEmpty = () => {
  const { data, ...rest } = useQuery({
    queryKey: ["isMyFilesEmpty"],
    queryFn: isMyFilesEmpty,
  });

  return { emptyMyFiles: data?.empty ?? false, ...rest };
};
