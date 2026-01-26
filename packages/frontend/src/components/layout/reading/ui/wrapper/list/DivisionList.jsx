import React from 'react';
import { useSurahs } from '@/hooks/quran/useSurahs.js';
import { Flex, Text, Tooltip, useColorModeValue } from '@chakra-ui/react';
import { MdNumbers } from 'react-icons/md';
import { XSearch } from '@/components/layout/xcomp/XSearch.jsx';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Loader } from '@/components/layout/Loader.jsx';
import { SomethingWentWrong } from '@/components/layout/SomethingWentWrong.jsx';
import { useCachedQueryIfPresent } from '@/hooks/useCachedQueryIfPresent.js';
import { VscFilter, VscFilterFilled } from 'react-icons/vsc';

export const DivisionList = () => {
  const {
    data: surahs,
    isPending,
    isError,
  } = useCachedQueryIfPresent(['surahs'], useSurahs);

  const bgContentColor = useColorModeValue(
    'wn.bg_content.light',
    'wn.bg_content.dark'
  );
  const borderColor = useColorModeValue('gray.300', 'whiteAlpha.500');
  const iconColor = useColorModeValue('wn.icon.light', 'wn.icon.dark');
  const iconHoverGray = useColorModeValue(
    'wn.icon.hover.light',
    'wn.icon.hover.dark'
  );

  const Row = ({ index, style }) => {
    const surah = surahs[index];

    return (
      <div style={style}>
        <Flex
          key={surah._id}
          w="100%"
          borderBottom="1px solid"
          borderColor={borderColor}
          py={1}
        >
          <Flex
            cursor="pointer"
            w="100%"
            _hover={{ bgColor: iconHoverGray }}
            borderRadius="sm"
            direction="column"
            p={1}
          >
            <Flex justify="space-between" align="center">
              <Text whiteSpace="nowrap" fontSize="10px">
                {surah.uuid}. {surah.transliteration}
              </Text>
              <Text color={iconColor} fontSize="9px">
                {surah.revelationPlace === 'mecca' ? 'Meccan' : 'Medinan'}
              </Text>
            </Flex>
            <Flex justify="space-between" align="center">
              <Tooltip
                variant="inverted"
                placement="right"
                label={surah.meaning}
              >
                <Text
                  color={iconColor}
                  fontSize="9px"
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
                label={`Total ayats: ${surah.totalAyats}`}
              >
                <Flex align="center" color={iconColor} fontSize="9px" gap="1px">
                  <MdNumbers size={10} />
                  <Text color={iconColor}>{surah.totalAyats}</Text>
                </Flex>
              </Tooltip>
            </Flex>
          </Flex>
        </Flex>
      </div>
    );
  };

  if (isPending) return <Loader />;
  if (isError) return <SomethingWentWrong transparent />;

  return (
    <Flex
      direction="column"
      py="1px"
      w="100%"
      h="100%"
      overflowY="auto"
      gap={1}
      position="relative"
    >
      <Flex gap={1} align="center">
        <XSearch
          bgColor={bgContentColor}
          size="xs"
          expand={false}
          placeholder="Surahs"
        />
        <VscFilterFilled size={15} />
      </Flex>

      <Flex flex={1}>
        <AutoSizer>
          {({ height, width }) => (
            <List
              height={height}
              width={width}
              itemCount={surahs.length}
              itemSize={50}
            >
              {Row}
            </List>
          )}
        </AutoSizer>
      </Flex>
    </Flex>
  );
};
