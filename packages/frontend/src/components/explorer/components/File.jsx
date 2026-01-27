import { useEffect, useState } from 'react';
import { Flex, Text, Tooltip, useBreakpointValue } from '@chakra-ui/react';
import { FileSVG } from '@/components/svgs/FileSVG.jsx';
import { ItemToolbar } from '@/components/explorer/toolbar/ItemToolbar.jsx';
import { ResourcesActionItems } from '@/components/explorer/components/ResourcesActionItems.jsx';

export const File = ({ onClick, width, folderPath, resource }) => {
  const dimensions = useBreakpointValue({
    base: '40px',
    sm: '60px',
  });

  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;

  return (
    <Flex
      width={width}
      cursor="pointer"
      position="relative"
      justify="center"
      align="center"
    >
      <ItemToolbar
        children={
          <ResourcesActionItems resource={resource} pathFromUrl={folderPath} />
        }
      />
      <Flex
        justify="center"
        align="center"
        flexDirection="column"
        onClick={onClick}
        overflow="hidden"
      >
        <FileSVG dimensions={dimensions} activeColor="brand.500" />
        <Tooltip label={resource.name} hasArrow placement="bottom">
          <Text
            fontSize={{ base: '10px', sm: '13px' }}
            color="brand.500"
            fontWeight="medium"
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
            maxW="100%"
          >
            {resource.name}
          </Text>
        </Tooltip>
      </Flex>
    </Flex>
  );
};
