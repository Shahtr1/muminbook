import { useXToast } from '@/components/toast/useXToast.jsx';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateSuhufConfig } from '@/services/index.js';

export const useUpdateSuhufConfig = (suhufId) => {
  const toast = useXToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (configUpdate) => {
      return await updateSuhufConfig(suhufId, configUpdate);
    },

    onMutate: async (configUpdate) => {
      // Cancel any pending queries for this suhuf to avoid race conditions
      await queryClient.cancelQueries(['suhuf', suhufId]);

      const cachedSuhuf = queryClient.getQueryData(['suhuf', suhufId]);

      queryClient.setQueryData(['suhuf', suhufId], (old) => ({
        ...old,
        config: {
          ...old?.config,
          ...configUpdate,
        },
      }));

      return { cachedSuhuf };
    },

    onError: (error, _, context) => {
      if (context?.cachedSuhuf) {
        queryClient.setQueryData(['suhuf', suhufId], context.cachedSuhuf);
      }
      toast.error(error);
    },
  });
};
