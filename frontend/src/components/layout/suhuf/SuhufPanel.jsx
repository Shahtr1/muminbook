import { Box, useBreakpointValue, useColorMode } from "@chakra-ui/react";
import Split from "react-split";
import { useMonaco } from "@monaco-editor/react";
import { useEffect, useMemo, useState } from "react";
import { defineMbTheme } from "@/theme/monacoTheme.js";
import { useParams } from "react-router-dom";
import { DefaultPanel } from "@/components/layout/suhuf/DefaultPanel.jsx";
import { useSuhuf } from "@/hooks/suhuf/useSuhuf.js";
import { useUpdateSuhufConfig } from "@/hooks/suhuf/useUpdateSuhufConfig.js";
import { useSplitPanelSizes } from "@/hooks/suhuf/useSplitPanelSizes.js";

export const SuhufPanel = ({ value, onValueChange }) => {
  const { colorMode } = useColorMode();
  const { id: suhufId } = useParams();
  const { data: suhuf } = useSuhuf(suhufId);
  const { mutate: updateConfig } = useUpdateSuhufConfig(suhufId);
  const selectedTheme =
    colorMode === "dark" ? "mb-theme-dark" : "mb-theme-light";
  const monaco = useMonaco();

  const isSmallScreen = useBreakpointValue({ base: true, sm: false }) || false;
  const [themeReady, setThemeReady] = useState(false);

  const layout = suhuf?.config?.layout || {};
  const isSecondPanelOpen = layout.isSplit;

  // Panel sizing logic
  const { sizes, handleResize } = useSplitPanelSizes({
    layout,
    isSecondPanelOpen,
    onUpdateLayout: updateConfig,
  });

  // Monaco theme setup
  useEffect(() => {
    if (monaco) {
      defineMbTheme(monaco, colorMode);
      setThemeReady(true);
    }
  }, [monaco, colorMode]);

  // Force re-mount when theme changes
  const editorKey = `editor-${selectedTheme}`;

  const renderEditor = () => (
    <>
      <DefaultPanel suhufId={suhufId} />
      {/*<Editor*/}
      {/*  key={editorKey}*/}
      {/*  height="100%"*/}
      {/*  defaultLanguage="plaintext"*/}
      {/*  value={value}*/}
      {/*  onChange={onValueChange}*/}
      {/*  theme={selectedTheme}*/}
      {/*  options={{*/}
      {/*    wordWrap: "on",*/}
      {/*    fontSize: 14,*/}
      {/*  }}*/}
      {/*/>*/}
    </>
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // Don't change below dependency array.
    // The dependency array is intentionally limited.
    // Re-rendering this memoized `children` array too frequently (e.g., on every minor layout change)
    // causes Default Panel layout tab not to work, as it doesn't render on suhuf id changes
    // We're only tracking layout keys that affect panel structure to ensure stable and performant rendering.
  }, [themeReady, isSecondPanelOpen, suhufId]);

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
