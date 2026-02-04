import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
  useEffect,
} from 'react';

import { Box, Flex, useColorModeValue, Portal } from '@chakra-ui/react';

import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { VscFilterFilled } from 'react-icons/vsc';

import { XSearch } from '@/components/layout/x/XSearch.jsx';
import { useSuhufWorkspaceContext } from '@/context/SuhufWorkspaceContext.jsx';
import QuranDivisionType from '@/constants/QuranDivisionType.js';
import { QuranDivisionFilter } from '@/components/suhuf/sidebar/QuranDivisionFilter.jsx';
import { useClickOutside } from '@/hooks/common/useClickOutside.js';
import { useFloatingPosition } from '@/hooks/common/useFloatingPosition.js';
import SimpleDivisionRow from '@/components/suhuf/sidebar/quranDivision/SimpleDivisionRow.jsx';
import SurahRow from '@/components/suhuf/sidebar/quranDivision/SurahRow.jsx';

export const QuranDivisionListContent = ({ panel }) => {
  const {
    surahs = [],
    juz = [],
    hizb = [],
    manzil = [],
    ruku = [],
    panels = [],
    layout,
    updatePanels,
  } = useSuhufWorkspaceContext();

  const bgContentColor = useColorModeValue(
    'wn.bg_content.light',
    'wn.bg_content.dark'
  );
  const borderColor = useColorModeValue('gray.300', 'whiteAlpha.500');
  const color = useColorModeValue('wn.icon.light', 'wn.icon.dark');
  const hoverColor = useColorModeValue(
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

  const items = useMemo(() => {
    switch (divisionType) {
      case QuranDivisionType.Surah:
        return surahs;
      case QuranDivisionType.Juz:
        return juz;
      case QuranDivisionType.Hizb:
        return hizb;
      case QuranDivisionType.Manzil:
        return manzil;
      case QuranDivisionType.Ruku:
        return ruku;
      default:
        return surahs;
    }
  }, [divisionType, surahs, juz, hizb, manzil, ruku]);

  const listRef = useRef(null);
  const hasInitialScrolled = useRef(false);

  useEffect(() => {
    if (!listRef.current) return;
    if (hasInitialScrolled.current) return;
    if (!items.length) return;

    const index = items.findIndex(
      (i) => String(i.uuid) === String(divisionNumber)
    );

    if (index >= 0) {
      hasInitialScrolled.current = true;
      requestAnimationFrame(() => {
        listRef.current?.scrollToItem(index, 'smart');
      });
    }
  }, [divisionNumber, divisionType, items]);

  const ITEM_SIZE = 50;

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

  const handleDivisionTypeChange = (type) => {
    hasInitialScrolled.current = false;

    const newPanels = panels.map((p) =>
      p.direction === currentPanel?.direction
        ? {
            ...p,
            active: true,
            division: {
              divisionType: type,
              divisionNumber: 1,
            },
          }
        : { ...p, active: false }
    );

    updatePanels(newPanels);
    setIsFilterOpen(false);
  };

  const Row = useCallback(
    ({ index, style }) => {
      const item = items[index];
      if (!item) return null;

      const isSelected = String(item.uuid) === String(divisionNumber);

      const handleClick = (e) => {
        e.stopPropagation();

        const newPanels = panels.map((p) =>
          p.direction === currentPanel?.direction
            ? {
                ...p,
                active: true,
                division: {
                  divisionType,
                  divisionNumber: item.uuid,
                },
              }
            : { ...p, active: false }
        );

        updatePanels(newPanels);
      };

      if (divisionType === QuranDivisionType.Surah) {
        return (
          <SurahRow
            surah={item}
            style={style}
            isSelected={isSelected}
            onClick={handleClick}
            borderColor={borderColor}
            hoverColor={hoverColor}
            color={color}
          />
        );
      }

      return (
        <SimpleDivisionRow
          item={item}
          style={style}
          isSelected={isSelected}
          onClick={handleClick}
          borderColor={borderColor}
          hoverColor={hoverColor}
        />
      );
    },
    [
      items,
      divisionNumber,
      divisionType,
      panels,
      currentPanel,
      updatePanels,
      borderColor,
      hoverColor,
      color,
    ]
  );

  return (
    <>
      <Flex direction="column" w="100%" h="100%" gap={1}>
        <Flex gap={1} align="center">
          <XSearch
            bgColor={bgContentColor}
            size="xs"
            expand={false}
            placeholder="Search"
          />

          <Box
            ref={filterButtonRef}
            onClick={() => setIsFilterOpen((p) => !p)}
            cursor="pointer"
          >
            <VscFilterFilled size={15} />
          </Box>
        </Flex>

        <Flex flex={1}>
          <AutoSizer>
            {({ height, width }) => (
              <List
                ref={listRef}
                height={height}
                width={width}
                itemCount={items.length}
                itemSize={ITEM_SIZE}
              >
                {Row}
              </List>
            )}
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
