import {
  Flex,
  Text,
  Tooltip,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react';
import { useEffect, useMemo, useCallback } from 'react';
import { sidebarMenuData } from '@/data/sidebarMenuData.js';
import { useSuhufWorkspaceContext } from '@/context/SuhufWorkspaceContext.jsx';

export const WorkspaceSidebar = () => {
  const { layout, updateLayout } = useSuhufWorkspaceContext();

  const iconActiveColor = useColorModeValue('wn.bold.light', 'wn.bold.dark');
  const iconColor = useColorModeValue('wn.icon.light', 'wn.icon.dark');
  const bgColor = useColorModeValue('wn.bg.light', 'wn.bg.dark');
  const borderColor = useColorModeValue('gray.300', 'whiteAlpha.500');

  const width = '150px';

  const activeTab = layout?.leftTab;
  const isOpen = layout?.isLeftTabOpen;

  /**
   * Ensure default tab when opened
   */
  useEffect(() => {
    if (isOpen && !activeTab) {
      updateLayout({ leftTab: 'explorer' });
    }
  }, [isOpen, activeTab, updateLayout]);

  /**
   * Toggle sidebar tab
   */
  const toggleTab = useCallback(
    (tabKey) => {
      const isSame = tabKey === activeTab;

      updateLayout({
        leftTab: tabKey,
        isLeftTabOpen: isSame ? !isOpen : true,
      });
    },
    [activeTab, isOpen, updateLayout]
  );

  const activeTabData = useMemo(
    () => sidebarMenuData.find((tab) => tab.key === activeTab),
    [activeTab]
  );

  const ActiveComponent = activeTabData?.component;

  const activeContent =
    isOpen && activeTabData && ActiveComponent ? (
      <Flex flexDir="column" w="100%" overflow="auto">
        <Text fontSize="xs" fontWeight="bold" mb={2}>
          {activeTabData.label}
        </Text>
        <Flex overflow="auto" pr={1}>
          <ActiveComponent />
        </Flex>
      </Flex>
    ) : null;

  return (
    <Flex h="100%">
      {/* Icon bar */}
      <Flex
        w="40px"
        bg={bgColor}
        pt={5}
        pb={2}
        borderRight="1px solid"
        borderColor={borderColor}
        zIndex={1}
      >
        <VStack spacing={5} align="center" w="100%" overflow="auto">
          {sidebarMenuData.map(({ key, label, icon: Icon }) => (
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
        py={5}
        borderRight="1px solid"
        borderColor={borderColor}
        transition="margin-left 0.3s ease-in-out"
        marginLeft={isOpen ? '0' : `-${width}`}
        h="100%"
      >
        <VStack spacing={5} align="flex-start" w="100%" pl={2} h="100%">
          {activeContent}
        </VStack>
      </Flex>
    </Flex>
  );
};
