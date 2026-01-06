import { useEffect, useState } from 'react';
import { useOpenSuhuf } from '@/hooks/suhuf/useOpenSuhuf.js';
import { useUpdateSuhufConfig } from '@/hooks/suhuf/useUpdateSuhufConfig.js';
import { useQueryClient } from '@tanstack/react-query';
import isEqual from 'lodash/isEqual';

/**
 * Hook: useOpenFile
 * - Ensures that when a suhuf (editor instance) is opened, the currently active panel
 *   is updated with the provided fileId and fileType (reading/user-files).
 *
 * Inputs:
 * - fileId: id of the file to open in the active panel
 * - isReading: boolean to choose fileType ('reading' when true, otherwise 'user-files')
 *
 * Returns:
 * - openSuhuf: function returned from useOpenSuhuf to open/create a suhuf
 */
export const useOpenFile = (fileId, isReading = false) => {
  const queryClient = useQueryClient();
  const [createdSuhufId, setCreatedSuhufId] = useState(null);

  const openSuhuf = useOpenSuhuf((suhufId) => {
    setCreatedSuhufId(suhufId);
  });

  // NOTE: the context object ({ initialFileId, isReading }) is passed to
  // `useOpenSuhuf` for future fallback behaviors (for example: "Open existing"
  // or retry flows that need to know which file the user intended to open).
  const openSuhufWithContext = () =>
    openSuhuf({ initialFileId: fileId, isReading });

  // Read the cached suhuf data from react-query (synchronous, cached read)
  const suhuf = queryClient.getQueryData(['suhuf', createdSuhufId]);
  const { mutate: updateConfig } = useUpdateSuhufConfig(createdSuhufId);

  useEffect(() => {
    // We only proceed when we have both the suhuf object and its id
    if (!suhuf || !createdSuhufId) return;

    const panels = suhuf?.config?.panels || [];
    const activeIndex = panels.findIndex((p) => p.active);
    if (activeIndex === -1) return; // no active panel to update

    // Create a new panels array where only the active panel is replaced
    const updatedPanels = panels.map((panel, i) =>
      i === activeIndex
        ? {
            ...panel,
            fileId,
            fileType: isReading ? 'reading' : 'user',
          }
        : panel
    );

    // Only call the mutation if something actually changed
    if (!isEqual(updatedPanels, panels)) {
      updateConfig({ panels: updatedPanels });
    }
  }, [suhuf, createdSuhufId, fileId, isReading, updateConfig]);

  return openSuhufWithContext;
};
