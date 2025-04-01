import { useQuery } from "@tanstack/react-query";
import { getResources } from "@/lib/services/api.js";

const RESOURCES = "resources";

export const useResources = (path = "my-files") => {
  const { data = [], ...rest } = useQuery({
    queryKey: [RESOURCES, path],
    queryFn: () => getResources(path),
    enabled: Boolean(path),
  });

  return { resources: data, ...rest };
};
