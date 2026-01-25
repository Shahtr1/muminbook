import { useUpdateSuhufConfig } from '@/hooks/suhuf/useUpdateSuhufConfig.js';
import { useQueryClient } from '@tanstack/react-query';
import { useXToast } from '@/components/toast/useXToast.jsx';

export const useOpenFile = (suhufId) => {
  const toast = useXToast();
  const { mutate: updateConfig } = useUpdateSuhufConfig(suhufId);
  const queryClient = useQueryClient();

  return (fileId) => {
    if (!suhufId) {
      toast.error({ message: 'No suhuf selected' });
      return;
    }

    const suhuf = queryClient.getQueryData(['suhuf', suhufId]);

    if (!suhuf) {
      toast.error({ message: 'No suhuf found with the given ID' });
      return;
    }

    if (!fileId) {
      toast.error({ message: 'No file ID present' });
      return;
    }

    const panels = suhuf.config?.panels || [];

    console.log(panels, 'panels');
    const updatedPanels = panels.map((panel) => {
      if (panel.active) {
        panel.fileType = 'reading';
        panel.filId = fileId;
      }
    });
  };
};
