import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Flex,
  Spinner,
  Text,
  useBreakpointValue,
  useColorModeValue,
} from "@chakra-ui/react";
import { RdWrapperUI } from "@/components/layout/reading/ui/RdWrapperUI.jsx";
import { SurahHeader } from "@/components/layout/reading/ui/SurahHeader.jsx";
import { AyatWithMarker } from "@/components/layout/reading/AyatWithMarker.jsx";
import { useSurahs } from "@/hooks/quran/useSurahs.js";
import { useJuz } from "@/hooks/quran/useJuz.js";
import { useInView } from "react-intersection-observer";
import { useReadingDetail } from "@/hooks/reading/useReadings.js";
import { debounce, throttle } from "lodash";

export const QuranUI = ({ fileId }) => {
  const {
    data,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
  } = useReadingDetail(fileId);

  const { surahs } = useSurahs();
  const { juz } = useJuz();
  const color = useColorModeValue("text.primary", "whiteAlpha.900");
  const bgContentColor = useColorModeValue(
    "wn.bg_content.light",
    "wn.bg_content.dark",
  );
  const isSmallScreen = useBreakpointValue({ base: true, sm: false });
  const marginX = isSmallScreen ? 1 : 2;

  const scrollRef = useRef(null);
  const queryClient = useQueryClient();
  const [topAyat, setTopAyat] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const ayatElementsRef = useRef([]);

  // More precise intersection observers with thresholds
  const { ref: topRef, inView: topInView } = useInView({ threshold: 0.1 });
  const { ref: bottomRef, inView: bottomInView } = useInView({
    threshold: 0.1,
  });

  // Memoized functions with proper dependencies
  const getSurahName = useCallback(
    (surahId) => {
      const surah = surahs.find((s) => s.uuid === +surahId);
      return `${surahId}: ${surah?.transliteration || ""}`;
    },
    [surahs],
  );

  const getJuzName = useCallback(
    (juzId) => {
      const juzItem = juz.find((j) => j.uuid === +juzId);
      return `${juzId}: ${juzItem?.transliteration || ""}`;
    },
    [juz],
  );

  // Memoized rendered ayat with stable keys
  const renderedAyat = useMemo(() => {
    return data?.pages.flatMap((pageData, pageIndex) =>
      pageData.data.map((dt, index) => (
        <Box as="span" key={`${pageIndex}-${dt.uuid}`} display="inline">
          {dt.surahStart && (
            <SurahHeader rtl surah={dt.surahId} juz={dt.juzId} />
          )}
          <AyatWithMarker data={dt} />
        </Box>
      )),
    );
  }, [data]);

  // Debounced infinite scroll handler
  useEffect(() => {
    const fetchData = debounce(async () => {
      if (isFetching) return;

      setIsFetching(true);
      try {
        if (bottomInView && hasNextPage && !isFetchingNextPage) {
          await fetchNextPage();
        } else if (topInView && hasPreviousPage && !isFetchingPreviousPage) {
          await fetchPreviousPage();
        }
      } finally {
        setIsFetching(false);
      }
    }, 300);

    fetchData();
    return () => fetchData.cancel();
  }, [
    bottomInView,
    topInView,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
    isFetching,
    fetchNextPage,
    fetchPreviousPage,
  ]);

  // Optimized scroll handler with throttling and caching
  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    let lastTopAyat = null;

    // Cache ayat elements once
    if (ayatElementsRef.current.length === 0) {
      ayatElementsRef.current = Array.from(
        scrollEl.querySelectorAll("[id^='ayat-']"),
      );
    }

    const handleScroll = throttle(() => {
      window.requestAnimationFrame(() => {
        let closest = null;
        let minDist = Infinity;
        const viewportTop = scrollEl.getBoundingClientRect().top;

        for (const el of ayatElementsRef.current) {
          const rect = el.getBoundingClientRect();
          const dist = Math.abs(rect.top - viewportTop);

          if (rect.top >= viewportTop && dist < minDist) {
            minDist = dist;
            closest = el;
          }
        }

        if (closest) {
          const ayatDetails = {
            ayat: parseInt(closest.id.replace("ayat-", "")),
            surahId: closest.dataset.surahId,
            juzId: closest.dataset.juzId,
          };

          if (
            !lastTopAyat ||
            lastTopAyat.ayat !== ayatDetails.ayat ||
            lastTopAyat.surahId !== ayatDetails.surahId ||
            lastTopAyat.juzId !== ayatDetails.juzId
          ) {
            setTopAyat(ayatDetails);
            queryClient.setQueryData(["topAyat"], ayatDetails);
            lastTopAyat = ayatDetails;
          }
        }
      });
    }, 50);

    scrollEl.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => {
      handleScroll.cancel();
      scrollEl.removeEventListener("scroll", handleScroll);
      ayatElementsRef.current = [];
    };
  }, [queryClient]);

  return (
    <RdWrapperUI fileId={fileId} ref={scrollRef}>
      <Flex gap={1} direction="column" position="relative">
        {topAyat && (
          <Flex
            mx={marginX}
            mb={1}
            borderBottom="1px solid"
            borderColor={color}
            position="sticky"
            top="0"
            bgColor={bgContentColor}
            zIndex={1}
            justify="space-between"
            px={1}
            fontWeight="600"
          >
            <Text fontSize="12px">Juz {getJuzName(topAyat.juzId)}</Text>
            <Text fontSize="12px">Surah {getSurahName(topAyat.surahId)}</Text>
          </Flex>
        )}

        <Flex flex={1} px={marginX} py={1} direction="column">
          <div ref={topRef} />
          <Box
            fontFamily="ArabicFont"
            whiteSpace="normal"
            wordBreak="break-word"
            textAlign="right"
            dir="rtl"
          >
            {renderedAyat}
            {isFetchingNextPage && <Spinner size="sm" mt={2} />}
            {isFetchingPreviousPage && <Spinner size="sm" mb={2} />}
          </Box>
          <div ref={bottomRef} />
        </Flex>
      </Flex>
    </RdWrapperUI>
  );
};
