import { Flex, useColorMode } from "@chakra-ui/react";
import Split from "react-split";
import { SuhufPanel } from "./SuhufPanel.jsx";
import { SuhufLeftSidebar } from "@/components/layout/suhuf/SuhufLeftSidebar.jsx";
import { useParams } from "react-router-dom";
import { useSuhuf } from "@/hooks/suhuf/useSuhuf.js";
import { SuhufBottomPanel } from "@/components/layout/suhuf/bottomPanel/SuhufBottomPanel.jsx";
import { SuhufBottomPanelHeader } from "@/components/layout/suhuf/bottomPanel/SuhufBottomPanelHeader.jsx";
import { useReading } from "@/hooks/useReading.js";

export const SuhufLayout = () => {
  const { colorMode } = useColorMode();
  const { id: suhufId } = useParams();
  const { data: suhuf } = useSuhuf(suhufId);
  const { readings, isPending, isError, isSuccess } = useReading();

  const layout = suhuf?.config?.layout || {};
  const isBottomOpen = layout?.isBottomTabOpen;

  const sizes = isBottomOpen ? [75, 25] : [100];

  return (
    <Flex h="100%" w="100%" pos="relative" zIndex={1}>
      <SuhufLeftSidebar />

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
          <Flex overflowY="auto" position="relative">
            <SuhufPanel />
          </Flex>

          {isBottomOpen ? <SuhufBottomPanel /> : <div />}
        </Split>
        {!isBottomOpen && <SuhufBottomPanelHeader hasBorder data={readings} />}
      </Flex>
    </Flex>
  );
};
