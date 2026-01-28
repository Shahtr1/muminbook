import { useXToast } from '@/components/layout/toast/useXToast.jsx';
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
      await queryClient.cancelQueries(['suhuf', suhufId]);

      const previous = queryClient.getQueryData(['suhuf', suhufId]);

      queryClient.setQueryData(['suhuf', suhufId], (old) => {
        if (!old) return old;

        const newConfig = { ...old.config };

        // Deep merge layout safely
        if (configUpdate.layout) {
          newConfig.layout = {
            ...old.config?.layout,
            ...configUpdate.layout,
          };
        }

        // Replace panels fully if provided
        if (configUpdate.panels) {
          newConfig.panels = configUpdate.panels;
        }

        return {
          ...old,
          config: newConfig,
        };
      });

      return { previous };
    },

    onError: (error, _, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['suhuf', suhufId], context.previous);
      }
      toast.error(error);
    },

    // Optional but recommended: ensure server truth wins
    onSettled: () => {
      queryClient.invalidateQueries(['suhuf', suhufId]);
    },
  });
};
