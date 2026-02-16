import { useEffect, useState } from 'react';
import { FolderSVG } from '@/components/svgs/FolderSVG.jsx';
import { Flex, Text, Tooltip, useBreakpointValue } from '@chakra-ui/react';
import { ItemToolbar } from '@/components/explorer/toolbar/ItemToolbar.jsx';
import { ResourcesActionItems } from '@/components/explorer/components/ResourcesActionItems.jsx';
import { useAccessTracker } from '@/hooks/explorer/useAccessTracker.js';
import { useSemanticColors } from '@/theme/hooks/useSemanticColors.js';
import { useLocation } from 'react-router-dom';

export const Folder = ({
  onClick,
  width,
  folderPath,
  resource,
  dimensions: customDimensions,
  bgColor,
  shadow,
  ...rest
}) => {
  const { surface } = useSemanticColors();
  const { updateAccessedAt } = useAccessTracker();
  const location = useLocation();
  const { id, name = '', empty = true } = resource;
  const lostAndFound = resource.name === 'lost+found';
  const myFiles = resource.name === 'my-files' || !resource.name;
  const showItemToolbar = !lostAndFound && !myFiles;

  const isTrashView = location.pathname.includes('/reading/trash');
  const isFolderView =
    location.pathname.includes('/reading/my-files') || isTrashView;

  bgColor = bgColor || surface.elevated;
  const isSmallScreen = useBreakpointValue({ base: true, sm: false });
  const responsiveDimensions = useBreakpointValue({
    base: '40px',
    sm: isFolderView ? '60px' : '150px',
  });

  const dimensions = customDimensions ?? responsiveDimensions;

  shadow = shadow || (isSmallScreen && !isFolderView ? 'md' : 'none');

  const [hasMounted, setHasMounted] = useState(false);

  const handleClick = () => {
    if (!lostAndFound && !myFiles && !isTrashView) updateAccessedAt(id);
    if (onClick) onClick();
  };

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;

  return (
    <Flex
      width={width}
      align="center"
      justify="center"
      px={isSmallScreen && !isFolderView ? '10px' : 0}
      py={isSmallScreen && !isFolderView ? '5px' : 0}
      borderRadius={isSmallScreen && !isFolderView ? 'lg' : '0'}
      shadow={shadow}
      bgColor={isSmallScreen && !isFolderView ? bgColor : 'unset'}
      cursor="pointer"
      position="relative"
      {...rest}
    >
      {showItemToolbar && (
        <ItemToolbar
          right={isSmallScreen ? '-5px' : '5px'}
          children={
            <ResourcesActionItems
              resource={resource}
              pathFromUrl={folderPath}
            />
          }
        />
      )}
      <Flex
        width="100%"
        justify={isSmallScreen && !isFolderView ? 'start' : 'center'}
        align="center"
        flexDirection={isSmallScreen && !isFolderView ? 'row' : 'column'}
        onClick={handleClick}
        gap={isSmallScreen && !isFolderView ? 5 : 'unset'}
        overflow="hidden"
      >
        <FolderSVG dimensions={dimensions} empty={empty} />
        {name && (
          <Tooltip label={name} hasArrow placement="bottom">
            <Text
              fontSize={
                isFolderView
                  ? { base: '10px', sm: '13px' }
                  : { base: '13px', sm: '15px' }
              }
              color="brand.500"
              fontWeight={isFolderView ? 'medium' : 'bold'}
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
              maxWidth="100%"
            >
              {name}
            </Text>
          </Tooltip>
        )}
      </Flex>
    </Flex>
  );
};
