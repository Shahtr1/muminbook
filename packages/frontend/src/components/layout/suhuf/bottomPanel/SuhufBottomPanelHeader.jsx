import { useUpdateSuhufConfig } from '@/hooks/suhuf/useUpdateSuhufConfig.js';
import { Flex, Icon, Text, useColorModeValue } from '@chakra-ui/react';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const SuhufBottomPanelHeader = ({
  hasBorder = false,
  readings = [],
}) => {
  const { id: suhufId } = useParams();
  const queryClient = useQueryClient();
  const { data: suhuf } = useQuery({
    queryKey: ['suhuf', suhufId],
    queryFn: () => queryClient.getQueryData(['suhuf', suhufId]),
    staleTime: 0,
  });
  const { mutate: updateConfig } = useUpdateSuhufConfig(suhufId);

  const layout = suhuf?.config?.layout || {};
  const isOpen = layout?.isBottomTabOpen || false;

  const toggleBottomTab = () => {
    const newOpen = !isOpen;

    updateConfig({
      layout: {
        ...layout,
        isBottomTabOpen: newOpen,
      },
    });
  };

  const borderColor = useColorModeValue('gray.300', 'whiteAlpha.500');
  const boldColor = useColorModeValue('wn.bold.light', 'wn.bold.dark');

  return (
    <Flex
      w="100%"
      justify="space-between"
      align="center"
      gap={1}
      px={2}
      borderBottom="1px solid"
      borderTop={hasBorder ? '1px solid' : 'none'}
      borderColor={borderColor}
      onClick={toggleBottomTab}
    >
      <Flex w="100%" gap={5} overflowX="auto" flex="1">
        <Text variant="wn" cursor="pointer" fontSize="12px" py={1}>
          Debug
        </Text>
        <Text
          variant="wn"
          cursor="pointer"
          fontSize="12px"
          color="brand.500"
          py={1}
          px={2}
          borderBottom="2px solid"
          borderBottomColor="brand.500"
        >
          Terminal
        </Text>
        <Text variant="wn" cursor="pointer" fontSize="12px" py={1}>
          Code
        </Text>
      </Flex>
      <Icon
        as={isOpen ? IoIosArrowDown : IoIosArrowUp}
        boxSize={5}
        color={boldColor}
        cursor="pointer"
        onClick={toggleBottomTab}
      />
    </Flex>
  );
};
