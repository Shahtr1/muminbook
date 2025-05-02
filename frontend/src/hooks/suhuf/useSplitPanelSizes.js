import { useEffect, useMemo, useState } from "react";

export const useSplitPanelSizes = ({
  layout = {},
  isSecondPanelOpen,
  onUpdateLayout,
}) => {
  const savedSizes = useMemo(
    () => layout.splitRatio || [75, 25],
    [layout.splitRatio],
  );
  const [sizes, setSizes] = useState(isSecondPanelOpen ? savedSizes : [100]);

  // Sync sizes if panel toggle state changes
  useEffect(() => {
    if (isSecondPanelOpen) {
      if (
        sizes.length === 1 ||
        sizes[0] !== savedSizes[0] ||
        sizes[1] !== savedSizes[1]
      ) {
        setSizes(savedSizes);
      }
    } else {
      if (sizes.length === 2) {
        setSizes([sizes[0]]);
      }
    }
  }, [isSecondPanelOpen, savedSizes]);

  // Update backend on resize
  const handleResize = (newSizes) => {
    setSizes(newSizes);
    if (isSecondPanelOpen && typeof onUpdateLayout === "function") {
      onUpdateLayout({
        layout: {
          ...layout,
          splitRatio: newSizes,
        },
      });
    }
  };

  return { sizes, handleResize };
};
