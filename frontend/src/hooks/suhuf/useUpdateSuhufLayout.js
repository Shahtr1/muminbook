import { useXToast } from "@/hooks/useXToast.js";
import { useMutation } from "@tanstack/react-query";
import { updateSuhufLayout } from "@/services/index.js";
import queryClient from "@/config/queryClient.js";

export const useUpdateSuhufLayout = (suhufId) => {
  const toast = useXToast();

  return useMutation({
    mutationFn: async (layoutUpdate) => {
      return await updateSuhufLayout(suhufId, layoutUpdate);
    },
    onSuccess: (updatedSuhuf, variables) => {
      queryClient.setQueryData(["suhuf", suhufId], updatedSuhuf);
    },
    onError: toast.error,
  });
};
