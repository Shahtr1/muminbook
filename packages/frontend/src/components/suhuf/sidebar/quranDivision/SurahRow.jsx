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
          direction="column"
          p={1}
          onClick={onClick}
        >
          <Flex justify="space-between" align="center">
            <Text whiteSpace="nowrap" fontSize="10px">
              {surah.uuid}. {surah.transliteration}
            </Text>

            <Text color={infoColor} fontSize="10px">
              {surah.revelationPlace === 'mecca' ? 'Meccan' : 'Medinan'}
            </Text>
          </Flex>

          <Flex justify="space-between" align="center">
            <Tooltip variant="inverted" placement="right" label={surah.meaning}>
              <Text
                color={infoColor}
                fontSize="10px"
                whiteSpace="nowrap"
                overflow="hidden"
                textOverflow="ellipsis"
              >
                {surah.meaning}
              </Text>
            </Tooltip>

            <Tooltip
              variant="inverted"
              placement="right"
              label={`Total ayat: ${surah.totalAyat}`}
            >
              <Flex align="center" color={infoColor} fontSize="10px" gap="2px">
                <Box display="flex" alignItems="center">
                  <MdNumbers size={10} />
                </Box>

                <Text lineHeight="1" color={infoColor}>
                  {surah.totalAyat}
                </Text>
              </Flex>
            </Tooltip>
          </Flex>
        </Flex>
      </Flex>
    </div>
  );
};

export default SurahRow;
