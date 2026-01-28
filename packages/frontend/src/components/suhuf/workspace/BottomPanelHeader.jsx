import { Flex, Icon, Text, useColorModeValue } from '@chakra-ui/react';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { useCallback } from 'react';
import { useSuhufWorkspaceContext } from '@/context/SuhufWorkspaceContext.jsx';

export const BottomPanelHeader = ({ hasBorder = false, readings = [] }) => {
  const { layout, updateLayout } = useSuhufWorkspaceContext();

  const isOpen = layout?.isBottomTabOpen || false;

  const toggleBottomTab = useCallback(() => {
    updateLayout({ isBottomTabOpen: !isOpen });
  }, [isOpen, updateLayout]);

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
      />
    </Flex>
  );
};
