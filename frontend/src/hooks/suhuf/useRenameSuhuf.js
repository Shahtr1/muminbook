import { useMutation } from "@tanstack/react-query";
import queryClient from "@/config/queryClient.js";
import { useXToast } from "@/hooks/useXToast.js";
import { renameSuhuf } from "@/services/index.js";

export const useRenameSuhuf = () => {
  const toast = useXToast();

  return useMutation({
    mutationFn: async (variables) => {
      toast.startLoading("Renaming suhuf...");
      return await renameSuhuf(variables);
    },
    onSuccess: (updatedSuhuf, variables) => {
      toast.success("Suhuf renamed.");
      queryClient.invalidateQueries({ queryKey: ["suhuf", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["windows"] });
    },
    onError: toast.error,
    onSettled: toast.stopLoading,
  });
};
