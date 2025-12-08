import { Flex, Icon, Tooltip, useColorModeValue } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { useUpdateSuhufConfig } from "@/hooks/suhuf/useUpdateSuhufConfig.js";
import { FaComments, FaList } from "react-icons/fa";
import { BsHighlights } from "react-icons/bs";
import { SomethingWentWrong } from "@/components/layout/SomethingWentWrong.jsx";
import { SurahsList } from "@/components/layout/reading/ui/wrapper/list/SurahsList.jsx";
import { CommentsList } from "@/components/layout/reading/ui/wrapper/list/CommentsList.jsx";
import { HighlightsList } from "@/components/layout/reading/ui/wrapper/list/HighlightsList.jsx";
import { VscFilterFilled } from "react-icons/vsc";
import { FilterAyatList } from "@/components/layout/reading/ui/wrapper/list/FilterAyatList.jsx";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const readingSidebarData = [
  { label: "List", id: "list", icon: FaList },
  { label: "Filter ayats", id: "filter", icon: VscFilterFilled },
  { label: "Comments", id: "comments", icon: FaComments },
  { label: "Highlights", id: "highlights", icon: BsHighlights },
];

export const RdWrapperSidebar = ({ fileId }) => {
  const queryClient = useQueryClient();
  const { id: suhufId } = useParams();

  const { data: suhuf } = useQuery({
    queryKey: ["suhuf", suhufId],
    queryFn: () => queryClient.getQueryData(["suhuf", suhufId]),
    staleTime: 0,
  });

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
  const bgContentColor = useColorModeValue(
    "wn.bg_content.light",
    "wn.bg_content.dark",
  );
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
    <Flex
      h="calc(100% - 5px)"
      m="3px"
      marginLeft={0}
      position="relative"
      zIndex={3}
    >
      {/* Tab icons */}
      <Flex h="100%" w="3px" bgColor={bgContentColor} zIndex={2}></Flex>
      <Flex
        h="100%"
        w="30px"
        bgColor={bgColor}
        align="center"
        flexDir="column"
        border="1px solid"
        borderColor={borderColor}
        gap={2}
        py={2}
        zIndex={2}
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

      {/* Sliding content panel */}
      <Flex
        position="absolute"
        top={0}
        left="30px"
        h="100%"
        w="160px"
        bgColor={bgColor}
        border="1px solid"
        borderLeft="none"
        borderColor={borderColor}
        borderTopRightRadius="sm"
        borderBottomRightRadius="sm"
        p={2}
        flexDir="column"
        overflowY="auto"
        transition="transform 0.2s ease-in-out"
        transform={isOpen ? "translateX(0)" : "translateX(-160px)"}
        zIndex={1}
      >
        {isOpen && activeTab === "highlights" && <HighlightsList />}
        {isOpen && activeTab === "comments" && <CommentsList />}
        {isOpen && activeTab === "list" && <SurahsList />}
        {isOpen && activeTab === "filter" && <FilterAyatList />}
      </Flex>
    </Flex>
  );
};
