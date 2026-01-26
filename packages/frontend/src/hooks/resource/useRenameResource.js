import { useMutation } from '@tanstack/react-query';
import queryClient from '@/config/queryClient.js';
import { useXToast } from '@/components/layout/toast/useXToast.jsx';
import { useLocation } from 'react-router-dom';
import { renameResource } from '@/services/index.js';

export const useRenameResource = () => {
  const location = useLocation();
  const path = location.pathname.replace('/reading/', '');
  const toast = useXToast();

  return useMutation({
    mutationFn: async (variables) => {
      toast.startLoading('Renaming resource...');
      return await renameResource(variables);
    },
    onSuccess: (updatedResource, variables) => {
      toast.success('Resource renamed.');
      queryClient.setQueryData(['resources', path], (oldData) => {
        if (!oldData) return oldData;

        return oldData.map((item) =>
          item._id === variables.id ? { ...item, name: variables.name } : item
        );
      });
    },
    onError: toast.error,
    onSettled: toast.stopLoading,
  });
};
