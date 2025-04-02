import { useMutation } from "@tanstack/react-query";
import { copyResource } from "@/lib/services/api.js";
import queryClient from "@/config/queryClient.js";
import { useXToast } from "@/hooks/useXToast.js";

export const useCopyResource = () => {
  const toast = useXToast();

  return useMutation({
    mutationFn: async (variables) => {
      toast.startLoading("Copying resource...");
      return await copyResource(variables);
    },
    onSuccess: (copiedResource, variables) => {
      toast.success("Resource copied");
      queryClient.invalidateQueries({
        queryKey: ["resources", variables.destinationPath],
      });
    },
    onError: toast.error,
    onSettled: toast.stopLoading,
  });
};
