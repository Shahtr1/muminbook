import { Box, useBreakpointValue } from "@chakra-ui/react";
import Split from "react-split";
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { DefaultPanel } from "@/components/layout/suhuf/DefaultPanel.jsx";
import { ReadingPanel } from "@/components/layout/suhuf/ReadingPanel.jsx";
import { EditorPanel } from "@/components/layout/suhuf/EditorPanel.jsx";
import { useSuhuf } from "@/hooks/suhuf/useSuhuf.js";
import { useUpdateSuhufConfig } from "@/hooks/suhuf/useUpdateSuhufConfig.js";
import { useSplitPanelSizes } from "@/hooks/suhuf/useSplitPanelSizes.js";

export const SuhufPanel = () => {
  const { id: suhufId } = useParams();
  const { data: suhuf } = useSuhuf(suhufId);
  const { mutate: updateConfig } = useUpdateSuhufConfig(suhufId);

  const isSmallScreen = useBreakpointValue({ base: true, sm: false }) || false;

  const layout = suhuf?.config?.layout || {};
  const panels = suhuf?.config?.panels || [];
  const isSecondPanelOpen = layout.isSplit;
  const initialActiveIndex = panels.findIndex((p) => p.active) || 0;

  const [activePanelIndex, setActivePanelIndex] = useState(initialActiveIndex);

  const { sizes, handleResize } = useSplitPanelSizes({
    layout,
    isSecondPanelOpen,
    onUpdateLayout: updateConfig,
  });

  const handlePanelClick = (index) => {
    if (index === activePanelIndex) return;

    setActivePanelIndex(index);

    const updatedPanels = panels.map((panel, i) => ({
      ...panel,
      active: i === index,
    }));

    updateConfig({ panels: updatedPanels });
  };

  const renderPanelContent = (panel) => {
    const type = panel?.fileType || "none";

    switch (type) {
      case "reading":
        return panel?.fileId ? (
          <ReadingPanel id={panel.fileId} />
        ) : (
          <DefaultPanel suhufId={suhufId} />
        );
      case "user":
        return <EditorPanel />;
      default:
        return <DefaultPanel suhufId={suhufId} />;
    }
  };

  const panelElements = useMemo(() => {
    const renderPanel = (index) => {
      const panel = panels[index];
      const isActive = index === activePanelIndex;

      return (
        <Box
          key={`panel-${index + 1}`}
          h="100%"
          w="100%"
          borderTop={isActive ? "2px solid" : "none"}
          borderColor="brand.500"
          onClick={() => handlePanelClick(index)}
        >
          {renderPanelContent(panel)}
        </Box>
      );
    };

    const elements = [renderPanel(0)];
    if (isSecondPanelOpen) elements.push(renderPanel(1));
    return elements;
  }, [panels, isSecondPanelOpen, activePanelIndex, suhufId]);

  return (
    <Split
      key={`${isSmallScreen ? "vertical" : "horizontal"}-${isSecondPanelOpen ? "two" : "one"}`}
      direction={isSmallScreen ? "vertical" : "horizontal"}
      sizes={isSecondPanelOpen ? sizes : [100]}
      minSize={200}
      gutterSize={3}
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        flexDirection: isSmallScreen ? "column" : undefined,
      }}
      onDragEnd={handleResize}
    >
      {panelElements}
    </Split>
  );
};
