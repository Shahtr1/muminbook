import React from 'react';
import { Flex, Text } from '@chakra-ui/react';

const SimpleDivisionRow = ({
  item,
  style,
  isSelected,
  onClick,
  borderColor,
  hoverColor,
}) => {
  return (
    <div style={style}>
      <Flex w="100%" borderBottom="1px solid" borderColor={borderColor} py={1}>
        <Flex
          cursor="pointer"
          w="100%"
          _hover={{ bgColor: hoverColor }}
          bgColor={isSelected ? hoverColor : 'transparent'}
          borderRadius="sm"
          align="center"
          p={2}
          onClick={onClick}
        >
          <Text fontSize="10px">
            {item.uuid}. {item.transliteration || item.name || item.label}
          </Text>
        </Flex>
      </Flex>
    </div>
  );
};

export default SimpleDivisionRow;
