import React, { useCallback, useMemo, useRef } from 'react';
import { Flex, Text, Tooltip, useColorModeValue } from '@chakra-ui/react';
import { MdNumbers } from 'react-icons/md';
import { XSearch } from '@/components/layout/x/XSearch.jsx';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { VscFilterFilled } from 'react-icons/vsc';
import { useSuhufWorkspaceContext } from '@/context/SuhufWorkspaceContext.jsx';
import QuranDivisionType from '@/constants/QuranDivisionType.js';

export const QuranDivisionListContent = ({ panel }) => {
  const {
    surahs = [],
    panels = [],
    layout,
    updatePanels,
  } = useSuhufWorkspaceContext();

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

  /**
   * Derive current panel from context.
   * Ensures reactivity when layout or panels change.
   */
  const currentPanel = useMemo(() => {
    if (!layout?.isSplit) {
      return panels.find((p) => p.active);
    }
    return panels.find((p) => p.direction === panel.direction);
  }, [panels, layout?.isSplit, panel.direction]);

  const divisionNumber = currentPanel?.division?.divisionNumber || 1;

  const divisionType =
    currentPanel?.division?.divisionType || QuranDivisionType.Surah;

  const listRef = useRef(null);

  /**
   * Prevent repeated initial scrolling
   */
  const hasInitialScrolled = useRef(false);

  const ITEM_SIZE = 50;

  /**
   * Row renderer
   */
  const Row = useCallback(
    ({ index, style }) => {
      const surah = surahs[index];
      if (!surah) return null;

      const isSelected =
        divisionType === QuranDivisionType.Surah &&
        String(surah.uuid) === String(divisionNumber);

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
              borderRadius="sm"
              direction="column"
              p={1}
              onClick={(e) => {
                e.stopPropagation();

                const newPanels = panels.map((p) =>
                  p.direction === currentPanel?.direction
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
                    <Text color={iconColor}>{surah.totalAyat}</Text>
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
      divisionType,
      borderColor,
      iconColor,
      iconHoverGray,
      panels,
      currentPanel,
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
          {({ height, width }) => {
            /**
             * Perform initial scroll once height is known.
             * react-window ignores scroll commands if height is 0.
             */
            if (
              height > 0 &&
              listRef.current &&
              divisionType === QuranDivisionType.Surah &&
              !hasInitialScrolled.current
            ) {
              const index = surahs.findIndex(
                (s) => String(s.uuid) === String(divisionNumber)
              );

              if (index >= 0) {
                hasInitialScrolled.current = true;

                requestAnimationFrame(() => {
                  listRef.current?.scrollToItem(index, 'smart');
                });
              }
            }

            return (
              <List
                ref={listRef}
                height={height}
                width={width}
                itemCount={surahs.length}
                itemSize={ITEM_SIZE}
              >
                {Row}
              </List>
            );
          }}
        </AutoSizer>
      </Flex>
    </Flex>
  );
};
