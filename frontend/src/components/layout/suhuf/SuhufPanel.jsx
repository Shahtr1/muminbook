import { Box, useBreakpointValue } from "@chakra-ui/react";
import Split from "react-split";
import { useMemo } from "react";
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
  const isSecondPanelActive = panels[1]?.active;

  const { sizes, handleResize } = useSplitPanelSizes({
    layout,
    isSecondPanelOpen,
    onUpdateLayout: updateConfig,
  });

  const renderPanelContent = (panel) => {
    const type = panel?.fileType || "none";

    switch (type) {
      case "reading":
        return <ReadingPanel id={panel?.fileId} />;
      case "user":
        return <EditorPanel />;
      default:
        return <DefaultPanel suhufId={suhufId} />;
    }
  };

  const panelElements = useMemo(() => {
    const setActivePanel = (index) => {
      const currentActiveIndex = panels.findIndex((p) => p.active);
      if (currentActiveIndex === index) return;

      const newPanels = panels.map((panel, i) => ({
        ...panel,
        active: i === index,
      }));

      updateConfig({ panels: newPanels });
    };

    const renderPanel = (index) => {
      const panel = panels[index];
      const isActive = index === 1 ? isSecondPanelActive : !isSecondPanelActive;

      return (
        <Box
          key={`panel-${index + 1}`}
          h="100%"
          w="100%"
          borderTop={isActive ? "2px solid" : "none"}
          borderColor="brand.500"
          onClick={() => {
            setActivePanel(index);
          }}
        >
          {renderPanelContent(panel)}
        </Box>
      );
    };

    const elements = [renderPanel(0)];
    if (isSecondPanelOpen) elements.push(renderPanel(1));

    return elements;
  }, [isSecondPanelOpen, updateConfig, isSecondPanelActive]);

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
