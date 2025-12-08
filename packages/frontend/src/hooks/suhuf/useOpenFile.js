import { useEffect, useState } from 'react';
import { useOpenSuhuf } from '@/hooks/suhuf/useOpenSuhuf.js';
import { useUpdateSuhufConfig } from '@/hooks/suhuf/useUpdateSuhufConfig.js';
import { useQueryClient } from '@tanstack/react-query';

const deepEqual = (a, b) => {
  return JSON.stringify(a) === JSON.stringify(b);
};

export const useOpenFile = (fileId, isReading = false) => {
  const queryClient = useQueryClient();
  const [createdSuhufId, setCreatedSuhufId] = useState(null);

  const openSuhuf = useOpenSuhuf((suhufId) => {
    setCreatedSuhufId(suhufId);
  });

  const suhuf = queryClient.getQueryData(['suhuf', createdSuhufId]);
  const { mutate: updateConfig } = useUpdateSuhufConfig(createdSuhufId);

  useEffect(() => {
    if (!suhuf || !createdSuhufId) return;

    const panels = suhuf?.config?.panels || [];
    const activeIndex = panels.findIndex((p) => p.active);
    if (activeIndex === -1) return;

    const updatedPanels = panels.map((panel, i) =>
      i === activeIndex
        ? {
            ...panel,
            fileId,
            fileType: isReading ? 'reading' : 'user',
          }
        : panel
    );

    if (!deepEqual(updatedPanels, panels)) {
      updateConfig({ panels: updatedPanels });
    }
  }, [suhuf, createdSuhufId, fileId, isReading, updateConfig]);

  return openSuhuf;
};
