import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUser } from "@/services/index.js";

export const AUTH = "auth";

const useAuth = (opts = {}) => {
  const queryClient = useQueryClient();

  const { data: user, ...rest } = useQuery({
    queryKey: [AUTH],
    queryFn: async () => {
      const userData = await getUser();
      queryClient.setQueryData([AUTH], userData);
      return userData;
    },
    staleTime: Infinity,
    cacheTime: Infinity,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
    ...opts,
  });

  return { user, ...rest };
};

export default useAuth;
