import { useQuery } from "@tanstack/react-query";
import { getFamilyTree } from "../lib/services/api.js";

export const FAMILY_TREE = "family_tree";

const useFamilyTree = (opts = {}) => {
  const { data: familyTree = [], ...rest } = useQuery({
    queryKey: [FAMILY_TREE],
    queryFn: getFamilyTree,
    ...opts,
  });

  return { familyTree, ...rest };
};

export default useFamilyTree;
