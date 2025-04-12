import { useQuery } from "@tanstack/react-query";
import { isTrashEmpty } from "@/lib/services/index.js";

export const useIsTrashEmpty = () => {
  const { data, ...rest } = useQuery({
    queryKey: ["isTrashEmpty"],
    queryFn: isTrashEmpty,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return { emptyTrash: data ?? false, ...rest };
};
