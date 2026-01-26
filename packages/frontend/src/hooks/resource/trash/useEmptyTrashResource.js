import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useXToast } from '@/components/layout/toast/useXToast.jsx';
import { emptyTrash } from '@/services/index.js';

export const useEmptyTrashResource = () => {
  const toast = useXToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      toast.startLoading('Emptying trash...');
      return await emptyTrash();
    },
    onSuccess: () => {
      toast.success('Trash emptied');
      queryClient.invalidateQueries({
        queryKey: ['trash'],
      });
      queryClient.invalidateQueries({ queryKey: ['isTrashEmpty'] });
    },
    onError: toast.error,
    onSettled: toast.stopLoading,
  });
};
