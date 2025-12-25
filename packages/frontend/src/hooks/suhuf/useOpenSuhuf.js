import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useCreateSuhuf } from '@/hooks/suhuf/useCreateSuhuf.js';

export const useOpenSuhuf = (onSuccess) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mutate: createSuhuf } = useCreateSuhuf();

  return () => {
    const windows = queryClient.getQueryData(['windows']) || [];
    const baseTitle = 'Untitled Suhuf';

    const openTitles = windows
      .filter((win) => win.type === 'Suhuf' && win.typeId?.title)
      .map((win) => win.typeId.title);

    let newTitle = baseTitle;
    let counter = 1;
    while (openTitles.includes(newTitle)) {
      newTitle = `(${counter}) ${baseTitle}`;
      counter++;
    }

    createSuhuf(
      { title: newTitle },
      {
        onSuccess: ({ suhufId }) => {
          navigate(`/suhuf/${suhufId}`);
          if (typeof onSuccess === 'function') onSuccess(suhufId);
        },
      }
    );
  };
};
