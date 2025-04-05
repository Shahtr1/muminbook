import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useXToast } from "@/hooks/useXToast.js";
import { restoreFromTrash } from "@/lib/services/api.js";

export const useRestoreFromTrashResource = () => {
  const toast = useXToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, path }) => {
      toast.startLoading("Restoring from trash...");
      const result = await restoreFromTrash(id);
      return { id, path, result };
    },
    onSuccess: ({ id, path }) => {
      toast.success("Resource restored successfully");

      const segments = path?.split("/") || [];
      const parentPath = segments.slice(0, -1).join("/");

      if (id && parentPath) {
        queryClient.invalidateQueries({ queryKey: ["resources", parentPath] });
      }

      queryClient.invalidateQueries({ queryKey: ["trash"] });
      queryClient.invalidateQueries({ queryKey: ["isTrashEmpty"] });
    },

    onError: toast.error,
    onSettled: toast.stopLoading,
  });
};
