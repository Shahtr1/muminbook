import { Box, Flex, Text, Tooltip, useColorModeValue } from '@chakra-ui/react';
import { BsPinAngle, BsPinAngleFill } from 'react-icons/bs';
import { useTogglePinResource } from '@/hooks/explorer/useTogglePinResource.js';
import { useLocation, useNavigate } from 'react-router-dom';

const OverviewItem = ({ item, isPinned }) => {
  const { mutate: togglePinResource } = useTogglePinResource();
  const location = useLocation();
  const activePath = decodeURIComponent(
    location.pathname.replace(/^\/reading\//, '')
  );
  const navigate = useNavigate();
  const activeBg = useColorModeValue('gray.100', 'gray.700');
  const textDefaultColor = useColorModeValue('text.primary', 'whiteAlpha.900');

  const togglePin = (e) => {
    e.stopPropagation();
    if (item.name !== 'my-files') {
      togglePinResource({ id: item._id, pinned: isPinned });
    }
  };

  const goTo = (path) => {
    if (path) {
      navigate(path.replace('lost+found', 'lost%2Bfound'));
    }
  };

  return (
    <Flex key={item._id} w="100%" py="1px" px={2}>
      <Flex
        w="100%"
        role="group"
        cursor="pointer"
        align="center"
        justify="space-between"
        _hover={{ bg: activeBg }}
        borderRadius="sm"
        px={1}
        py="1px"
        onClick={() => goTo(item.path)}
      >
        <Tooltip label={item.name} hasArrow placement="bottom">
          <Text
            fontSize="13px"
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
            _groupHover={{ color: 'brand.600' }}
            color={activePath === item.path ? 'brand.600' : textDefaultColor}
          >
            {item.name === 'my-files' ? 'My Files' : item.name}
          </Text>
        </Tooltip>

        {isPinned ? (
          <BsPinAngleFill fontSize="14px" onClick={togglePin} />
        ) : (
          <Box display="none" _groupHover={{ display: 'inline-block' }}>
            <BsPinAngle fontSize="14px" onClick={togglePin} />
          </Box>
        )}
      </Flex>
    </Flex>
  );
};

export const ResourcesOverview = ({ overview }) => {
  const { pinned, quickAccess } = overview;

  return (
    <Flex flexDir="column" maxH="180px" minH="145px" overflowY="auto">
      {pinned.map((item) => (
        <OverviewItem key={item._id} item={item} isPinned={true} />
      ))}
      {quickAccess.map((item) => (
        <OverviewItem key={item._id} item={item} isPinned={false} />
      ))}
    </Flex>
  );
};
