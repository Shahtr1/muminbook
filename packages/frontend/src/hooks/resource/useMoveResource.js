import { useMutation } from '@tanstack/react-query';
import queryClient from '@/config/queryClient.js';
import { useXToast } from '@/components/layout/toast/useXToast.jsx';
import { useLocation } from 'react-router-dom';
import { moveResource } from '@/services/index.js';

export const useMoveResource = () => {
  const toast = useXToast();
  const location = useLocation();
  const oldPath = location.pathname.replace('/reading/', '');

  return useMutation({
    mutationFn: async (variables) => {
      toast.startLoading('Moving resource...');
      return await moveResource(variables);
    },
    onSuccess: (movedResource, variables) => {
      toast.success('Resource moved');
      queryClient.setQueryData(['resources', oldPath], (oldData) => {
        if (!Array.isArray(oldData)) return oldData;
        return oldData.filter((item) => item._id !== variables.id);
      });
      queryClient.invalidateQueries({
        queryKey: ['resources', variables.destinationPath],
      });
    },
    onError: toast.error,
    onSettled: toast.stopLoading,
  });
};
