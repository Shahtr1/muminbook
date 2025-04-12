import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useXToast } from "@/hooks/useXToast.js";
import { deleteResource } from "@/lib/services";

export const useDeleteResource = () => {
  const toast = useXToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      toast.startLoading("Deleting resource...");
      return deleteResource(id);
    },
    onSuccess: () => {
      toast.success("Resource deleted permanently");

      queryClient.invalidateQueries({ queryKey: ["trash"] });
      queryClient.invalidateQueries({ queryKey: ["isTrashEmpty"] });
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to delete resource");
    },
    onSettled: () => {
      toast.stopLoading();
    },
  });
};
