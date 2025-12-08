import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useXToast } from "@/hooks/useXToast.js";
import { deleteWindow } from "@/services/index.js";

export const useDeleteWindow = () => {
  const toast = useXToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }) => {
      toast.startLoading("Deleting window...");
      return deleteWindow(id);
    },
    onSuccess: (_data, { typeId, type }) => {
      toast.success("Window deleted");
      queryClient.invalidateQueries({ queryKey: ["windows"] });
      queryClient.removeQueries({ queryKey: [type, typeId] });
    },
    onError: toast.error,
    onSettled: toast.stopLoading,
  });
};
