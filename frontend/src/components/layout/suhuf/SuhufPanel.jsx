import { Box, useBreakpointValue, useColorMode } from "@chakra-ui/react";
import Split from "react-split";
import { useMonaco } from "@monaco-editor/react";
import { useEffect, useMemo, useState } from "react";
import { defineMbTheme } from "@/theme/monacoTheme.js";
import { useParams } from "react-router-dom";
import { DefaultPanel } from "@/components/layout/suhuf/DefaultPanel.jsx";
import { useSuhuf } from "@/hooks/suhuf/useSuhuf.js";
import { useUpdateSuhufLayout } from "@/hooks/suhuf/useUpdateSuhufLayout.js";
import { useSplitPanelSizes } from "@/hooks/suhuf/useSplitPanelSizes.js";

export const SuhufPanel = ({ value, onValueChange }) => {
  const { colorMode } = useColorMode();
  const { id: suhufId } = useParams();
  const { data: suhuf } = useSuhuf(suhufId);
  const { mutate: updateLayout } = useUpdateSuhufLayout(suhufId);
  const monaco = useMonaco();

  const isSmallScreen = useBreakpointValue({ base: true, sm: false }) || false;
  const [themeReady, setThemeReady] = useState(false);

  const layout = suhuf?.config?.layout || {};
  const isSecondPanelOpen = layout.rightTabOpen;

  // Panel sizing logic
  const { sizes, handleResize } = useSplitPanelSizes({
    layout,
    isSecondPanelOpen,
    onUpdateLayout: updateLayout,
  });

  // Monaco theme setup
  useEffect(() => {
    if (monaco) {
      defineMbTheme(monaco, colorMode);
      setThemeReady(true);
    }
  }, [monaco, colorMode]);

  const renderEditor = () => <DefaultPanel suhufId={suhufId} />;

  const children = useMemo(() => {
    const panels = [
      <Box key="panel-1" h="100%" w="100%">
        {themeReady && renderEditor()}
      </Box>,
    ];

    if (isSecondPanelOpen) {
      panels.push(
        <Box key="panel-2" h="100%" w="100%">
          {themeReady && renderEditor()}
        </Box>,
      );
    }

    return panels;
  }, [themeReady, isSecondPanelOpen]);

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
      {children}
    </Split>
  );
};
