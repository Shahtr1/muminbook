import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useXToast } from '@/components/layout/toast/useXToast.jsx';
import { togglePin } from '@/services/index.js';

export const useTogglePinResource = () => {
  const toast = useXToast();
  const queryClient = useQueryClient();
  const path = location.pathname.replace('/reading/', '');

  return useMutation({
    mutationFn: async ({ id, pinned }) => {
      toast.startLoading(`${pinned ? 'Unpinning...' : 'Pinning...'}`);
      await togglePin(id);
      return { id, pinned };
    },
    onSuccess: ({ id, pinned }) => {
      toast.success(`${pinned ? 'Unpinned...' : 'Pinned...'}`);
      queryClient.invalidateQueries({ queryKey: ['overview'] });
      queryClient.setQueryData(['resources', path], (oldData) => {
        if (!Array.isArray(oldData)) return oldData;

        return oldData.map((item) =>
          item._id === id ? { ...item, pinned: !pinned } : item
        );
      });
    },
    onError: toast.error,
    onSettled: toast.stopLoading,
  });
};
