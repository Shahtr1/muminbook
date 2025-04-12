import { useMutation } from "@tanstack/react-query";
import queryClient from "@/config/queryClient.js";
import { useXToast } from "@/hooks/useXToast.js";
import { copyResource } from "@/lib/services/index.js";

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
