import { useEffect, useState, useCallback } from 'react';
import { useSuhufWorkspaceContext } from '@/context/SuhufWorkspaceContext.jsx';

export const useHandleSplitPanelSizes = ({ isSecondPanelOpen }) => {
  const { layout, updateLayout } = useSuhufWorkspaceContext();

  const defaultSizes = [75, 25];

  const initialSizes =
    Array.isArray(layout.splitRatio) && layout.splitRatio.length === 2
      ? layout.splitRatio
      : defaultSizes;

  const [sizes, setSizes] = useState(() =>
    isSecondPanelOpen ? initialSizes : [100]
  );

  // Sync sizes when split toggles or splitRatio changes
  useEffect(() => {
    if (isSecondPanelOpen) {
      setSizes(initialSizes);
    } else {
      setSizes([100]);
    }
  }, [isSecondPanelOpen, layout.splitRatio]);

  const handleResize = useCallback(
    (newSizes) => {
      setSizes(newSizes);

      if (isSecondPanelOpen) {
        updateLayout({
          splitRatio: newSizes,
        });
      }
    },
    [isSecondPanelOpen, updateLayout]
  );

  return { sizes, handleResize };
};
