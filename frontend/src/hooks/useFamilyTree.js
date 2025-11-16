import { useQuery } from "@tanstack/react-query";
import { getFamilyTree } from "@/services/index.js";

export const FAMILY_TREE = "family_tree";

const useFamilyTree = (opts = {}) => {
  const { data: familyTree = [], ...rest } = useQuery({
    queryKey: [FAMILY_TREE],
    queryFn: getFamilyTree,
    ...opts,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
  });

  return { familyTree, ...rest };
};

export default useFamilyTree;
