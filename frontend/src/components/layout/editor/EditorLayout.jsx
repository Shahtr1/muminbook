import { Box, Flex } from "@chakra-ui/react";
import Split from "react-split";
import { EditorPanel } from "./EditorPanel";
import { EditorLeftSidebar } from "@/components/layout/editor/EditorLeftSidebar.jsx";
import { EditorBottomPanel } from "@/components/layout/editor/EditorBottomPanel.jsx";

export const EditorLayout = () => {
  return (
    <Flex h="100vh" w="100vw" overflow="hidden">
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
          style={{ height: "100%", display: "flex", flexDirection: "column" }} // 👈 Fix here
        >
          <EditorPanel />
          <EditorBottomPanel />
        </Split>
      </Box>
    </Flex>
  );
};
