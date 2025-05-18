import { Flex, useColorMode } from "@chakra-ui/react";
import Split from "react-split";
import { SuhufPanel } from "./SuhufPanel.jsx";
import { SuhufLeftSidebar } from "@/components/layout/suhuf/SuhufLeftSidebar.jsx";
import { SuhufBottomPanel } from "@/components/layout/suhuf/bottomPanel/SuhufBottomPanel.jsx";
import { SuhufBottomPanelHeader } from "@/components/layout/suhuf/bottomPanel/SuhufBottomPanelHeader.jsx";

export const SuhufLayout = ({ readings, suhuf }) => {
  const { colorMode } = useColorMode();
  const layout = suhuf?.config?.layout || {};
  const isBottomOpen = layout?.isBottomTabOpen;

  const sizes = isBottomOpen ? [75, 25] : [100];

  return (
    <Flex h="100%" w="100%" pos="relative" zIndex={1}>
      <SuhufLeftSidebar />

      {/* Main Content Area */}
      <Flex flex="1" display="flex" flexDirection="column" overflow="auto">
        <Split
          key={`bottom-open-${isBottomOpen}`}
          direction="vertical"
          sizes={sizes}
          minSize={isBottomOpen ? [200, 100] : [200]}
          gutterSize={3}
          className={colorMode === "dark" ? "gutter-dark" : "gutter-light"}
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
          }}
        >
          {/* Main Panel */}
          <Flex overflowY="auto" position="relative">
            <SuhufPanel />
          </Flex>

          {isBottomOpen ? (
            <SuhufBottomPanel readings={readings} suhuf={suhuf} />
          ) : (
            <div />
          )}
        </Split>
        {!isBottomOpen && (
          <SuhufBottomPanelHeader readings={readings} suhuf={suhuf} />
        )}
      </Flex>
    </Flex>
  );
};
