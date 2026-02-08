import { Flex, Icon, Tooltip } from '@chakra-ui/react';
import { FaComments, FaList } from 'react-icons/fa';
import { BsHighlights } from 'react-icons/bs';
import { useCallback } from 'react';
import { useSuhufWorkspaceContext } from '@/context/SuhufWorkspaceContext.jsx';

import { QuranDivisionListContent } from '@/components/suhuf/sidebar/quranDivision/QuranDivisionListContent.jsx';
import { CommentsListContent } from '@/components/suhuf/sidebar/CommentsListContent.jsx';
import { HighlightsListContent } from '@/components/suhuf/sidebar/HighlightsListContent.jsx';
import { useSemanticColors } from '@/theme/hooks/useSemanticColors.js';

const sidebarTabs = [
  { label: 'List', id: 'list', icon: FaList },
  { label: 'Comments', id: 'comments', icon: FaComments },
  { label: 'Highlights', id: 'highlights', icon: BsHighlights },
];

export const ReadingSidebarPanel = ({ direction }) => {
  const { border, icon, surface } = useSemanticColors();

  const { layout, panels, updateLayout } = useSuhufWorkspaceContext();

  const readingLayouts = layout?.reading || [];
  const readingState = readingLayouts.find((r) => r.direction === direction);

  const panel = panels.find((r) => r.direction === direction);

  const activeTab = readingState?.sidebar;
  const isOpen = readingState?.sidebarOpen ?? false;

  const iconActiveColor = icon.active;
  const iconColor = icon.default;
  const iconHoverGray = icon.hover;
  const bgColor = surface.base;
  const bgContentColor = surface.content;

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

  const renderListContent = () => {
    if (!isOpen) return null;

    switch (activeTab) {
      case 'list':
        return <QuranDivisionListContent panel={panel} />;
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
        borderColor={border.default}
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
        borderColor={border.default}
        borderTopRightRadius="sm"
        borderBottomRightRadius="sm"
        p={2}
        flexDir="column"
        overflowY="auto"
        transition="transform 0.2s ease-in-out"
        transform={isOpen ? 'translateX(0)' : 'translateX(-160px)'}
        zIndex={1}
      >
        {renderListContent()}
      </Flex>
    </Flex>
  );
};
