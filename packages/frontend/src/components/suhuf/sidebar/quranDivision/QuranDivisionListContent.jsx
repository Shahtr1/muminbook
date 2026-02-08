import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Box, Flex, Portal } from '@chakra-ui/react';

import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { VscFilterFilled } from 'react-icons/vsc';

import { XSearch } from '@/components/layout/x/XSearch.jsx';
import { useSuhufWorkspaceContext } from '@/context/SuhufWorkspaceContext.jsx';
import QuranDivisionType from '@/constants/QuranDivisionType.js';
import { QuranDivisionFilter } from '@/components/suhuf/sidebar/QuranDivisionFilter.jsx';
import { useClickOutside } from '@/hooks/common/useClickOutside.js';
import { useFloatingPosition } from '@/hooks/common/useFloatingPosition.js';
import JuzRow from '@/components/suhuf/sidebar/quranDivision/JuzRow.jsx';
import SurahRow from '@/components/suhuf/sidebar/quranDivision/SurahRow.jsx';
import { useSemanticColors } from '@/theme/hooks/useSemanticColors.js';
import { OtherDivisionRow } from '@/components/suhuf/sidebar/quranDivision/OtherDivisionRow.jsx';

export const QuranDivisionListContent = ({ panel }) => {
  /* =========================================================
     CONTEXT
     ========================================================= */

  /**
   * Workspace context gives us:
   * - All division datasets (surahs, juz, hizb, etc.)
   * - Current panel configuration
   * - Layout state (split / non-split)
   * - updatePanels() to persist selection changes
   */
  const {
    surahs = [],
    juzList = [],
    hizbs = [],
    manzils = [],
    rukus = [],
    panels = [],
    layout,
    updatePanels,
  } = useSuhufWorkspaceContext();

  /* =========================================================
     HEIGHT STATE (CRITICAL FOR SCROLL TIMING)
     ========================================================= */

  /**
   * AutoSizer initially renders with height = 0.
   * React-window cannot scroll correctly until it has
   * a non-zero measured height.
   *
   * We store the measured height once it becomes available.
   */
  const [listHeight, setListHeight] = useState(0);

  /* =========================================================
     COLOR MODES
     ========================================================= */

  const { border, surface, icon, text, invert } = useSemanticColors();

  const bgContentColor = surface.content;
  const infoColor = icon.default;
  const hoverColor = icon.hover;
  const borderColor = border.default;

  /* =========================================================
     DETERMINE CURRENT PANEL
     ========================================================= */

  /**
   * If layout is not split → use active panel.
   * If split → use panel matching direction.
   */
  const currentPanel = useMemo(() => {
    if (!layout?.isSplit) {
      return panels.find((p) => p.active);
    }
    return panels.find((p) => p.direction === panel.direction);
  }, [panels, layout?.isSplit, panel.direction]);

  /* =========================================================
     ACTIVE DIVISION
     ========================================================= */

  const divisionNumber = currentPanel?.division?.divisionNumber || 1;
  const divisionType =
    currentPanel?.division?.divisionType || QuranDivisionType.Surah;

  /* =========================================================
     SELECT DATASET BASED ON DIVISION TYPE
     ========================================================= */

  /**
   * Memoized to avoid recalculating on every render.
   */
  const items = useMemo(() => {
    switch (divisionType) {
      case QuranDivisionType.Surah:
        return surahs;
      case QuranDivisionType.Juz:
        return juzList;
      case QuranDivisionType.Hizb:
        return hizbs;
      case QuranDivisionType.Manzil:
        return manzils;
      case QuranDivisionType.Ruku:
        return rukus;
      default:
        return surahs;
    }
  }, [divisionType, surahs, juzList, hizbs, manzils, rukus]);

  /* =========================================================
     LIST REF (react-window imperative API)
     ========================================================= */

  const listRef = useRef(null);

  /* =========================================================
     SCROLL EFFECT
     ========================================================= */

  /**
   * This effect scrolls to the currently active division.
   *
   * It runs when:
   * - divisionNumber changes
   * - divisionType changes
   * - items array changes
   * - listHeight becomes available
   *
   * Guards prevent premature scrolling.
   */
  useEffect(() => {
    if (!listRef.current) return; // List not mounted yet
    if (!items.length) return; // No data yet
    if (!listHeight) return; // Height not measured yet

    const index = items.findIndex(
      (i) => String(i.uuid) === String(divisionNumber)
    );

    if (index >= 0) {
      listRef.current.scrollToItem(index, 'smart');
    }
  }, [divisionNumber, divisionType, items, listHeight]);

  /* =========================================================
     FILTER STATE
     ========================================================= */

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filterButtonRef = useRef(null);
  const filterPanelRef = useRef(null);

  /**
   * Positions floating filter panel.
   */
  const position = useFloatingPosition({
    anchorRef: filterButtonRef,
    isOpen: isFilterOpen,
    offset: 15,
    direction: 'right',
  });

  /**
   * Close filter when clicking outside.
   */
  useClickOutside([filterPanelRef, filterButtonRef], () =>
    setIsFilterOpen(false)
  );

  /**
   * Handles switching division type.
   * Updates workspace config.
   * Scroll effect will auto-trigger afterward.
   */
  const handleDivisionTypeChange = (type) => {
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

  /* =========================================================
     ROW RENDERER (Virtualized)
     ========================================================= */

  /**
   * Memoized row renderer for performance.
   * react-window reuses row components heavily.
   */
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

      // Render Surah-specific UI or generic row
      if (divisionType === QuranDivisionType.Surah) {
        return (
          <SurahRow
            surah={item}
            style={style}
            isSelected={isSelected}
            onClick={handleClick}
            borderColor={borderColor}
            hoverColor={hoverColor}
            infoColor={infoColor}
          />
        );
      }

      if (divisionType === QuranDivisionType.Juz) {
        return (
          <JuzRow
            item={item}
            style={style}
            isSelected={isSelected}
            onClick={handleClick}
            borderColor={borderColor}
            hoverColor={hoverColor}
            infoColor={infoColor}
          />
        );
      }

      return (
        <OtherDivisionRow
          item={item}
          style={style}
          isSelected={isSelected}
          onClick={handleClick}
          borderColor={borderColor}
          hoverColor={hoverColor}
          infoColor={infoColor}
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
      infoColor,
    ]
  );

  const ITEM_SIZE = 50;

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <>
      <Flex direction="column" w="100%" h="100%" gap={1}>
        {/* Search + Filter Header */}
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

        {/* Virtualized List */}
        <Flex flex={1}>
          <AutoSizer>
            {({ height, width }) => {
              /**
               * IMPORTANT:
               * We cannot call setState during render.
               * So we defer height capture using setTimeout.
               *
               * This avoids:
               * "Cannot update a component while rendering another component"
               */
              if (height !== listHeight && height > 0) {
                setTimeout(() => setListHeight(height), 0);
              }

              return (
                <List
                  ref={listRef}
                  height={height}
                  width={width}
                  itemCount={items.length}
                  itemSize={ITEM_SIZE}
                >
                  {Row}
                </List>
              );
            }}
          </AutoSizer>
        </Flex>
      </Flex>

      {/* Floating Filter Panel */}
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
