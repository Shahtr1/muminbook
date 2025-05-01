import {
  Flex,
  Text,
  Tooltip,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { getDefaultSidebarState } from "@/components/layout/sidebar/getDefaultSidebarState.js";
import { sidebarTabs } from "@/data/sidebarTabs.jsx";

export const SuhufLeftSidebar = () => {
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

  const toggleTab = (tabKey) => {
    queryClient.setQueryData(["sidebarState", suhufId], (prev = {}) => {
      const isSameTab = prev.leftTab === tabKey;
      return {
        ...prev,
        leftTab: tabKey,
        leftTabOpen: isSameTab ? !prev.leftTabOpen : true,
      };
    });
  };

  const activeTabData = sidebarTabs.find((tab) => tab.key === activeTab);
  const activeContent =
    isOpen && activeTabData ? (
      <Flex flexDir="column" w="100%" overflow="auto">
        <Text fontSize="xs" fontWeight="bold" mb={2}>
          {activeTabData.label}
        </Text>
        <Flex overflow="auto" pr={1}>
          {activeTabData.renderContent()}
        </Flex>
      </Flex>
    ) : null;

  return (
    <Flex h="100%">
      {/* Icon bar */}
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
          {sidebarTabs.map(({ key, label, icon: Icon }) => (
            <Tooltip
              key={key}
              variant="inverted"
              label={label}
              placement="right"
            >
              <Flex
                color={
                  activeTab === key && isOpen ? iconActiveColor : iconColor
                }
                _hover={{ color: iconActiveColor }}
                cursor="pointer"
                onClick={() => toggleTab(key)}
              >
                <Icon size="20px" />
              </Flex>
            </Tooltip>
          ))}
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
