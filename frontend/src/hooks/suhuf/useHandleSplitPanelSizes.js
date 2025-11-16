import { useEffect, useState } from "react";

export const useHandleSplitPanelSizes = ({
  layout = {},
  isSecondPanelOpen,
  onUpdateLayout,
}) => {
  // Ensure we always fall back to a default ratio if not defined
  const defaultSizes = [75, 25];
  const initialSizes =
    layout.splitRatio?.length === 2 ? layout.splitRatio : defaultSizes;

  const [sizes, setSizes] = useState(() =>
    isSecondPanelOpen ? initialSizes : [100],
  );

  // Sync state when split panel toggles
  useEffect(() => {
    if (isSecondPanelOpen) {
      // When opening, use saved or default sizes
      if (
        sizes.length !== 2 ||
        sizes[0] !== initialSizes[0] ||
        sizes[1] !== initialSizes[1]
      ) {
        setSizes(initialSizes);
      }
    } else {
      // When closing, collapse to one panel size
      if (sizes.length === 2) {
        setSizes([sizes[0]]);
      }
    }
  }, [isSecondPanelOpen, layout.splitRatio]);

  const handleResize = (newSizes) => {
    setSizes(newSizes);
    if (isSecondPanelOpen && typeof onUpdateLayout === "function") {
      // TODO: Fix this as it has old data, which doesnt save left suhuf sidebar config correctly
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
