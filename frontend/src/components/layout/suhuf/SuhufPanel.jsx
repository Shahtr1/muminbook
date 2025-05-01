import { Box, useBreakpointValue, useColorMode } from "@chakra-ui/react";
import Split from "react-split";
import { useMonaco } from "@monaco-editor/react";
import { useEffect, useState } from "react";
import { defineMbTheme } from "@/theme/monacoTheme.js";
import { useParams } from "react-router-dom";
import { NoSelectionPane } from "@/components/layout/suhuf/NoSelectionPane.jsx";

export const SuhufPanel = ({ value, onValueChange }) => {
  const { colorMode } = useColorMode();
  const { id: suhufId } = useParams();

  const isSmallScreen = useBreakpointValue({ base: true, sm: false }) || false;
  const monaco = useMonaco();
  const [themeReady, setThemeReady] = useState(false);

  const selectedTheme =
    colorMode === "dark" ? "mb-theme-dark" : "mb-theme-light";

  useEffect(() => {
    if (monaco) {
      defineMbTheme(monaco, colorMode);
      setThemeReady(true);
    }
  }, [monaco, colorMode]);

  // Force re-mount when theme changes
  const editorKey = `editor-${selectedTheme}`;

  const renderEditor = () => <NoSelectionPane suhufId={suhufId} />;
  // <Editor
  //   key={editorKey}
  //   height="100%"
  //   defaultLanguage="plaintext"
  //   value={value}
  //   onChange={onValueChange}
  //   theme={selectedTheme}
  //   options={{
  //     wordWrap: "on",
  //     fontSize: 14,
  //   }}
  // />

  return (
    <Split
      key={isSmallScreen ? "split-vertical" : "split-horizontal"}
      direction={isSmallScreen ? "vertical" : "horizontal"}
      className={isSmallScreen ? "split-vertical" : "split-horizontal"}
      sizes={[75, 25]}
      minSize={200}
      gutterSize={3}
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        flexDirection: isSmallScreen ? "column" : undefined,
      }}
    >
      <Box h="100%" w="100%">
        {themeReady && renderEditor()}
      </Box>
      <Box h="100%" w="100%">
        {themeReady && renderEditor()}
      </Box>
    </Split>
  );
};
