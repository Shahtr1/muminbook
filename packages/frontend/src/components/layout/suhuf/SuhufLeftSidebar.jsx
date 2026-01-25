import {
  Flex,
  Text,
  Tooltip,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react';
import { useEffect } from 'react';
import { sidebarMenuData } from '@/data/sidebarMenuData.jsx';
import { useUpdateSuhufConfig } from '@/hooks/suhuf/useUpdateSuhufConfig.js';
import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const SuhufLeftSidebar = ({ suhuf }) => {
  const { id: suhufId } = useParams();
  const { mutate: updateConfig } = useUpdateSuhufConfig(suhufId);

  const iconActiveColor = useColorModeValue('wn.bold.light', 'wn.bold.dark');
  const iconColor = useColorModeValue('wn.icon.light', 'wn.icon.dark');
  const bgColor = useColorModeValue('wn.bg.light', 'wn.bg.dark');
  const borderColor = useColorModeValue('gray.300', 'whiteAlpha.500');

  const width = '150px';

  const layout = suhuf?.config?.layout || {};
  const activeTab = layout.leftTab;
  const isOpen = layout.isLeftTabOpen;

  // Set default tab if panel is open and no tab selected
  useEffect(() => {
    if (isOpen && !activeTab) {
      updateConfig({
        layout: {
          ...layout,
          leftTab: 'explorer',
        },
      });
    }
  }, [isOpen, activeTab, layout, updateConfig]);

  const toggleTab = (tabKey) => {
    const isSame = tabKey === activeTab;
    updateConfig({
      layout: {
        ...layout,
        leftTab: tabKey,
        isLeftTabOpen: isSame ? !isOpen : true,
      },
    });
  };

  const activeTabData = sidebarMenuData.find((tab) => tab.key === activeTab);
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
        color="white"
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
