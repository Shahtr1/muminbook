import {
  Flex,
  MenuItem,
  Text,
  useBreakpointValue,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  HiArrowCircleUp,
  HiDuplicate,
  HiFolder,
  HiPencilAlt,
  HiTrash,
} from 'react-icons/hi';
import { useLocation } from 'react-router-dom';
import { BsPinAngle, BsPinAngleFill } from 'react-icons/bs';

export const ActionItems = ({
  variant = 'resources',
  type = 'folder',
  pinned = false,
  onRename,
  onCopy,
  onMoveToFolder,
  onMoveToTrash,
  onRestore,
  onDelete,
  onRestoreAll,
  onEmptyTrash,
  onPin,
}) => {
  const bg = useColorModeValue('gray.100', 'gray.700');
  const location = useLocation();
  const isTrashView = location.pathname.includes('/reading/trash');
  const isLostAndFound = location.pathname.includes(
    '/reading/my-files/lost%2Bfound'
  );
  const currentIsTrash = isTrashView && variant === 'resources';

  // Responsive sizing
  const iconSize = useBreakpointValue({ base: '13px', sm: '15px' });
  const fontSize = useBreakpointValue({ base: '11px', sm: '13px' });
  const gapSize = useBreakpointValue({ base: 1, sm: 2 });
  const paddingY = useBreakpointValue({ base: 1, sm: 2 });

  const renderItem = (icon, label, color, onClick, isDisabled = false) => (
    <MenuItem
      onClick={onClick}
      isDisabled={isDisabled}
      py={paddingY}
      _hover={{ bg, color }}
      color={color}
    >
      <Flex align="center" gap={gapSize}>
        {icon}
        <Text fontSize={fontSize} color={color}>
          {label}
        </Text>
      </Flex>
    </MenuItem>
  );

  // Trash view (bulk actions)
  if (variant === 'trash') {
    return (
      <>
        {renderItem(
          <HiArrowCircleUp
            size={iconSize}
            color="var(--chakra-colors-green-500)"
          />,
          'Restore All',
          'green.500',
          onRestoreAll
        )}
        {renderItem(
          <HiTrash size={iconSize} color="var(--chakra-colors-red-500)" />,
          'Empty Trash',
          'red.500',
          onEmptyTrash
        )}
      </>
    );
  }

  // Reading card placeholder
  if (variant === 'readingCard') {
    return (
      <>
        {renderItem(
          <HiPencilAlt size={iconSize} />,
          'Coming Soon',
          undefined,
          null,
          true
        )}
      </>
    );
  }

  // Resource item / trash item actions
  return (
    <>
      {currentIsTrash ? (
        <>
          {renderItem(
            <HiArrowCircleUp
              size={iconSize}
              color="var(--chakra-colors-green-500)"
            />,
            'Restore',
            'green.500',
            onRestore
          )}
          {renderItem(
            <HiTrash size={iconSize} color="var(--chakra-colors-red-500)" />,
            'Delete',
            'red.500',
            onDelete
          )}
        </>
      ) : (
        <>
          {renderItem(
            <HiPencilAlt size={iconSize} />,
            'Rename',
            undefined,
            onRename
          )}
          {type === 'folder' &&
            renderItem(
              pinned ? (
                <BsPinAngleFill size={iconSize} />
              ) : (
                <BsPinAngle size={iconSize} />
              ),
              pinned ? 'Unpin' : 'Pin',
              undefined,
              onPin
            )}

          {!isLostAndFound &&
            renderItem(
              <HiDuplicate size={iconSize} />,
              'Copy',
              undefined,
              onCopy
            )}
          {renderItem(
            <HiFolder size={iconSize} />,
            'Move to Folder',
            undefined,
            onMoveToFolder
          )}
          {renderItem(
            <HiTrash size={iconSize} color="var(--chakra-colors-red-500)" />,
            'Move to Trash',
            'red.500',
            onMoveToTrash
          )}
        </>
      )}
    </>
  );
};
