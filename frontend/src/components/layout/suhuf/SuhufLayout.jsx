import { Flex, useColorMode } from "@chakra-ui/react";
import Split from "react-split";
import { SuhufPanel } from "./SuhufPanel.jsx";
import { SuhufLeftSidebar } from "@/components/layout/suhuf/SuhufLeftSidebar.jsx";
import { SuhufBottomPanel } from "@/components/layout/suhuf/bottomPanel/SuhufBottomPanel.jsx";
import { SuhufBottomPanelHeader } from "@/components/layout/suhuf/bottomPanel/SuhufBottomPanelHeader.jsx";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const SuhufLayout = ({ readings }) => {
  const { colorMode } = useColorMode();
  const { id: suhufId } = useParams();
  const queryClient = useQueryClient();
  const { data: suhuf } = useQuery({
    queryKey: ["suhuf", suhufId],
    queryFn: () => queryClient.getQueryData(["suhuf", suhufId]),
    staleTime: 0,
  });

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

          {isBottomOpen ? <SuhufBottomPanel readings={readings} /> : <div />}
        </Split>
        {!isBottomOpen && <SuhufBottomPanelHeader readings={readings} />}
      </Flex>
    </Flex>
  );
};
