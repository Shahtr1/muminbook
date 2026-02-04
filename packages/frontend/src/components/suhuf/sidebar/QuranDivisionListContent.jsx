import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Box,
  Flex,
  Text,
  Tooltip,
  useColorModeValue,
  Portal,
} from '@chakra-ui/react';
import { MdNumbers } from 'react-icons/md';
import { XSearch } from '@/components/layout/x/XSearch.jsx';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { VscFilterFilled } from 'react-icons/vsc';
import { useSuhufWorkspaceContext } from '@/context/SuhufWorkspaceContext.jsx';
import QuranDivisionType from '@/constants/QuranDivisionType.js';
import { QuranDivisionFilter } from '@/components/suhuf/sidebar/QuranDivisionFilter.jsx';
import { useClickOutside } from '@/hooks/common/useClickOutside.js';
import { useFloatingPosition } from '@/hooks/common/useFloatingPosition.js';

export const QuranDivisionListContent = ({ panel }) => {
  const {
    surahs = [],
    juz = [],
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
  const hasInitialScrolled = useRef(false);

  const ITEM_SIZE = 50;

  /* ============================
     FILTER STATE
  ============================ */

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filterButtonRef = useRef(null);
  const filterPanelRef = useRef(null);

  const position = useFloatingPosition({
    anchorRef: filterButtonRef,
    isOpen: isFilterOpen,
    offset: 15,
    direction: 'right',
  });

  useClickOutside([filterPanelRef, filterButtonRef], () =>
    setIsFilterOpen(false)
  );

  const handleToggleFilter = () => {
    setIsFilterOpen((prev) => !prev);
  };

  const handleDivisionTypeChange = (type) => {
    const newPanels = panels.map((p) =>
      p.direction === currentPanel?.direction
        ? {
            ...p,
            active: true,
            division: {
              divisionType: type,
              divisionNumber: 1, // reset when switching type
            },
          }
        : {
            ...p,
            active: false,
          }
    );

    hasInitialScrolled.current = false; // allow re-scroll
    updatePanels(newPanels);
    setIsFilterOpen(false);
  };

  /* ============================
     ROW RENDERER
  ============================ */

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
                    fontSize="10px"
                    gap="2px"
                  >
                    <Box display="flex" alignItems="center">
                      <MdNumbers size={10} />
                    </Box>

                    <Text lineHeight="1" color={iconColor}>
                      {surah.totalAyat}
                    </Text>
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

  /* ============================
     RENDER
  ============================ */

  return (
    <>
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

          <Box
            ref={filterButtonRef}
            onClick={handleToggleFilter}
            cursor="pointer"
            display="flex"
            alignItems="center"
          >
            <VscFilterFilled size={15} />
          </Box>
        </Flex>

        <Flex flex={1}>
          <AutoSizer>
            {({ height, width }) => {
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

      {isFilterOpen && position && (
        <Portal>
          <Box
            ref={filterPanelRef}
            position="absolute"
            top={`${position.top}px`}
            left={`${position.left}px`}
            zIndex={9999}
            bg={bgContentColor}
            border="1px solid"
            borderColor={borderColor}
          >
            <QuranDivisionFilter
              value={divisionType}
              onChange={handleDivisionTypeChange}
            />
          </Box>
        </Portal>
      )}
    </>
  );
};
