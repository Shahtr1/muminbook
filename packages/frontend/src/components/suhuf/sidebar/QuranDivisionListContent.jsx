import React, { useCallback } from 'react';
import { Flex, Text, Tooltip, useColorModeValue } from '@chakra-ui/react';
import { MdNumbers } from 'react-icons/md';
import { XSearch } from '@/components/layout/x/XSearch.jsx';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { VscFilterFilled } from 'react-icons/vsc';
import { useSuhufWorkspaceContext } from '@/context/SuhufWorkspaceContext.jsx';
import QuranDivisionType from '@/constants/QuranDivisionType.js';

export const QuranDivisionListContent = ({ panel }) => {
  const { surahs = [], panels = [], updatePanels } = useSuhufWorkspaceContext();

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

  if (!panel?.division) {
    console.info('QuranDivisionListContent: panel division is undefined');
  }

  const divisionNumber = panel?.division?.divisionNumber || 1;
  const divisionType = panel?.division?.divisionType || QuranDivisionType.Surah;

  const Row = useCallback(
    ({ index, style }) => {
      const surah = surahs[index];
      if (!surah) return null;

      const isSelected =
        divisionType === QuranDivisionType.Surah &&
        surah.uuid === divisionNumber;

      return (
        <div style={style}>
          <Flex
            w="100%"
            borderBottom="1px solid"
            borderColor={borderColor}
            py={1}
          >
            <Flex
              cursor="pointer"
              w="100%"
              _hover={{ bgColor: iconHoverGray }}
              bgColor={isSelected ? iconHoverGray : 'transparent'}
              onClick={(e) => {
                e.stopPropagation();
                const newPanels = panels.map((p) =>
                  p.direction === panel.direction
                    ? {
                        ...p,
                        active: true,
                        division: {
                          divisionType: QuranDivisionType.Surah,
                          divisionNumber: surah.uuid,
                        },
                      }
                    : {
                        ...p,
                        active: false,
                      }
                );
                updatePanels(newPanels);
              }}
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
                  label={`Total ayat: ${surah.totalAyat}`}
                >
                  <Flex
                    align="center"
                    color={iconColor}
                    fontSize="9px"
                    gap="1px"
                  >
                    <MdNumbers size={10} />
                    <Text>{surah.totalAyat}</Text>
                  </Flex>
                </Tooltip>
              </Flex>
            </Flex>
          </Flex>
        </div>
      );
    },
    [
      surahs,
      divisionNumber,
      borderColor,
      iconColor,
      iconHoverGray,
      panels,
      divisionType,
      updatePanels,
    ]
  );

  return (
    <Flex
      direction="column"
      py="1px"
      w="100%"
      h="100%"
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
        <VscFilterFilled size={15} style={{ cursor: 'pointer' }} />
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
