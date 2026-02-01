import { useCallback } from 'react';
import { useUpdateSuhufConfig } from '@/hooks/suhuf/useUpdateSuhufConfig.js';
import { useQueryClient } from '@tanstack/react-query';
import { useXToast } from '@/components/layout/toast/useXToast.jsx';

export const useOpenFile = (suhufId) => {
  const toast = useXToast();
  const { mutate: updateConfig } = useUpdateSuhufConfig(suhufId);
  const queryClient = useQueryClient();

  return useCallback(
    (source) => {
      if (!suhufId) {
        toast.error({ message: 'No suhuf selected' });
        return;
      }

      if (!source) {
        toast.error({ message: 'No source present' });
        return;
      }

      const suhuf = queryClient.getQueryData(['suhuf', suhufId]);

      if (!suhuf || !suhuf.config) {
        toast.error({ message: 'No suhuf found with the given ID' });
        return;
      }

      const panels = suhuf.config.panels ?? [];

      if (!panels.length) {
        toast.error({ message: 'No panels configured' });
        return;
      }

      const hasActivePanel = panels.some((panel) => panel.active);

      if (!hasActivePanel) {
        toast.error({ message: 'No active panel selected' });
        return;
      }

      const updatedPanels = panels.map((panel) =>
        panel.active
          ? {
              ...panel,
              source,
              fileType: 'reading',
            }
          : panel
      );

      updateConfig({ panels: updatedPanels });
    },
    [suhufId, queryClient, toast, updateConfig]
  );
};
