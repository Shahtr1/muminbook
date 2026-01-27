import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useXToast } from '@/components/layout/toast/useXToast.jsx';
import { deleteResource } from '@/services/index.js';

export const useDeleteResource = () => {
  const toast = useXToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      toast.startLoading('Deleting resource...');
      return deleteResource(id);
    },
    onSuccess: () => {
      toast.success('Resource deleted permanently');

      queryClient.invalidateQueries({ queryKey: ['trash'] });
      queryClient.invalidateQueries({ queryKey: ['isTrashEmpty'] });
    },
    onError: toast.error,
    onSettled: toast.stopLoading,
  });
};
