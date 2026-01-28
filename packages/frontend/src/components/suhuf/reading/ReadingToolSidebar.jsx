import { Box, Flex, Icon, Tooltip, useColorModeValue } from '@chakra-ui/react';
import { useState } from 'react';
import { FaComment, FaHighlighter } from 'react-icons/fa';
import { FaArrowPointer } from 'react-icons/fa6';
import { RiFullscreenExitFill, RiFullscreenFill } from 'react-icons/ri';

export const ReadingToolSidebar = ({ onToolSelect }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const bgColor = useColorModeValue('wn.bg.light', 'wn.bg.dark');
  const borderColor = useColorModeValue('gray.300', 'whiteAlpha.500');
  const iconColor = useColorModeValue('wn.icon.light', 'wn.icon.dark');
  const iconHoverGray = useColorModeValue(
    'wn.icon.hover.light',
    'wn.icon.hover.dark'
  );

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
      borderColor={borderColor}
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
