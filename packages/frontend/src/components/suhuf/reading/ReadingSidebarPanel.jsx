import { Flex, Icon, Tooltip, useColorModeValue } from '@chakra-ui/react';
import { FaComments, FaList } from 'react-icons/fa';
import { BsHighlights } from 'react-icons/bs';
import { useCallback } from 'react';
import { useSuhufWorkspaceContext } from '@/context/SuhufWorkspaceContext.jsx';

import { QuranDivisionListContent } from '@/components/suhuf/sidebar/QuranDivisionListContent.jsx';
import { CommentsListContent } from '@/components/suhuf/sidebar/CommentsListContent.jsx';
import { HighlightsListContent } from '@/components/suhuf/sidebar/HighlightsListContent.jsx';

const sidebarTabs = [
  { label: 'List', id: 'list', icon: FaList },
  { label: 'Comments', id: 'comments', icon: FaComments },
  { label: 'Highlights', id: 'highlights', icon: BsHighlights },
];

export const ReadingSidebarPanel = ({ direction }) => {
  const { layout, updateLayout } = useSuhufWorkspaceContext();

  const readingLayouts = layout?.reading || [];
  const readingState = readingLayouts.find((r) => r.direction === direction);

  const activeTab = readingState?.sidebar;
  const isOpen = readingState?.sidebarOpen ?? false;

  const iconActiveColor = useColorModeValue('wn.bold.light', 'wn.bold.dark');
  const iconColor = useColorModeValue('wn.icon.light', 'wn.icon.dark');
  const iconHoverGray = useColorModeValue(
    'wn.icon.hover.light',
    'wn.icon.hover.dark'
  );
  const bgColor = useColorModeValue('wn.bg.light', 'wn.bg.dark');
  const bgContentColor = useColorModeValue(
    'wn.bg_content.light',
    'wn.bg_content.dark'
  );
  const borderColor = useColorModeValue('gray.300', 'whiteAlpha.500');

  const toggleTab = useCallback(
    (tabKey) => {
      const entry = readingLayouts.find((r) => r.direction === direction);

      let newReadingLayouts;

      if (!entry) {
        newReadingLayouts = [
          ...readingLayouts,
          { direction, sidebar: tabKey, sidebarOpen: true },
        ];
      } else {
        const newSidebarOpen =
          entry.sidebar === tabKey ? !entry.sidebarOpen : true;

        newReadingLayouts = readingLayouts.map((r) =>
          r.direction === direction
            ? { ...r, sidebar: tabKey, sidebarOpen: newSidebarOpen }
            : r
        );
      }

      updateLayout({ reading: newReadingLayouts });
    },
    [readingLayouts, direction, updateLayout]
  );

  const renderContent = () => {
    if (!isOpen) return null;

    switch (activeTab) {
      case 'list':
        return <QuranDivisionListContent />;
      case 'comments':
        return <CommentsListContent />;
      case 'highlights':
        return <HighlightsListContent />;
      default:
        return null;
    }
  };

  return (
    <Flex m="3px" marginLeft={0} position="relative" zIndex={3}>
      {/* Sidebar hider - workaround */}
      <Flex w="3px" bgColor={bgContentColor} zIndex={2}></Flex>

      {/* Icon bar */}
      <Flex
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
        {sidebarTabs.map((item) => (
          <Tooltip
            key={item.id}
            variant="inverted"
            label={item.label}
            placement="right"
          >
            <Flex
              _hover={{ bg: iconHoverGray }}
              bg={
                activeTab === item.id && isOpen ? iconHoverGray : 'transparent'
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

      {/* Sidebar content */}
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
        transform={isOpen ? 'translateX(0)' : 'translateX(-160px)'}
        zIndex={1}
      >
        {renderContent()}
      </Flex>
    </Flex>
  );
};
