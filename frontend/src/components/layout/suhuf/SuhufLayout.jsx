import { Box, Flex, useColorMode } from "@chakra-ui/react";
import Split from "react-split";
import { SuhufPanel } from "./SuhufPanel.jsx";
import { SuhufLeftSidebar } from "@/components/layout/suhuf/SuhufLeftSidebar.jsx";
import { SuhufBottomPanel } from "@/components/layout/suhuf/SuhufBottomPanel.jsx";

export const SuhufLayout = () => {
  const { colorMode } = useColorMode();

  return (
    <Flex h="100%" w="100%" pos="relative" zIndex={1}>
      <SuhufLeftSidebar />

      <Box flex="1" display="flex" flexDirection="column" overflow="auto">
        <Split
          direction="vertical"
          sizes={[75, 25]}
          minSize={100}
          gutterSize={2}
          className={colorMode === "dark" ? "gutter-dark" : "gutter-light"}
          style={{ height: "100%", display: "flex", flexDirection: "column" }}
        >
          <Flex overflowY="auto" position="relative">
            <SuhufPanel />
          </Flex>

          <SuhufBottomPanel />
        </Split>
      </Box>
    </Flex>
  );
};
