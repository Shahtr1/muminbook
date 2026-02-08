import React from 'react';
import { Box, Flex, Text, Tooltip } from '@chakra-ui/react';
import { MdNumbers } from 'react-icons/md';

export const OtherDivisionRow = ({
  item,
  style,
  isSelected,
  onClick,
  borderColor,
  hoverColor,
  infoColor,
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
          p={1}
          onClick={onClick}
          justifyContent="space-between"
        >
          <Text whiteSpace="nowrap" fontSize="12px">
            {item.number}. {item.label}
          </Text>
          <Tooltip
            variant="inverted"
            placement="right"
            label={`Total ayat: ${item.totalAyat}`}
          >
            <Flex align="center" fontSize="10px" gap="2px" color={infoColor}>
              <Box display="flex" alignItems="center">
                <MdNumbers size={10} />
              </Box>

              <Text lineHeight="1">{item.totalAyat}</Text>
            </Flex>
          </Tooltip>
        </Flex>
      </Flex>
    </div>
  );
};
