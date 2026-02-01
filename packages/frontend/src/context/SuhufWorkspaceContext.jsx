import { createContext, useContext, useMemo, useCallback } from 'react';
import { useUpdateSuhufConfig } from '@/hooks/suhuf/useUpdateSuhufConfig';
import { useOpenFile } from '@/hooks/suhuf/useOpenFile.js';

const SuhufWorkspaceContext = createContext(null);

export const SuhufProvider = ({ suhuf, children, surahs }) => {
  const { mutate: updateConfig } = useUpdateSuhufConfig(suhuf._id);
  const openFile = useOpenFile(suhuf._id);

  const layout = suhuf?.config?.layout || {};
  const panels = suhuf?.config?.panels || [];

  // Send only partial layout
  const updateLayout = useCallback(
    (partial) => {
      updateConfig({
        layout: partial,
      });
    },
    [updateConfig]
  );

  const updatePanels = useCallback(
    (updater) => {
      const currentPanels = suhuf?.config?.panels || [];

      const nextPanels =
        typeof updater === 'function' ? updater(currentPanels) : updater;

      updateConfig({ panels: nextPanels });
    },
    [suhuf?.config?.panels, updateConfig]
  );

  const toggleSplit = useCallback(() => {
    const next = !layout.isSplit;

    if (!next && panels.length) {
      const resetPanels = panels.map((p, i) => ({
        ...p,
        active: i === 0,
      }));

      updateConfig({
        layout: { isSplit: next },
        panels: resetPanels,
      });

      return;
    }

    updateLayout({ isSplit: next });
  }, [layout.isSplit, panels, updateLayout, updateConfig]);

  const toggleLeftSidebar = useCallback(() => {
    updateLayout({ isLeftTabOpen: !layout.isLeftTabOpen });
  }, [layout.isLeftTabOpen, updateLayout]);

  const toggleBottomPanel = useCallback(() => {
    updateLayout({ isBottomTabOpen: !layout.isBottomTabOpen });
  }, [layout.isBottomTabOpen, updateLayout]);

  const value = useMemo(
    () => ({
      suhuf,
      layout,
      panels,
      surahs,
      updateLayout,
      updatePanels,
      toggleSplit,
      toggleLeftSidebar,
      toggleBottomPanel,
      openFile,
    }),
    [
      suhuf,
      layout,
      panels,
      updateLayout,
      updatePanels,
      toggleSplit,
      toggleLeftSidebar,
      toggleBottomPanel,
      openFile,
    ]
  );

  return (
    <SuhufWorkspaceContext.Provider value={value}>
      {children}
    </SuhufWorkspaceContext.Provider>
  );
};

export const useSuhufWorkspaceContext = () => {
  const ctx = useContext(SuhufWorkspaceContext);
  if (!ctx)
    throw new Error(
      'useSuhufWorkspaceContext must be used inside SuhufProvider'
    );
  return ctx;
};
