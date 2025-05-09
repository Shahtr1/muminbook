import { useXToast } from "@/hooks/useXToast.js";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateSuhufConfig } from "@/services/index.js";

export const useUpdateSuhufConfig = (suhufId) => {
  const toast = useXToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (configUpdate) => {
      return await updateSuhufConfig(suhufId, configUpdate);
    },

    onMutate: async (configUpdate) => {
      await queryClient.cancelQueries(["suhuf", suhufId]);

      const previousSuhuf = queryClient.getQueryData(["suhuf", suhufId]);

      queryClient.setQueryData(["suhuf", suhufId], (old) => ({
        ...old,
        config: {
          ...old?.config,
          ...configUpdate,
        },
      }));

      return { previousSuhuf };
    },

    onError: (error, _, context) => {
      if (context?.previousSuhuf) {
        queryClient.setQueryData(["suhuf", suhufId], context.previousSuhuf);
      }
      toast.error(error);
    },
  });
};
