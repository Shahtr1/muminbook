import { Box, Flex, Icon, Tooltip } from '@chakra-ui/react';
import { useState } from 'react';
import { FaComment, FaHighlighter } from 'react-icons/fa';
import { FaArrowPointer } from 'react-icons/fa6';
import { RiFullscreenExitFill, RiFullscreenFill } from 'react-icons/ri';
import { useSemanticColors } from '@/theme/hooks/useSemanticColors.js';

export const ReadingToolSidebar = ({ onToolSelect }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { border, surface, icon } = useSemanticColors();

  const bgColor = surface.base;
  const iconColor = icon.default;
  const iconHoverGray = icon.hover;

  const baseTools = [
    { label: 'Select text', id: 'text-select', icon: FaArrowPointer },
    { label: 'Add a comment', id: 'comment', icon: FaComment },
    { label: 'Highlight text', id: 'highlight', icon: FaHighlighter },
  ];

  const fullScreenTool = isFullscreen
    ? {
        label: 'Exit full screen',
        id: 'exitFullScreen',
        icon: RiFullscreenExitFill,
      }
    : { label: 'Full screen', id: 'fullScreen', icon: RiFullscreenFill };

  const handleClick = (id) => {
    if (id === 'fullScreen') setIsFullscreen(true);
    if (id === 'exitFullScreen') setIsFullscreen(false);
    onToolSelect?.(id);
  };

  return (
    <Box
      h="fit-content"
      borderRadius="sm"
      border="1px solid"
      borderColor={border.default}
      m="3px"
    >
      <Flex
        h="100%"
        w="25px"
        bgColor={bgColor}
        align="center"
        flexDir="column"
        gap={2}
        py={2}
      >
        {[...baseTools, fullScreenTool].map((item) => (
          <Tooltip
            key={item.id}
            label={item.label}
            placement="left"
            variant="inverted"
          >
            <Flex
              _hover={{ bg: iconHoverGray }}
              w="80%"
              justify="center"
              p={1}
              borderRadius="sm"
              cursor="pointer"
              onClick={() => handleClick(item.id)}
            >
              <Icon as={item.icon} boxSize={3} color={iconColor} />
            </Flex>
          </Tooltip>
        ))}
      </Flex>
    </Box>
  );
};
