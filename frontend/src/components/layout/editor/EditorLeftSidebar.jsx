import {
  Flex,
  Text,
  Tooltip,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import { BsFiles, BsSearch } from "react-icons/bs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { getDefaultSidebarState } from "@/components/layout/sidebar/getDefaultSidebarState.js";
import { useParams } from "react-router-dom";
import { ResourcesTree } from "@/components/layout/reading/resources/ResourcesTree.jsx";

export const EditorLeftSidebar = () => {
  const { id: suhufId } = useParams();
  const queryClient = useQueryClient();

  const iconActiveColor = useColorModeValue("wn.bold.light", "wn.bold.dark");
  const iconColor = useColorModeValue("wn.icon.light", "wn.icon.dark");
  const bgColor = useColorModeValue("wn.bg.light", "wn.bg.dark");
  const borderColor = useColorModeValue("gray.300", "whiteAlpha.500");

  const width = "150px";

  const { data: sidebarState = {} } = useQuery({
    queryKey: ["sidebarState", suhufId],
    queryFn: () =>
      queryClient.getQueryData(["sidebarState", suhufId]) ??
      getDefaultSidebarState(),
    staleTime: Infinity,
  });

  const activeTab = sidebarState.leftTab;
  const isOpen = sidebarState.leftTabOpen;

  useEffect(() => {
    if (isOpen && !activeTab) {
      queryClient.setQueryData(["sidebarState", suhufId], (prev = {}) => ({
        ...prev,
        leftTab: "explorer",
      }));
    }
  }, [isOpen, activeTab, queryClient, suhufId]);

  const toggleTab = (tab) => {
    queryClient.setQueryData(["sidebarState", suhufId], (prev = {}) => {
      const isSameTab = prev.leftTab === tab;
      return {
        ...prev,
        leftTab: tab,
        leftTabOpen: isSameTab ? !prev.leftTabOpen : true,
      };
    });
  };

  const content = (title, children) => (
    <Flex flexDir="column" w="100%">
      <Text fontSize="xs" fontWeight="bold" mb={2}>
        {title}
      </Text>
      <Flex overflow="auto" pr={1}>
        {children}
      </Flex>
    </Flex>
  );

  const contentMap = {
    explorer: content(
      "Explorer",
      <Flex h="100%">
        <ResourcesTree
          onSelect={(path) => {
            console.log("path", path);
          }}
          isSmall={true}
        />
      </Flex>,
    ),
    search: content("Search", <Flex>🔍 Bi</Flex>),
  };

  const activeContent = isOpen && activeTab ? contentMap[activeTab] : null;

  return (
    <Flex h="100%">
      {/* Icons */}
      <Flex
        w="40px"
        bg={bgColor}
        color="white"
        py={5}
        borderRight="1px solid"
        borderColor={borderColor}
        zIndex={1}
      >
        <VStack spacing={5} align="center" w="100%">
          <Tooltip variant="inverted" label="Explorer" placement="right">
            <Flex
              color={
                activeTab === "explorer" && isOpen ? iconActiveColor : iconColor
              }
              _hover={{ color: iconActiveColor }}
              cursor="pointer"
              onClick={() => toggleTab("explorer")}
            >
              <BsFiles size="20px" />
            </Flex>
          </Tooltip>

          <Tooltip variant="inverted" label="Search" placement="right">
            <Flex
              color={
                activeTab === "search" && isOpen ? iconActiveColor : iconColor
              }
              _hover={{ color: iconActiveColor }}
              cursor="pointer"
              onClick={() => toggleTab("search")}
            >
              <BsSearch size="20px" />
            </Flex>
          </Tooltip>
        </VStack>
      </Flex>

      {/* Sidebar content */}
      <Flex
        w={width}
        bg={bgColor}
        color="white"
        py={5}
        borderRight="1px solid"
        borderColor={borderColor}
        transition="margin-left 0.3s ease-in-out"
        marginLeft={isOpen ? "0" : `-${width}`}
        h="100%"
      >
        <VStack spacing={5} align="flex-start" w="100%" pl={2} h="100%">
          {activeContent}
        </VStack>
      </Flex>
    </Flex>
  );
};
