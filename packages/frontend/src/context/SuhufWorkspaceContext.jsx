import { createContext, useContext, useMemo } from 'react';
import { useUpdateSuhufConfig } from '@/hooks/suhuf/useUpdateSuhufConfig';
import { useOpenFile } from '@/hooks/suhuf/useOpenFile.js';

const SuhufWorkspaceContext = createContext(null);

export const SuhufProvider = ({ suhuf, children }) => {
  const { mutate: updateConfig } = useUpdateSuhufConfig(suhuf._id);
  const openFile = useOpenFile(suhuf._id);

  const layout = suhuf?.config?.layout || {};
  const panels = suhuf?.config?.panels || [];

  const updateLayout = (newLayout) => {
    updateConfig({ layout: { ...layout, ...newLayout } });
  };

  const updatePanels = (newPanels) => {
    updateConfig({ panels: newPanels });
  };

  const toggleSplit = () => {
    const isSplit = !layout.isSplit;

    if (!isSplit && panels.length) {
      const resetPanels = panels.map((p, i) => ({
        ...p,
        active: i === 0,
      }));

      updateConfig({
        layout: { ...layout, isSplit },
        panels: resetPanels,
      });
      return;
    }

    updateLayout({ isSplit });
  };

  const value = useMemo(
    () => ({
      suhuf,
      layout,
      panels,
      updateLayout,
      updatePanels,
      toggleSplit,
      openFile,
    }),
    [suhuf, layout, panels]
  );

  return (
    <SuhufWorkspaceContext.Provider value={value}>
      {children}
    </SuhufWorkspaceContext.Provider>
  );
};

export const useSuhufContext = () => {
  const ctx = useContext(SuhufWorkspaceContext);
  if (!ctx)
    throw new Error('useSuhufContext must be used inside SuhufProvider');
  return ctx;
};
