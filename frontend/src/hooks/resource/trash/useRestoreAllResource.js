import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useXToast } from "@/hooks/useXToast.js";
import { restoreAllFromTrash } from "@/lib/services/index.js";

export const useRestoreAllResource = () => {
  const toast = useXToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      toast.startLoading("Restoring from trash...");
      return await restoreAllFromTrash();
    },
    onSuccess: () => {
      toast.success("All possible resources restored");
      queryClient.invalidateQueries({
        queryKey: ["trash"],
      });
      queryClient.invalidateQueries({ queryKey: ["isTrashEmpty"] });
      queryClient.invalidateQueries({
        queryKey: ["resources"],
      });
      queryClient.invalidateQueries({ queryKey: ["overview"] });
    },
    onError: toast.error,
    onSettled: toast.stopLoading,
  });
};
