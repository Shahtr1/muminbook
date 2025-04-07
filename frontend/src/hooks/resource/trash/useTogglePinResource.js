import { useMutation, useQueryClient } from "@tanstack/react-query";
import { togglePin } from "@/lib/services/api.js";
import { useXToast } from "@/hooks/useXToast.js";

export const useTogglePinResource = () => {
  const toast = useXToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, pinned }) => {
      toast.startLoading(`${pinned ? "Unpinning..." : "Pinning..."}`);
      return await togglePin(id);
    },
    onSuccess: ({ id, pinned }) => {
      toast.success(`${pinned ? "Unpinned..." : "Pinned..."}`);
      queryClient.invalidateQueries({ queryKey: ["overview"] });
    },
    onError: toast.error,
    onSettled: toast.stopLoading,
  });
};
