import { Box } from "@chakra-ui/react";
import Split from "react-split";
import { Editor } from "@monaco-editor/react";

export const SuhufPanel = ({
  showRightEditor,
  leftValue,
  onLeftChange,
  rightValue,
  onRightChange,
}) => {
  const editorOptions = {
    theme: "vs-dark",
    defaultLanguage: "plaintext",
    options: {
      wordWrap: "on",
      fontSize: 14,
    },
  };

  const renderLeftEditor = () => (
    <Box h="100%" w="100%" overflow="hidden">
      <Editor
        height="100%"
        value={leftValue}
        onChange={onLeftChange}
        {...editorOptions}
      />
    </Box>
  );

  if (!showRightEditor) {
    return renderLeftEditor();
  }

  return (
    <Split
      className="split-horizontal"
      sizes={[50, 50]}
      minSize={200}
      gutterSize={4}
      style={{ display: "flex", width: "100%", height: "100%" }}
    >
      {/* Left Editor */}
      {renderLeftEditor()}

      {/* Right Editor */}
      <Box h="100%" w="100%" overflow="hidden">
        <Editor
          height="100%"
          value={rightValue}
          onChange={onRightChange}
          {...editorOptions}
        />
      </Box>
    </Split>
  );
};
