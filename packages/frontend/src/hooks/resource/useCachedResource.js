import { useQueryClient } from "@tanstack/react-query";

export const useCachedResource = (id, path) => {
  const queryClient = useQueryClient();
  const resources =
    queryClient.getQueryData(["resources", encodeURIComponent(path)]) || [];
  return resources.find((item) => item._id === id);
};
