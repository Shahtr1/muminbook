import { Flex, Icon, Tooltip, useColorModeValue } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { useSuhuf } from "@/hooks/suhuf/useSuhuf.js";
import { useUpdateSuhufConfig } from "@/hooks/suhuf/useUpdateSuhufConfig.js";
import { FaComments, FaList } from "react-icons/fa";
import { BsHighlights } from "react-icons/bs";
import { SomethingWentWrong } from "@/components/layout/SomethingWentWrong.jsx";
import { SurahsList } from "@/components/layout/reading/ui/wrapper/list/SurahsList.jsx";
import { CommentsList } from "@/components/layout/reading/ui/wrapper/list/CommentsList.jsx";
import { HighlightsList } from "@/components/layout/reading/ui/wrapper/list/HighlightsList.jsx";

const readingSidebarData = [
  { label: "List", id: "list", icon: FaList },
  { label: "Comments", id: "comments", icon: FaComments },
  {
    label: "Highlights",
    id: "highlights",
    icon: BsHighlights,
  },
];

export const RdWrapperSidebar = ({ fileId }) => {
  const { id: suhufId } = useParams();
  const { data: suhuf } = useSuhuf(suhufId);
  const { mutate: updateConfig } = useUpdateSuhufConfig(suhufId);

  const layout = suhuf?.config?.layout || {};
  const readingLayouts = layout.reading || [];

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
    <Flex h={`calc(100% - 5px)`} m="3px" overflowY="auto">
      {/* Tab icons */}
      <Flex
        h="100%"
        w="30px"
        bgColor={bgColor}
        align="center"
        flexDir="column"
        border="1px solid"
        borderColor={borderColor}
        borderTopLeftRadius="sm"
        borderBottomLeftRadius="sm"
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
              bg={
                activeTab === item.id && isOpen ? iconHoverGray : "transparent"
              }
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
        w="155px"
        bgColor={bgColor}
        align="flex-start"
        flexDir="column"
        transition="margin-left 0.2s ease-in-out"
        marginLeft={isOpen ? "0" : "-150px"}
        border="1px solid"
        borderColor={borderColor}
        borderTopRightRadius="sm"
        borderBottomRightRadius="sm"
        borderLeft="none"
        p={2}
        zIndex={isOpen ? undefined : -1}
        overflowY="auto"
      >
        {isOpen && activeTab === "highlights" && <HighlightsList />}
        {isOpen && activeTab === "comments" && <CommentsList />}
        {isOpen && activeTab === "list" && <SurahsList />}
      </Flex>
    </Flex>
  );
};
