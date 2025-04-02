import { useMutation } from "@tanstack/react-query";
import { renameResource } from "@/lib/services/api.js";
import queryClient from "@/config/queryClient.js";
import { useXToast } from "@/hooks/useXToast.js";
import { useLocation } from "react-router-dom";

export const useRenameResource = () => {
  const location = useLocation();
  const path = location.pathname.replace("/reading/", "");
  const toast = useXToast();

  return useMutation({
    mutationFn: async (variables) => {
      toast.startLoading("Renaming resource...");
      return await renameResource(variables);
    },
    onSuccess: (updatedResource, variables) => {
      toast.success("Resource renamed.");
      queryClient.setQueryData(["resources", path], (oldData) => {
        if (!oldData) return oldData;

        return oldData.map((item) =>
          item._id === variables.id ? { ...item, name: variables.name } : item,
        );
      });
    },
    onError: toast.error,
    onSettled: toast.stopLoading,
  });
};
