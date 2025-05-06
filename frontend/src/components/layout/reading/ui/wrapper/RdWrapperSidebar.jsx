import { Box, Flex, Icon, Tooltip, useColorModeValue } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { useSuhuf } from "@/hooks/suhuf/useSuhuf.js";
import { useUpdateSuhufConfig } from "@/hooks/suhuf/useUpdateSuhufConfig.js";
import { FaComments, FaList } from "react-icons/fa";
import { BsHighlights } from "react-icons/bs";
import { SomethingWentWrong } from "@/components/layout/SomethingWentWrong.jsx";

const readingSidebarData = [
  { label: "List", id: "list", icon: FaList },
  { label: "Comments", id: "comments", icon: FaComments },
  { label: "Highlights", id: "highlights", icon: BsHighlights },
];

export const RdWrapperSidebar = () => {
  const { id: suhufId } = useParams();
  const { data: suhuf } = useSuhuf(suhufId);
  const { mutate: updateConfig } = useUpdateSuhufConfig(suhufId);

  const layout = suhuf?.config?.layout || {};
  const readingLayouts = layout.reading || [];
  const panels = suhuf?.config?.panels || [];
  const activePanel = panels.find((p) => p.active);
  const fileId = activePanel?.fileId;

  const iconActiveColor = useColorModeValue("wn.bold.light", "wn.bold.dark");
  const iconColor = useColorModeValue("wn.icon.light", "wn.icon.dark");
  const iconHoverGray = useColorModeValue(
    "wn.icon.hover.light",
    "wn.icon.hover.dark",
  );
  const bgColor = useColorModeValue("wn.bg.light", "wn.bg.dark");
  const borderColor = useColorModeValue("gray.300", "whiteAlpha.500");

  if (!fileId) {
    console.error("No file id found in reading layout.");
    return <SomethingWentWrong />;
  }

  const readingState = readingLayouts.find((r) => r.id === fileId);
  const activeTab = readingState?.sidebar;
  const isOpen = readingState?.sidebarOpen ?? false;

  const toggleTab = (tabKey) => {
    const isSame = tabKey === activeTab;
    const updatedReadingLayouts = readingLayouts.map((r) =>
      r.id === fileId
        ? {
            ...r,
            sidebar: tabKey,
            sidebarOpen: isSame ? !isOpen : true,
          }
        : r,
    );

    const fileExists = readingLayouts.some((r) => r.id === fileId);
    if (!fileExists) {
      updatedReadingLayouts.push({
        id: fileId,
        sidebar: tabKey,
        sidebarOpen: true,
      });
    }

    updateConfig({
      layout: {
        ...layout,
        reading: updatedReadingLayouts,
      },
    });
  };

  return (
    <Flex h="100%">
      {/* Tab icons */}
      <Flex
        h="100%"
        w="30px"
        bgColor={bgColor}
        align="center"
        flexDir="column"
        borderRight="1px solid"
        borderRightColor={borderColor}
        gap={2}
        py={2}
        zIndex={1}
      >
        {readingSidebarData.map((item) => (
          <Tooltip
            variant="inverted"
            label={item.label}
            key={item.id}
            placement="right"
          >
            <Flex
              _hover={{ bg: iconHoverGray }}
              w="80%"
              justify="center"
              p={1}
              borderRadius="sm"
              cursor="pointer"
              onClick={() => toggleTab(item.id)}
            >
              <Icon
                as={item.icon}
                boxSize={3}
                color={
                  activeTab === item.id && isOpen ? iconActiveColor : iconColor
                }
              />
            </Flex>
          </Tooltip>
        ))}
      </Flex>

      {/* Content panel */}
      <Flex
        h="100%"
        w="150px"
        bgColor={bgColor}
        align="flex-start"
        flexDir="column"
        borderRight="1px solid"
        borderRightColor={borderColor}
        transition="margin-left 0.2s ease-in-out"
        marginLeft={isOpen ? "0" : "-150px"}
        p={2}
      >
        {isOpen && activeTab === "highlights" && <Box>Highlight content</Box>}
        {isOpen && activeTab === "comments" && <Box>Comment content</Box>}
        {isOpen && activeTab === "list" && <Box>List content</Box>}
      </Flex>
    </Flex>
  );
};
