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

export const EditorLeftSidebar = () => {
  const queryClient = useQueryClient();

  const iconActiveColor = useColorModeValue("wn.bold.light", "wn.bold.dark");
  const iconColor = useColorModeValue("wn.icon.light", "wn.icon.dark");
  const bgColor = useColorModeValue("wn.bg.light", "wn.bg.dark");
  const borderColor = useColorModeValue("gray.300", "whiteAlpha.500");

  const width = "150px";

  const { data: sidebarState = {} } = useQuery({
    queryKey: ["sidebarState"],
    queryFn: () => queryClient.getQueryData(["sidebarState"]) ?? {},
    staleTime: Infinity,
  });

  const activeTab = sidebarState.leftTab;
  const isOpen = sidebarState.leftTabOpen;

  useEffect(() => {
    if (isOpen && !activeTab) {
      queryClient.setQueryData(["sidebarState"], (prev = {}) => ({
        ...prev,
        leftTab: "readings",
      }));
    }
  }, [isOpen, activeTab, queryClient]);

  const toggleTab = (tab) => {
    queryClient.setQueryData(["sidebarState"], (prev = {}) => {
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
      {children}
    </Flex>
  );

  const contentMap = {
    readings: content("Readings", <Flex>📖 hi</Flex>),
    search: content("Search", <Flex>🔍 Bi</Flex>),
  };

  const activeContent = isOpen && activeTab ? contentMap[activeTab] : null;

  return (
    <Flex>
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
          <Tooltip variant="inverted" label="Readings" placement="right">
            <Flex
              color={
                activeTab === "readings" && isOpen ? iconActiveColor : iconColor
              }
              _hover={{ color: iconActiveColor }}
              cursor="pointer"
              onClick={() => toggleTab("readings")}
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
      >
        <VStack spacing={5} align="flex-start" w="100%" px={4}>
          {activeContent}
        </VStack>
      </Flex>
    </Flex>
  );
};
