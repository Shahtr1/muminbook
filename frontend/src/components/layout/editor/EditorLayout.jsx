import { Box, Flex } from "@chakra-ui/react";
import Split from "react-split";
import { EditorPanel } from "./EditorPanel";
import { EditorLeftSidebar } from "@/components/layout/editor/EditorLeftSidebar.jsx";
import { EditorBottomPanel } from "@/components/layout/editor/EditorBottomPanel.jsx";

export const EditorLayout = () => {
  return (
    <Flex h="100%" w="100%" pos="relative" zIndex={1}>
      {/* LEFT SIDEBAR */}
      <EditorLeftSidebar />

      {/* MAIN AREA */}
      <Box flex="1" display="flex" flexDirection="column" overflow="hidden">
        <Split
          direction="vertical"
          sizes={[75, 25]}
          minSize={100}
          gutterSize={4}
          className="split-vertical"
          style={{ height: "100%", display: "flex", flexDirection: "column" }}
        >
          <EditorPanel />
          <EditorBottomPanel />
        </Split>
      </Box>
    </Flex>
  );
};
