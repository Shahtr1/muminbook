import { useQueryClient } from "@tanstack/react-query";

export const useCachedQuery = (queryKey, useQueryHook) => {
  const queryClient = useQueryClient();
  const cached = queryClient.getQueryData(queryKey);

  const result = useQueryHook({ enabled: !cached });

  return {
    data: cached || result.data,
    isPending: result.isPending && !cached,
    isError: result.isError,
    ...result,
  };
};
