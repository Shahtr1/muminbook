import React from 'react';
import { Box, Flex, Text, Tooltip } from '@chakra-ui/react';
import { MdNumbers } from 'react-icons/md';

const SurahRow = ({
  surah,
  style,
  isSelected,
  onClick,
  borderColor,
  hoverColor,
  color,
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
          direction="column"
          p={1}
          onClick={onClick}
        >
          <Flex justify="space-between" align="center">
            <Text whiteSpace="nowrap" fontSize="10px">
              {surah.uuid}. {surah.transliteration}
            </Text>

            <Text color={color} fontSize="9px">
              {surah.revelationPlace === 'mecca' ? 'Meccan' : 'Medinan'}
            </Text>
          </Flex>

          <Flex justify="space-between" align="center">
            <Tooltip label={surah.meaning} placement="right">
              <Text
                color={color}
                fontSize="9px"
                whiteSpace="nowrap"
                overflow="hidden"
                textOverflow="ellipsis"
              >
                {surah.meaning}
              </Text>
            </Tooltip>

            <Flex align="center" fontSize="10px" gap="2px">
              <Box display="flex" alignItems="center" color={color}>
                <MdNumbers size={10} />
              </Box>
              <Text color={color}>{surah.totalAyat}</Text>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </div>
  );
};

export default SurahRow;
