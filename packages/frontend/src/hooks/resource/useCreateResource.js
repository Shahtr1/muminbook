import { useMutation } from '@tanstack/react-query';
import queryClient from '@/config/queryClient.js';
import { useXToast } from '@/components/toast/useXToast.jsx';
import { createResource } from '@/services/index.js';

export const useCreateResource = () => {
  const toast = useXToast();

  return useMutation({
    mutationFn: async (variables) => {
      toast.startLoading('Creating resource...');
      return await createResource(variables);
    },
    onSuccess: ({ type }, variables) => {
      toast.success(`${type === 'file' ? 'File' : 'Folder'} created.`);
      queryClient.invalidateQueries({
        queryKey: ['resources', variables.path],
      });
    },
    onError: toast.error,
    onSettled: toast.stopLoading,
  });
};
