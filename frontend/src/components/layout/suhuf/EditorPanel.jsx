import { useColorMode } from "@chakra-ui/react";
import { Editor, useMonaco } from "@monaco-editor/react";
import { useEffect, useState } from "react";
import { defineMbTheme } from "@/theme/monacoTheme.js";

export const EditorPanel = ({ value, onValueChange }) => {
  const { colorMode } = useColorMode();
  const monaco = useMonaco();
  const [themeReady, setThemeReady] = useState(false);

  const selectedTheme =
    colorMode === "dark" ? "mb-theme-dark" : "mb-theme-light";
  const editorKey = `editor-${selectedTheme}`;

  useEffect(() => {
    if (monaco) {
      defineMbTheme(monaco, colorMode);
      setThemeReady(true);
    }
  }, [monaco, colorMode]);

  return (
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
};
