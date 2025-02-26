import { useQuery } from "@tanstack/react-query";
import { getUser } from "../lib/services/api.js";

export const AUTH = "auth";

const useAuth = (opts = {}) => {
  const { data: user, ...rest } = useQuery({
    queryKey: [AUTH],
    queryFn: getUser,
    ...opts,
  });
  return { user, ...rest };
};

export default useAuth;
