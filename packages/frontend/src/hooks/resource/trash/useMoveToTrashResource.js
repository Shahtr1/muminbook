import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useXToast } from '@/hooks/useXToast.js';
import { moveToTrash } from '@/services/index.js';

export const useMoveToTrashResource = () => {
  const toast = useXToast();
  const queryClient = useQueryClient();
  const path = location.pathname.replace('/reading/', '');

  return useMutation({
    mutationFn: async (id) => {
      toast.startLoading('Moving to trash...');
      return await moveToTrash(id);
    },
    onSuccess: (trashedResource, id) => {
      toast.success('Moved to trash');
      if (id) {
        queryClient.setQueryData(['resources', path], (oldData) => {
          if (!Array.isArray(oldData)) return oldData;
          return oldData.filter((item) => item._id !== id);
        });
        queryClient.invalidateQueries({
          queryKey: ['trash'],
        });
        queryClient.invalidateQueries({ queryKey: ['isTrashEmpty'] });
        queryClient.invalidateQueries({ queryKey: ['overview'] });
      }
    },
    onError: toast.error,
    onSettled: toast.stopLoading,
  });
};
