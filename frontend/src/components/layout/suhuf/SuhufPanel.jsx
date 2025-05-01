import { Box, useColorMode } from "@chakra-ui/react";
import Split from "react-split";
import { Editor, useMonaco } from "@monaco-editor/react";
import { useEffect, useState } from "react";
import { defineMbTheme } from "@/theme/monacoTheme.js";

export const SuhufPanel = ({ value, onValueChange }) => {
  const { colorMode } = useColorMode();
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

  const renderEditor = () => (
    <Editor
      key={editorKey}
      height="100%"
      defaultLanguage="plaintext"
      value={value}
      onChange={onValueChange}
      theme={selectedTheme}
      options={{
        wordWrap: "on",
        fontSize: 14,
      }}
    />
  );

  return (
    <Split
      className="split-horizontal"
      sizes={[50, 50]}
      minSize={200}
      gutterSize={4}
      style={{ display: "flex", width: "100%", height: "100%" }}
    >
      <Box h="100%" w="100%" overflow="hidden">
        {themeReady && renderEditor()}
      </Box>
      <Box h="100%" w="100%" overflow="hidden">
        {themeReady && renderEditor()}
      </Box>
    </Split>
  );
};
